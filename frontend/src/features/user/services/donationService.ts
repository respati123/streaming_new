import { apiClient } from '@core/http/api-client';

export type DonationTemplate = 'electric-lightning' | 'fire-glass';
export type DonationStatus = 'pending' | 'completed' | 'canceled' | 'expired' | 'failed';

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

export const donationService = {
  async createQrPayment(payload: {
    amount: number;
    donorName: string;
    donorEmail?: string;
    message?: string;
    template?: DonationTemplate;
  }): Promise<DonationPaymentStatus> {
    const response = await apiClient.post<{ data: DonationPaymentStatus }>(
      '/donations/qris',
      payload
    );
    return response.data.data;
  },

  async getPaymentStatus(orderId: string): Promise<DonationPaymentStatus> {
    const response = await apiClient.get<{ data: DonationPaymentStatus }>(
      `/donations/qris/${encodeURIComponent(orderId)}`
    );
    return response.data.data;
  },
};
