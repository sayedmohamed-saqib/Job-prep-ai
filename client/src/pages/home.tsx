import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InterviewPanel } from "@/components/ui/interview-panel";
import { ResponseSuggestions } from "@/components/ui/response-suggestions";
import { SettingsDialog } from "@/components/ui/settings-dialog";
import { Settings2 } from "lucide-react";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI Interview Assistant
          </h1>
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings2 className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <InterviewPanel onQuestionDetected={setCurrentQuestion} />
          </Card>
          
          <Card className="p-4">
            <ResponseSuggestions question={currentQuestion} />
          </Card>
        </div>

        <SettingsDialog 
          open={isSettingsOpen} 
          onOpenChange={setIsSettingsOpen}
        />
      </div>
    </div>
  );
}
