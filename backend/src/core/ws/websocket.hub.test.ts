import { describe, expect, it } from 'bun:test';
import { wsHub } from './websocket.hub';

describe('WebSocketHub Unit Tests', () => {
  it('should register and track connected clients', () => {
    const mockWs: any = {
      readyState: 1,
      send: (_data: string) => {},
    };

    wsHub.registerClient('test-client-1', mockWs, 'dashboard', '127.0.0.1');
    const stats = wsHub.getStats();

    expect(stats.totalClients).toBeGreaterThanOrEqual(1);
    const registered = stats.clients.find((c) => c.id === 'test-client-1');
    expect(registered).toBeDefined();
    expect(registered?.type).toBe('dashboard');
  });

  it('should broadcast and send messages without throwing', () => {
    let lastSentMessage = '';
    const mockWs: any = {
      readyState: 1,
      send: (data: string) => {
        lastSentMessage = data;
      },
    };

    wsHub.registerClient('test-client-2', mockWs, 'overlay', '127.0.0.1');

    const sent = wsHub.sendTo('test-client-2', 'test:event', { foo: 'bar' });
    expect(sent).toBe(true);
    expect(lastSentMessage).toContain('test:event');
    expect(lastSentMessage).toContain('bar');

    // Test broadcast
    wsHub.broadcast('system:alert', { message: 'Broadcast Alert' });
    expect(lastSentMessage).toContain('Broadcast Alert');
  });

  it('should unregister client on disconnect', () => {
    wsHub.unregisterClient('test-client-1');
    wsHub.unregisterClient('test-client-2');

    const stats = wsHub.getStats();
    expect(stats.clients.some((c) => c.id === 'test-client-1')).toBe(false);
  });
});
