import { BrowserContext } from 'playwright';

export type Platform = 'zoom' | 'meet' | 'teams' | 'slack';

export interface PlatformCredentials {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export interface PlatformConfig {
  platform: Platform;
  meetingLink: string;
  credentials?: PlatformCredentials;
  settings?: {
    maxTokens?: number;
    responseDelay?: number;
  };
}

export interface CommunicationSession {
  platform: Platform;
  sessionId: string;
  participants: string[];
  transcript: string[];
  context?: BrowserContext;
}

export interface PlatformIntegration {
  connect(config: PlatformConfig): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(message: string): Promise<void>;
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  validateCredentials?(credentials: PlatformCredentials): Promise<boolean>;
  requiresCredentials?: boolean;
}