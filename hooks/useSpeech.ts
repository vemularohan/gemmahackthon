import { useState, useEffect, useRef } from "react";

export interface UseSpeechProps {
  onResult?: (transcript: string) => void;
  onSpeechEnd?: (finalTranscript: string) => void;
}

export function useSpeech({ onResult, onSpeechEnd }: UseSpeechProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [synthesisSupported, setSynthesisSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Use refs to store callbacks and transcript to prevent useEffect from re-running and aborting speech
  const onResultRef = useRef(onResult);
  const onSpeechEndRef = useRef(onSpeechEnd);
  const transcriptRef = useRef(transcript);

  useEffect(() => {
    onResultRef.current = onResult;
    onSpeechEndRef.current = onSpeechEnd;
  }, [onResult, onSpeechEnd]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Initialize Speech Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recObj = new SpeechRecognition();
        recObj.continuous = false;
        recObj.interimResults = true;
        recObj.lang = "te-IN"; // Telugu (India)

        recObj.onstart = () => {
          setIsListening(true);
          setTranscript("");
        };

        recObj.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          if (onResultRef.current) {
            onResultRef.current(currentTranscript);
          }
        };

        recObj.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          setIsListening(false);
        };

        recObj.onend = () => {
          setIsListening(false);
          // Trigger speech end callback with the latest transcript ref
          if (onSpeechEndRef.current) {
            onSpeechEndRef.current(transcriptRef.current);
          }
        };

        recognitionRef.current = recObj;
      }

      // 2. Initialize Speech Synthesis
      if (window.speechSynthesis) {
        setSynthesisSupported(true);
        synthesisRef.current = window.speechSynthesis;
      }
    }

    return () => {
      // Clean up recognition object on unmount only
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []); // Run only once on mount

  // Start Speech Recognition
  const startListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }
    // Stop speaking if currently speaking
    stopSpeaking();
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  };

  // Stop Speech Recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Speak Text using SpeechSynthesis
  const speak = (text: string, onEndCallback?: () => void) => {
    if (!synthesisSupported || !synthesisRef.current) {
      console.warn("Speech synthesis is not supported in this browser.");
      return;
    }

    // Cancel active synthesis before starting a new one
    synthesisRef.current.cancel();

    // Remove markdown symbols for cleaner pronunciation
    const cleanText = text
      .replace(/[*#_`~[\]()]/g, "") // Remove common markdown symbols
      .replace(/-\s+/g, "") // Remove dash bullet points
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;
    
    // Attempt to set a Telugu voice
    const voices = synthesisRef.current.getVoices();
    const teluguVoice = voices.find(
      (voice) => voice.lang.includes("te") || voice.name.toLowerCase().includes("telugu")
    );

    if (teluguVoice) {
      utterance.voice = teluguVoice;
    } else {
      // Default fallback
      utterance.lang = "te-IN";
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error:", e);
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    synthesisRef.current.speak(utterance);
  };

  // Stop Speech Synthesis
  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    isListening,
    transcript,
    isSpeaking,
    speechSupported,
    synthesisSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
