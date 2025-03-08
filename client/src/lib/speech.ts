import { useState, useEffect, useCallback } from 'react';

interface UseSpeechRecognitionProps {
  onResult: (text: string) => void;
}

export function useSpeechRecognition({ onResult }: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        setRecognition(recognition);
      } else {
        setError('Speech recognition is not supported in this browser.');
      }
    }
  }, []);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
    };

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
    };
  }, [recognition, onResult]);

  const startListening = useCallback(() => {
    if (!recognition) {
      setError('Speech recognition is not initialized.');
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError('Failed to start speech recognition.');
      setIsListening(false);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    try {
      recognition.stop();
      setIsListening(false);
    } catch (err) {
      setError('Failed to stop speech recognition.');
    }
  }, [recognition]);

  return {
    isListening,
    error,
    startListening,
    stopListening,
  };
}
