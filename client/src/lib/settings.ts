import { useState, useEffect } from 'react';

interface Settings {
  responseStyle: 'concise' | 'detailed';
  preparationMode: boolean;
  expertise: string[];
  provider: 'openai' | 'google';
  platform?: {
    type: 'zoom' | 'meet' | 'teams' | 'slack';
    connected: boolean;
  };
}

const DEFAULT_SETTINGS: Settings = {
  responseStyle: 'concise',
  preparationMode: false,
  expertise: [],
  provider: 'google',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;

    const stored = localStorage.getItem('interview-assistant-settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('interview-assistant-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(current => ({
      ...current,
      ...newSettings,
    }));
  };

  return {
    settings,
    updateSettings,
  };
}
