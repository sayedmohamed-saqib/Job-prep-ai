import { useEffect, useState } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useSpeechRecognition } from "@/lib/speech";

interface InterviewPanelProps {
  onQuestionDetected: (question: string) => void;
}

export function InterviewPanel({ onQuestionDetected }: InterviewPanelProps) {
  const [transcript, setTranscript] = useState<string>("");
  const { isListening, error, startListening, stopListening } = useSpeechRecognition({
    onResult: (text) => {
      setTranscript(text);
      // Simple question detection
      if (text.toLowerCase().includes("?")) {
        onQuestionDetected(text);
      }
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Interview Session</h2>
        <Button
          variant={isListening ? "destructive" : "default"}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? (
            <>
              <MicOff className="mr-2 h-4 w-4" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Start Recording
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive">
          Error: {error}
        </div>
      )}

      <Card className="p-4 min-h-[200px] bg-muted">
        <p className="whitespace-pre-wrap">{transcript || "Transcript will appear here..."}</p>
      </Card>
    </div>
  );
}
