import { auth } from '@core/auth/better-auth';
import type { AppEnvironment } from '@core/types/context.types';
import { sendCreated, sendSuccess } from '@core/utils/response.util';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { donationsService } from './donations.service';
import { createDonationSchema } from './pakasir.types';

export const donationsController = new Hono<AppEnvironment>();

donationsController.post('/qris', zValidator('json', createDonationSchema), async (c) => {
  const body = c.req.valid('json');
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  const donation = await donationsService.createQrPayment(
    {
      ...body,
      donorName: session?.user.name || body.donorName,
      donorEmail: session?.user.email || body.donorEmail,
    },
    session?.user.id
  );
  return sendCreated(c, donation, 'Donation QRIS transaction created');
});

donationsController.post('/simulate', zValidator('json', createDonationSchema), async (c) => {
  const body = c.req.valid('json');
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  const donation = await donationsService.createSimulatedDonation(
    {
      ...body,
      donorName: session?.user.name || body.donorName,
      donorEmail: session?.user.email || body.donorEmail,
    },
    session?.user.id
  );
  return sendCreated(c, donation, 'Simulated donation processed successfully');
});

donationsController.get('/recent', async (c) => {
  const limit = Math.min(Number(c.req.query('limit')) || 20, 100);
  const list = await donationsService.listRecent(limit);
  return sendSuccess(c, list, 'Recent donations retrieved');
});

donationsController.get('/qris/:orderId', async (c) => {
  const orderId = c.req.param('orderId');
  const donation = await donationsService.getPaymentStatus(orderId);
  return sendSuccess(c, donation, 'Donation payment status retrieved');
});
