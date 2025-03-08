import { Platform } from '@shared/types';
import { apiRequest } from './queryClient';

const WS_PATH = '/ws-interview';

export class PlatformConnection {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;

  constructor() {
    this.sessionId = Math.random().toString(36).substring(7);
  }

  async checkRequiresCredentials(platform: Platform): Promise<boolean> {
    try {
      const response = await apiRequest('POST', '/api/platform/check-requirements', {
        platform
      });
      const data = await response.json();
      return data.requiresCredentials || false;
    } catch (error) {
      console.error('Failed to check platform requirements:', error);
      return false;
    }
  }

  async connect(platform: Platform, config: any) {
    try {
      console.log('Connecting to platform:', platform);

      // First connect to the platform via REST API
      await apiRequest('POST', '/api/platform/connect', {
        platform,
        config,
        sessionId: this.sessionId
      });

      // Then establish WebSocket connection
      await this.setupWebSocket(platform, config);
    } catch (error) {
      console.error('Failed to connect to platform:', error);
      throw error;
    }
  }

  private async setupWebSocket(platform: Platform, config: any) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${WS_PATH}`;
    console.log('Setting up WebSocket connection:', wsUrl);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connection established');
      this.ws?.send(JSON.stringify({
        type: 'START_SESSION',
        platform,
        sessionId: this.sessionId,
        config
      }));

      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received WebSocket message:', message.type);

      if (message.type === 'AI_RESPONSE') {
        if (message.suggestions) {
          window.dispatchEvent(new CustomEvent('ai-suggestions', {
            detail: message.suggestions
          }));
        }
      } else if (message.type === 'ERROR') {
        console.error('WebSocket error:', message.error);
        this.handleError(message.error);
      } else if (message.type === 'CREDENTIALS_STATUS') {
        window.dispatchEvent(new CustomEvent('credentials-status', {
          detail: message.status
        }));
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
        this.reconnectAttempts++;
        const delay = 1000 * Math.pow(2, this.reconnectAttempts);
        console.log(`Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => {
          this.setupWebSocket(platform, config);
        }, delay);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handleError(error);
    };
  }

  private handleError(error: any) {
    window.dispatchEvent(new CustomEvent('platform-error', {
      detail: {
        message: error instanceof Error ? error.message : 'Connection error',
        timestamp: new Date().toISOString()
      }
    }));
  }

  async disconnect() {
    console.log('Disconnecting platform connection');
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }
}

export const platformConnection = new PlatformConnection();