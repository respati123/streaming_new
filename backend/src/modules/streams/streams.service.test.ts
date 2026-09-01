import { describe, expect, it } from 'bun:test';
import { StreamsService } from './streams.service';

describe('StreamsService Unit Tests', () => {
  it('should be instantiable and expose stream session management methods', () => {
    const service = new StreamsService();
    expect(typeof service.getOrCreateActiveStream).toBe('function');
    expect(typeof service.startStream).toBe('function');
    expect(typeof service.endStream).toBe('function');
    expect(typeof service.ingestChatMessage).toBe('function');
    expect(typeof service.getStreamChatters).toBe('function');
    expect(typeof service.getStreamChats).toBe('function');
  });
});
