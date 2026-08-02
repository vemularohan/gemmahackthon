import { useState, useEffect, useRef } from "react";

export interface UseSpeechProps {
  onResult?: (transcript: string) => void;
  onSpeechEnd?: (finalTranscript: string) => void;
  speechRate?: number;
  speechPitch?: number;
}

export function useSpeech({ onResult, onSpeechEnd, speechRate = 1, speechPitch = 1 }: UseSpeechProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [synthesisSupported, setSynthesisSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Queue system for latency-free sentence-by-sentence reading
  const speechQueueRef = useRef<string[]>([]);
  const queueIndexRef = useRef<number>(0);
  const isPlayingQueueRef = useRef<boolean>(false);
  const currentLanguageRef = useRef<"te" | "en">("te");
  const onEndCallbackRef = useRef<(() => void) | undefined>(undefined);

  const onResultRef = useRef(onResult);
  const onSpeechEndRef = useRef(onSpeechEnd);
  const transcriptRef = useRef(transcript);
  const speechRateRef = useRef(speechRate);
  const speechPitchRef = useRef(speechPitch);

  useEffect(() => {
    onResultRef.current = onResult;
    onSpeechEndRef.current = onSpeechEnd;
  }, [onResult, onSpeechEnd]);

  useEffect(() => {
    speechRateRef.current = speechRate;
    speechPitchRef.current = speechPitch;
  }, [speechRate, speechPitch]);

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
        recObj.lang = "te-IN"; // Default Telugu (India)

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
          console.warn("Speech Recognition Error:", event.error);
          setIsListening(false);
        };

        recObj.onend = () => {
          setIsListening(false);
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
        // Pre-fetch voices
        window.speechSynthesis.getVoices();
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const startListening = (lang: "te" | "en" = "te") => {
    if (!speechSupported || !recognitionRef.current) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }
    stopSpeaking();
    
    try {
      recognitionRef.current.lang = lang === "en" ? "en-US" : "te-IN";
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Failed to start speech recognition:", e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Helper to play the next item in the speech queue
  const playNextInQueue = () => {
    if (!synthesisRef.current || !isPlayingQueueRef.current) return;

    if (queueIndexRef.current >= speechQueueRef.current.length) {
      // Completed all chunks
      setIsSpeaking(false);
      isPlayingQueueRef.current = false;
      if (onEndCallbackRef.current) {
        onEndCallbackRef.current();
      }
      return;
    }

    const chunk = speechQueueRef.current[queueIndexRef.current];
    queueIndexRef.current += 1;

    if (!chunk.trim()) {
      // Skip empty chunks
      playNextInQueue();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    utteranceRef.current = utterance;

    // Retrieve best voice for current language
    const voices = synthesisRef.current.getVoices();
    const targetLang = currentLanguageRef.current;

    let selectedVoice = null;

    if (targetLang === "en") {
      // Find premium sounding english voices
      selectedVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("siri"))
      ) || voices.find((v) => v.lang.startsWith("en"));
    } else {
      // Find telugu voices
      selectedVoice = voices.find(
        (v) =>
          v.lang.includes("te") ||
          v.name.toLowerCase().includes("telugu")
      );
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      utterance.lang = targetLang === "en" ? "en-US" : "te-IN";
    }

    // Set human voice parameters (moderate rate, natural pitch)
    const rate = targetLang === "te" ? Math.max(0.6, speechRateRef.current - 0.05) : speechRateRef.current;
    utterance.rate = rate;
    utterance.pitch = speechPitchRef.current;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      playNextInQueue();
    };

    utterance.onerror = (e) => {
      console.warn("Speech Synthesis Utterance Error:", e);
      playNextInQueue();
    };

    synthesisRef.current.speak(utterance);
  };

  // Speak text with sentence chunking for latency-free delivery and language selection
  const speak = (text: string, language: "te" | "en" = "te", onEndCallback?: () => void) => {
    if (!synthesisSupported || !synthesisRef.current) {
      console.warn("Speech synthesis is not supported in this browser.");
      return;
    }

    // Clear active synthesis and queue
    synthesisRef.current.cancel();
    isPlayingQueueRef.current = false;

    // Clean text and split by sentences
    const cleanText = text
      .replace(/[*#_`~[\]()]/g, "") // Remove markdown
      .replace(/-\s+/g, "") // Remove bullets
      .trim();

    // Split by sentence delimiters (dot, question, exclamation, devanagari/telugu danda)
    const sentences = cleanText
      .split(/(?<=[.?!।\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (sentences.length === 0) return;

    speechQueueRef.current = sentences;
    queueIndexRef.current = 0;
    isPlayingQueueRef.current = true;
    currentLanguageRef.current = language;
    onEndCallbackRef.current = onEndCallback;

    // Begin playing queue immediately
    playNextInQueue();
  };

  const stopSpeaking = () => {
    isPlayingQueueRef.current = false;
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setIsSpeaking(false);
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
