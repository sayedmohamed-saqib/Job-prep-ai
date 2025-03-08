import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateResponse, type GenerateOptions } from "./lib/openai";
import { WebSocketService } from "./lib/websocket-service";
import type { Platform, PlatformConfig } from "./lib/platform-integrations/types";
import { createPlatformIntegration } from "./lib/platform-integrations/platform-factory";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wsService = new WebSocketService(httpServer);
  const platformIntegrations = new Map();

  // Error handler middleware
  const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  app.post('/api/suggestions', asyncHandler(async (req, res) => {
    const { question, options } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const generateOptions: GenerateOptions = {
      responseStyle: options?.responseStyle || 'concise',
      preparationMode: options?.preparationMode || false,
      provider: options?.provider || 'openai'
    };

    const suggestions = await generateResponse(question, generateOptions);
    res.json({ suggestions });
  }));

  app.post('/api/platform/check-requirements', asyncHandler(async (req, res) => {
    const { platform } = req.body as { platform: Platform };
    if (!platform) {
      return res.status(400).json({ error: 'Platform type is required' });
    }

    const integration = await createPlatformIntegration(platform, { platform, meetingLink: 'check' });
    res.json({ requiresCredentials: integration.requiresCredentials || false });
  }));

  app.post('/api/platform/connect', asyncHandler(async (req, res) => {
    const { platform, config, sessionId } = req.body as { 
      platform: Platform; 
      config: PlatformConfig;
      sessionId: string;
    };

    if (!platform || !config.meetingLink || !sessionId) {
      return res.status(400).json({ error: 'Missing required connection parameters' });
    }

    const integration = await createPlatformIntegration(platform, config);
    await integration.connect(config);

    // Store the integration instance for the session
    platformIntegrations.set(sessionId, integration);

    wsService.broadcastToSession(sessionId, {
      type: 'SESSION_STARTED',
      sessionId,
      platform
    });

    res.json({ status: 'connected' });
  }));

  return httpServer;
}