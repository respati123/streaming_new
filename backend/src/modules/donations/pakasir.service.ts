import { env } from '@core/config/env';
import { logger } from '@core/logger/logger';
import { z } from 'zod';
import type { PakasirPayment } from './pakasir.types';

const PAKASIR_API_URL = 'https://app.pakasir.com';
const pakasirPaymentSchema = z.object({
  project: z.string(),
  order_id: z.string(),
  amount: z.coerce.number(),
  fee: z.coerce.number().default(0),
  total_payment: z.coerce.number().default(0),
  payment_method: z.string(),
  payment_number: z.string().nullable().optional(),
  payment_url: z.string().url().nullable().optional(),
  expired_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  status: z.string().default('pending'),
});
const createPaymentResponseSchema = z.object({ payment: pakasirPaymentSchema });
const detailPaymentResponseSchema = z.object({ transaction: pakasirPaymentSchema });

export class PakasirService {
  public isConfigured(): boolean {
    return Boolean(env.PAKASIR_ENABLED && env.PAKASIR_PROJECT_SLUG && env.PAKASIR_API_KEY);
  }

  public getPaymentUrl(orderId: string, amount: number): string {
    const slug = encodeURIComponent(env.PAKASIR_PROJECT_SLUG || '');
    return `${PAKASIR_API_URL}/pay/${slug}/${amount}?order_id=${encodeURIComponent(orderId)}&qris_only=1`;
  }

  public async createQrPayment(orderId: string, amount: number): Promise<PakasirPayment> {
    const body = this.getRequestBody(orderId, amount);
    const response = await this.request('/api/transactioncreate/qris', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return createPaymentResponseSchema.parse(response).payment;
  }

  public async getTransactionDetail(orderId: string, amount: number): Promise<PakasirPayment> {
    const body = this.getRequestBody(orderId, amount);
    const query = new URLSearchParams({
      project: body.project,
      amount: String(body.amount),
      order_id: body.order_id,
      api_key: body.api_key,
    });
    const response = await this.request(`/api/transactiondetail?${query.toString()}`, {
      method: 'GET',
    });
    return detailPaymentResponseSchema.parse(response).transaction;
  }

  private getRequestBody(orderId: string, amount: number) {
    if (!this.isConfigured()) throw new Error('Pakasir is not configured');
    return {
      project: env.PAKASIR_PROJECT_SLUG as string,
      order_id: orderId,
      amount,
      api_key: env.PAKASIR_API_KEY as string,
    };
  }

  private async request(path: string, init: RequestInit): Promise<unknown> {
    const response = await fetch(`${PAKASIR_API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      logger.warn('[Pakasir] API request failed', {
        endpoint: path.split('?')[0],
        status: response.status,
      });
      throw new Error('Pakasir API request failed');
    }
    return body;
  }
}

export const pakasirService = new PakasirService();
