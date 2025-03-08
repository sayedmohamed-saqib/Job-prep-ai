import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Label } from "./label";
import { Switch } from "./switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Button } from "./button";
import { Input } from "./input";
import { useSettings } from "@/lib/settings";
import { platformConnection } from "@/lib/platform-connection";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Platform } from "@shared/types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [meetingLink, setMeetingLink] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [requiresCredentials, setRequiresCredentials] = useState(false);
  const [platformType, setPlatformType] = useState<Platform | "">("");

  useEffect(() => {
    const handlePlatformError = (event: CustomEvent) => {
      toast({
        title: "Connection Error",
        description: event.detail.message,
        variant: "destructive",
      });
    };

    window.addEventListener('platform-error', handlePlatformError as EventListener);
    return () => {
      window.removeEventListener('platform-error', handlePlatformError as EventListener);
    };
  }, [toast]);

  // Check if the selected platform requires credentials
  useEffect(() => {
    async function checkRequirements() {
      if (!platformType) {
        setRequiresCredentials(false);
        return;
      }

      try {
        const needsCredentials = await platformConnection.checkRequiresCredentials(platformType);
        setRequiresCredentials(needsCredentials);
      } catch (error) {
        console.error('Failed to check platform requirements:', error);
        toast({
          title: "Error",
          description: "Failed to check platform requirements",
          variant: "destructive",
        });
      }
    }

    checkRequirements();
  }, [platformType, toast]);

  const resetForm = () => {
    setMeetingLink("");
    setClientId("");
    setClientSecret("");
    setRequiresCredentials(false);
  };

  const handlePlatformChange = (value: string) => {
    setPlatformType(value as Platform);
    updateSettings({
      platform: {
        type: value as Platform,
        connected: false
      }
    });
    resetForm();
  };

  async function handlePlatformConnect() {
    if (!platformType || !meetingLink) return;

    setIsConnecting(true);
    try {
      await platformConnection.connect(platformType, {
        meetingLink,
        credentials: requiresCredentials ? {
          clientId,
          clientSecret,
          redirectUri: window.location.origin + '/auth/callback'
        } : undefined,
        settings: {
          maxTokens: 500,
          responseDelay: 1000
        }
      });

      updateSettings({
        platform: {
          type: platformType,
          connected: true
        }
      });

      toast({
        title: "Connected",
        description: `Successfully connected to ${platformType} meeting`,
      });
    } catch (error) {
      console.error('Connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to platform",
        variant: "destructive",
      });

      updateSettings({
        platform: {
          type: platformType,
          connected: false
        }
      });
    } finally {
      setIsConnecting(false);
    }
  }

  async function handlePlatformDisconnect() {
    try {
      await platformConnection.disconnect();
      updateSettings({
        platform: {
          type: platformType,
          connected: false
        }
      });
      resetForm();

      toast({
        title: "Disconnected",
        description: `Successfully disconnected from ${platformType}`,
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect from platform",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <Select 
              value={settings.provider} 
              onValueChange={(value) => 
                updateSettings({ provider: value as 'openai' | 'google' })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google AI</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Communication Platform</Label>
            <div className="space-y-2">
              <Select 
                value={platformType}
                onValueChange={handlePlatformChange}
                disabled={settings.platform?.connected}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="meet">Google Meet</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                </SelectContent>
              </Select>

              {platformType && !settings.platform?.connected && (
                <div className="space-y-2 pt-2">
                  <Input
                    placeholder="Meeting Link"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />

                  {requiresCredentials && (
                    <>
                      <Input
                        placeholder="Client ID"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                      />
                      <Input
                        type="password"
                        placeholder="Client Secret"
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                      />
                    </>
                  )}

                  <Button 
                    className="w-full"
                    onClick={handlePlatformConnect}
                    disabled={!meetingLink || (requiresCredentials && (!clientId || !clientSecret)) || isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Join Meeting"
                    )}
                  </Button>
                </div>
              )}

              {settings.platform?.connected && (
                <Button 
                  className="w-full"
                  variant="destructive"
                  onClick={handlePlatformDisconnect}
                >
                  Leave {platformType} Meeting
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Response Style</Label>
            <Select 
              value={settings.responseStyle} 
              onValueChange={(value) => 
                updateSettings({ responseStyle: value as 'concise' | 'detailed' })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Preparation Mode</Label>
            <Switch 
              checked={settings.preparationMode}
              onCheckedChange={(checked) => 
                updateSettings({ preparationMode: checked })
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}