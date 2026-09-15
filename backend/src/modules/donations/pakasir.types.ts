import { z } from 'zod';

export const donationTemplateSchema = z.enum(['electric-lightning', 'fire-glass']);

export const createDonationSchema = z.object({
  amount: z.coerce.number().int().min(5000, 'Minimal donasi adalah Rp 5.000').max(10_000_000),
  donorName: z.string().trim().min(1).max(255).default('Anonymous'),
  donorEmail: z.string().email().max(255).optional().or(z.literal('')),
  message: z.string().trim().max(500).default(''),
  template: donationTemplateSchema.default('fire-glass'),
  isChatAi: z.boolean().optional(),
  aiPrompt: z.string().trim().max(500).optional(),
});

export type CreateDonationDTO = z.infer<typeof createDonationSchema>;
export type DonationTemplate = z.infer<typeof donationTemplateSchema>;
export type DonationStatus = 'pending' | 'completed' | 'canceled' | 'expired' | 'failed';

export interface PakasirPayment {
  project: string;
  order_id: string;
  amount: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  payment_number?: string | null;
  payment_url?: string | null;
  expired_at?: string | null;
  completed_at?: string | null;
  status: string;
}

export interface DonationPaymentStatus {
  donationId: string;
  orderId: string;
  status: DonationStatus;
  amount: number;
  fee: number | null;
  totalPayment: number | null;
  paymentMethod: string;
  qrString: string | null;
  paymentUrl: string;
  expiredAt: string | null;
  completedAt: string | null;
}
