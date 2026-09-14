import { db } from '@core/database';
import { type DonationTable, donations } from '@core/database/schema';
import { logger } from '@core/logger/logger';
import { pointsService } from '@modules/points/points.service';
import { streamerbotService } from '@modules/streamerbot/streamerbot.service';
import { streamsService } from '@modules/streams/streams.service';
import { and, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { type PakasirService, pakasirService } from './pakasir.service';
import type {
  CreateDonationDTO,
  DonationPaymentStatus,
  DonationStatus,
  PakasirPayment,
} from './pakasir.types';

export class DonationsService {
  private readonly completionLocks = new Set<string>();

  constructor(private readonly payments: PakasirService = pakasirService) {}

  public async createQrPayment(
    dto: CreateDonationDTO,
    userId?: string
  ): Promise<DonationPaymentStatus> {
    this.ensureConfigured();
    const orderId = `DON-${crypto.randomUUID()}`;
    const stream = await streamsService.getOrCreateActiveStream();
    const [donation] = await db
      .insert(donations)
      .values({
        userId: userId || null,
        streamId: stream.id,
        donorName: dto.donorName,
        donorEmail: dto.donorEmail || null,
        amount: String(dto.amount),
        currency: 'IDR',
        message: dto.message || null,
        status: 'pending',
        paymentMethod: 'qris',
        paymentOrderId: orderId,
        alertTemplate: dto.template,
      })
      .returning();

    try {
      const payment = await this.payments.createQrPayment(orderId, dto.amount);
      return this.savePayment(donation.id, payment);
    } catch (error) {
      await this.markFailed(donation.id);
      throw error;
    }
  }

  public async getPaymentStatus(orderId: string): Promise<DonationPaymentStatus> {
    const donation = await this.findByOrderId(orderId);
    if (this.isTerminal(donation) && donation.streamerbotTriggered) {
      return this.toPaymentStatus(donation);
    }
    if (donation.status === 'completed') {
      await this.fulfillCompletedDonation(donation);
      return this.toPaymentStatus(await this.findByOrderId(orderId));
    }

    const payment = await this.payments.getTransactionDetail(orderId, Number(donation.amount));
    const updated = await this.syncPaymentStatus(donation, payment);
    return this.toPaymentStatus(updated);
  }

  private ensureConfigured(): void {
    if (!this.payments.isConfigured()) {
      throw new HTTPException(503, { message: 'Pakasir QRIS is not configured.' });
    }
  }

  private async findByOrderId(orderId: string): Promise<DonationTable> {
    const donation = await db.query.donations.findFirst({
      where: eq(donations.paymentOrderId, orderId),
    });
    if (!donation) throw new HTTPException(404, { message: 'Donation transaction not found.' });
    return donation;
  }

  private async savePayment(
    donationId: string,
    payment: PakasirPayment
  ): Promise<DonationPaymentStatus> {
    const [updated] = await db
      .update(donations)
      .set(this.paymentFields(payment))
      .where(eq(donations.id, donationId))
      .returning();
    if (!updated) throw new Error('Donation transaction disappeared after QRIS creation');
    if (updated.status === 'completed') {
      await this.fulfillCompletedDonation(updated);
      return this.toPaymentStatus(await this.findByOrderId(updated.paymentOrderId || ''));
    }
    return this.toPaymentStatus(updated);
  }

  private async syncPaymentStatus(
    donation: DonationTable,
    payment: PakasirPayment
  ): Promise<DonationTable> {
    const [updated] = await db
      .update(donations)
      .set(this.paymentFields(payment, donation.paymentNumber))
      .where(eq(donations.id, donation.id))
      .returning();
    if (!updated) throw new Error('Donation transaction disappeared while checking status');
    if (updated.status === 'completed') await this.fulfillCompletedDonation(updated);
    return updated;
  }

  private paymentFields(payment: PakasirPayment, currentPaymentNumber?: string | null) {
    return {
      status: this.normalizeStatus(payment.status),
      paymentFee: String(payment.fee),
      paymentTotal: String(payment.total_payment),
      paymentNumber: payment.payment_number || currentPaymentNumber || null,
      paymentExpiredAt: this.parseDate(payment.expired_at),
      paymentCompletedAt: this.parseDate(payment.completed_at),
      updatedAt: new Date(),
    };
  }

  private async fulfillCompletedDonation(donation: DonationTable): Promise<void> {
    if (donation.streamerbotTriggered || this.completionLocks.has(donation.id)) return;
    this.completionLocks.add(donation.id);
    try {
      if (donation.userId) {
        await pointsService.awardDonationPoints(
          donation.userId,
          Number(donation.amount),
          donation.id
        );
      }
      const triggered = await streamerbotService.triggerDonationAlert({
        id: donation.id,
        donorName: donation.donorName,
        amount: Number(donation.amount),
        currency: donation.currency,
        message: donation.message || '',
        template: donation.alertTemplate as 'electric-lightning' | 'fire-glass' | undefined,
        source: 'portal_donation',
        timestamp: new Date().toISOString(),
      });
      if (!triggered)
        logger.warn('[Pakasir] Donation alert emitted locally; Streamer.bot unavailable');
      await db
        .update(donations)
        .set({
          streamerbotTriggered: true,
          streamerbotTriggeredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(donations.id, donation.id), eq(donations.streamerbotTriggered, false)));
    } finally {
      this.completionLocks.delete(donation.id);
    }
  }

  private async markFailed(donationId: string): Promise<void> {
    await db
      .update(donations)
      .set({ status: 'failed', updatedAt: new Date() })
      .where(eq(donations.id, donationId));
  }

  private toPaymentStatus(donation: DonationTable): DonationPaymentStatus {
    const amount = Number(donation.amount);
    return {
      donationId: donation.id,
      orderId: donation.paymentOrderId || '',
      status: this.normalizeStatus(donation.status),
      amount,
      fee: donation.paymentFee ? Number(donation.paymentFee) : null,
      totalPayment: donation.paymentTotal ? Number(donation.paymentTotal) : null,
      paymentMethod: donation.paymentMethod,
      qrString: donation.paymentNumber,
      paymentUrl: this.payments.getPaymentUrl(donation.paymentOrderId || '', amount),
      expiredAt: donation.paymentExpiredAt?.toISOString() || null,
      completedAt: donation.paymentCompletedAt?.toISOString() || null,
    };
  }

  private normalizeStatus(status: string): DonationStatus {
    const normalized = status.toLowerCase();
    if (normalized === 'completed') return 'completed';
    if (normalized === 'canceled' || normalized === 'cancelled') return 'canceled';
    if (normalized === 'expired') return 'expired';
    if (normalized === 'failed') return 'failed';
    return 'pending';
  }

  private isTerminal(donation: DonationTable): boolean {
    return ['completed', 'canceled', 'expired', 'failed'].includes(donation.status);
  }

  private parseDate(value?: string | null): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}

export const donationsService = new DonationsService();
