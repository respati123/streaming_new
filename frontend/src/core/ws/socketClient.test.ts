import { describe, expect, it, vi } from 'vitest';
import { StreamSocketClient } from './socketClient';

describe('StreamSocketClient Unit Tests', () => {
  it('should initialize with DISCONNECTED state and correct client type', () => {
    const client = new StreamSocketClient('dashboard');
    expect(client.getState()).toBe('DISCONNECTED');
  });

  it('should register event listener and unsubscribe properly', () => {
    const client = new StreamSocketClient('overlay');
    const mockListener = vi.fn();

    const unsubscribe = client.on('chat:message', mockListener);
    expect(typeof unsubscribe).toBe('function');

    // Simulate internal dispatch by sending event
    (client as any).dispatchEvent('chat:message', { message: 'Hello World' });
    expect(mockListener).toHaveBeenCalledWith({ message: 'Hello World' });

    unsubscribe();
    (client as any).dispatchEvent('chat:message', { message: 'After unsubscribe' });
    expect(mockListener).toHaveBeenCalledTimes(1);
  });

  it('should safely return false when sending without open connection', () => {
    const client = new StreamSocketClient('viewer');
    const result = client.send('chat:send', { text: 'Test' });
    expect(result).toBe(false);
  });
});
