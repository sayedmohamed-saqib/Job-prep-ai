import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { CommunicationSession } from './platform-integrations/types';
import { generateResponse } from './openai';
import { createPlatformIntegration } from './platform-integrations/platform-factory';

export class WebSocketService {
  private wss: WebSocketServer;
  private activeSessions: Map<string, CommunicationSession> = new Map();
  private readonly MAX_RETRIES = 3;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws-interview',
      clientTracking: true
    });

    console.log('WebSocket server initialized');

    this.wss.on('listening', () => {
      console.log('WebSocket server is listening');
    });

    this.wss.on('connection', (ws, request) => {
      console.log('New WebSocket connection established', request.url);

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('Received message:', message.type);

          switch (message.type) {
            case 'START_SESSION':
              await this.handleStartSession(ws, message);
              break;

            case 'TRANSCRIPTION':
              await this.handleTranscription(ws, message);
              break;

            case 'END_SESSION':
              await this.handleEndSession(ws, message);
              break;

            default:
              throw new Error(`Unknown message type: ${message.type}`);
          }
        } catch (error) {
          this.handleError(ws, error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });

      ws.on('error', (error) => {
        this.handleError(ws, error);
      });
    });
  }

  private async handleStartSession(ws: WebSocket, message: any) {
    try {
      const { platform, config, sessionId } = message;
      console.log('Starting session for platform:', platform);

      if (!platform || !sessionId) {
        throw new Error('Missing required session parameters');
      }

      const integration = await createPlatformIntegration(platform, config);
      const session: CommunicationSession = {
        platform,
        sessionId,
        participants: [],
        transcript: [],
        context: config.context
      };

      this.activeSessions.set(sessionId, session);
      await integration.startListening();

      console.log('Session started successfully:', sessionId);
      ws.send(JSON.stringify({
        type: 'SESSION_STARTED',
        sessionId
      }));
    } catch (error) {
      throw new Error('Failed to start session: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async handleTranscription(ws: WebSocket, message: any) {
    try {
      const currentSession = this.activeSessions.get(message.sessionId);
      if (!currentSession) {
        throw new Error('Session not found');
      }

      currentSession.transcript.push(message.text);
      console.log('Transcript received:', message.text);

      if (message.text.includes('?')) {
        console.log('Generating AI response for question');
        const suggestions = await generateResponse(message.text, {
          responseStyle: message.options?.responseStyle || 'concise',
          preparationMode: message.options?.preparationMode || false,
          provider: message.options?.provider || 'google',
          maxTokens: 500
        });

        this.broadcastToSession(message.sessionId, {
          type: 'AI_RESPONSE',
          suggestions
        });
      }
    } catch (error) {
      throw new Error('Failed to process transcription: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async handleEndSession(ws: WebSocket, message: any) {
    try {
      const session = this.activeSessions.get(message.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      console.log('Ending session:', message.sessionId);
      const integration = await createPlatformIntegration(session.platform, {
        platform: session.platform,
        meetingLink: 'disconnect' // Special case for disconnection
      });

      await integration.stopListening();
      this.activeSessions.delete(message.sessionId);
    } catch (error) {
      console.error('Error ending session:', error);
      // Don't throw here as we want to clean up regardless of errors
    }
  }

  private handleError(ws: WebSocket, error: any) {
    console.error('WebSocket error:', error);
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    } catch (e) {
      console.error('Failed to send error message:', e);
    }
  }

  public broadcastToSession(sessionId: string, message: any) {
    console.log('Broadcasting to session:', sessionId, message.type);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify(message));
        } catch (error) {
          console.error('Failed to broadcast message:', error);
        }
      }
    });
  }
}