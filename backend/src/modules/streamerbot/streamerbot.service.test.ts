import { describe, expect, it } from 'bun:test';
import { StreamerbotService } from './streamerbot.service';

describe('StreamerbotService Unit Tests', () => {
  it('should initialize with default connection status as DISCONNECTED', () => {
    const service = new StreamerbotService();
    const status = service.getStatus();

    expect(status.status).toBe('DISCONNECTED');
    expect(status.host).toBe('127.0.0.1');
    expect(status.port).toBe(8080);
    expect(status.lastConnectedAt).toBeNull();
  });

  it('should emit donation alert locally even if Streamer.bot is offline', async () => {
    const service = new StreamerbotService();
    let receivedAlert: any = null;

    service.on('donation:alert', (alert) => {
      receivedAlert = alert;
    });

    const alertData = {
      donorName: 'Testing User',
      amount: 25000,
      currency: 'IDR',
      message: 'Test donation',
      source: 'manual_test' as const,
      timestamp: new Date().toISOString(),
    };

    const isBotExecuted = await service.triggerDonationAlert(alertData);

    expect(receivedAlert).toBeDefined();
    expect(receivedAlert.donorName).toBe('Testing User');
    expect(receivedAlert.amount).toBe(25000);
    expect(isBotExecuted).toBe(false); // Because bot is not connected in unit test
  });

  it('should return error when attempting doAction while disconnected', async () => {
    const service = new StreamerbotService();
    const result = await service.doAction('Test_Action', { test: true });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Streamer.bot is currently DISCONNECTED');
  });
});
