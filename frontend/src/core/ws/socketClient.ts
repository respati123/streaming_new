import { env } from '@core/config/env';

export type SocketEventType =
  | 'system:welcome'
  | 'system:ready'
  | 'status:changed'
  | 'chat:message'
  | 'chat:send'
  | 'donation:alert'
  | 'member:new'
  | 'action:trigger'
  | 'action:result'
  | 'alert:test'
  | 'client:identify'
  | 'ping'
  | 'pong'
  | 'connection:state';

export type ConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export interface SocketMessage<T = any> {
  event: SocketEventType | string;
  data: T;
  timestamp?: string;
}

export type SocketEventListener<T = any> = (data: T) => void;

export class StreamSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners = new Map<string, Set<SocketEventListener>>();
  private state: ConnectionState = 'DISCONNECTED';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private clientType: 'dashboard' | 'overlay' | 'viewer' = 'dashboard';

  constructor(clientType: 'dashboard' | 'overlay' | 'viewer' = 'dashboard') {
    this.clientType = clientType;
    this.url = this.resolveWsUrl();
  }

  private resolveWsUrl(): string {
    try {
      if (env.VITE_WS_URL) {
        const url = new URL(env.VITE_WS_URL);
        url.searchParams.set('type', this.clientType);
        return url.toString();
      }

      const httpUrl = env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
      const parsed = new URL(httpUrl);
      const wsProtocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${parsed.host}/ws?type=${this.clientType}`;
    } catch {
      return `ws://localhost:4000/ws?type=${this.clientType}`;
    }
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setState(this.reconnectAttempts > 0 ? 'RECONNECTING' : 'CONNECTING');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setState('CONNECTED');
        this.startHeartbeat();
        this.send('client:identify', { type: this.clientType });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: SocketMessage = JSON.parse(event.data);
          this.dispatchEvent(message.event, message.data);
        } catch (err) {
          console.warn('[StreamSocketClient] Error parsing incoming message:', err);
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.setState('DISCONNECTED');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[StreamSocketClient] WebSocket error:', err);
        this.ws?.close();
      };
    } catch (err) {
      console.error('[StreamSocketClient] Failed to establish connection:', err);
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState('DISCONNECTED');
  }

  public send<T = any>(event: SocketEventType | string, data: T): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn(`[StreamSocketClient] Cannot send event '${event}': WebSocket not connected`);
      return false;
    }

    try {
      this.ws.send(
        JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        })
      );
      return true;
    } catch (err) {
      console.error(`[StreamSocketClient] Error sending '${event}':`, err);
      return false;
    }
  }

  public on<T = any>(event: SocketEventType | string, listener: SocketEventListener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      this.off(event, listener);
    };
  }

  public off(event: SocketEventType | string, listener: SocketEventListener): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  private dispatchEvent(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data);
        } catch (err) {
          console.error(`[StreamSocketClient] Error in listener for '${event}':`, err);
        }
      }
    }
  }

  private setState(newState: ConnectionState): void {
    this.state = newState;
    this.dispatchEvent('connection:state', newState);
  }

  public getState(): ConnectionState {
    return this.state;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', { time: Date.now() });
      }
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[StreamSocketClient] Max reconnection attempts reached.');
      return;
    }

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 15000);
    this.reconnectAttempts += 1;

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
}

// Global Singleton Clients for Dashboard and Overlay
export const dashboardSocket = new StreamSocketClient('dashboard');
export const overlaySocket = new StreamSocketClient('overlay');
