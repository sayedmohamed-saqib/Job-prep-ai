import { PlatformIntegration, Platform, PlatformConfig } from './types';
import { ZoomIntegration } from './zoom';
import { MeetIntegration } from './meet';
import { TeamsIntegration } from './teams';
import { SlackIntegration } from './slack';

const platformImplementations: Record<Platform, new () => PlatformIntegration> = {
  'zoom': ZoomIntegration,
  'meet': MeetIntegration,
  'teams': TeamsIntegration,
  'slack': SlackIntegration
};

export async function createPlatformIntegration(
  platform: Platform, 
  config: Partial<PlatformConfig>
): Promise<PlatformIntegration> {
  try {
    const PlatformClass = platformImplementations[platform];
    if (!PlatformClass) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const integration = new PlatformClass();

    // Only connect if we have full config
    if (config.meetingLink) {
      await integration.connect(config as PlatformConfig);
    }

    return integration;
  } catch (error) {
    console.error(`Failed to create platform integration for ${platform}:`, error);
    throw new Error(`Platform integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}