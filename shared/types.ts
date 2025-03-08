export type Platform = 'zoom' | 'meet' | 'teams' | 'slack';

export interface PlatformCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

export interface AIResponse {
  text: string;
  confidence: number;
}

export interface TranscriptionMessage {
  text: string;
  timestamp: string;
  speaker?: string;
}

export interface WebSocketMessage {
  type: 'START_SESSION' | 'SESSION_STARTED' | 'TRANSCRIPTION' | 'AI_RESPONSE' | 'ERROR' | 'END_SESSION';
  sessionId?: string;
  platform?: Platform;
  text?: string;
  error?: string;
  suggestions?: AIResponse[];
}
