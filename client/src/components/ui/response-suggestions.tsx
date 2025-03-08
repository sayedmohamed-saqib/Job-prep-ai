import { useEffect, useState } from "react";
import { Card } from "./card";
import { Skeleton } from "./skeleton";
import { Button } from "./button";
import { Copy, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useSettings } from "@/lib/settings";
import { useToast } from "@/hooks/use-toast";
import type { AIResponse } from "@shared/types";

interface ResponseSuggestionsProps {
  question: string;
}

export function ResponseSuggestions({ question }: ResponseSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AIResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { settings } = useSettings();
  const { toast } = useToast();

  useEffect(() => {
    async function getSuggestions() {
      if (!question) return;

      setLoading(true);
      try {
        const response = await apiRequest('POST', '/api/suggestions', { 
          question,
          options: {
            responseStyle: settings.responseStyle,
            preparationMode: settings.preparationMode,
            provider: settings.provider
          }
        });
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
        toast({
          title: "Error",
          description: "Failed to get response suggestions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    getSuggestions();
  }, [question, settings, toast]);

  // Listen for WebSocket AI responses
  useEffect(() => {
    const handleAISuggestions = (event: CustomEvent<AIResponse[]>) => {
      setSuggestions(event.detail);
    };

    window.addEventListener('ai-suggestions', handleAISuggestions as EventListener);
    return () => {
      window.removeEventListener('ai-suggestions', handleAISuggestions as EventListener);
    };
  }, []);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: "Copied",
        description: "Response copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy response",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Suggestions</h2>
        <div className="space-y-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Suggestions</h2>
      {suggestions.length > 0 ? (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start gap-2">
                <p className="flex-1">{suggestion.text}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(suggestion.text, index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Confidence: {Math.round(suggestion.confidence * 100)}%
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-4 bg-muted">
          <p className="text-muted-foreground">
            {question ? "Analyzing question..." : "Waiting for question..."}
          </p>
        </Card>
      )}
    </div>
  );
}