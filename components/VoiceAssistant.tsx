"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeech } from "@/hooks/useSpeech";
import { Mic, MicOff, X, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { t } from "@/utils/translations";

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onResponse: (userInput: string, aiResponse: string) => void;
}

export default function VoiceAssistant({ isOpen, onClose, onResponse }: VoiceAssistantProps) {
  const { settings } = useAccessibility();
  const lang = settings.language || "te";
  
  const getInitialMessage = () => {
    return lang === "en" 
      ? "Voice Matrix is ready. Tap microphone to speak."
      : "మ్యాట్రిక్స్ సిద్ధంగా ఉంది. మాట్లాడటానికి మైక్ నొక్కండి.";
  };

  const [statusMessage, setStatusMessage] = useState(getInitialMessage());

  useEffect(() => {
    setStatusMessage(getInitialMessage());
  }, [lang]);

  // Set up speech hook
  const {
    isListening,
    transcript,
    isSpeaking,
    speechSupported,
    synthesisSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeech({
    onResult: (text) => {
      if (text) {
        setStatusMessage(text);
      }
    },
    onSpeechEnd: async (finalText) => {
      if (!finalText.trim()) {
        setStatusMessage(lang === "en" ? "I couldn't hear you. Please say that again." : "నేను వినలేకపోయాను. దయచేసి మళ్ళీ చెప్పండి.");
        return;
      }
      
      setStatusMessage(lang === "en" ? "Thinking..." : "ఆలోచిస్తున్నాను...");
      
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "chat",
            messages: [{ role: "user", content: finalText }],
            language: lang,
          }),
        });

        if (!res.ok) {
          throw new Error(lang === "en" ? "A network error occurred." : "నెట్‌వర్క్ లోపం సంభవించింది.");
        }

        const data = await res.json();
        const aiText = data.result;
        setStatusMessage(aiText);
        
        // Report to parent
        onResponse(finalText, aiText);

        // Auto play speech if allowed
        if (settings.autoSpeak) {
          speak(aiText, lang);
        }
      } catch (err: any) {
        console.warn("Voice assistant fetch failed:", err?.message || err);
        setStatusMessage(lang === "en" 
          ? "Sorry, a server error occurred. Please check your OpenRouter API Key." 
          : "క్షమించండి, సర్వర్ లోపం సంభవించింది. దయచేసి మీ OpenRouter API Key సరిచూసుకోండి.");
      }
    },
  });

  // Handle auto-speak toggle side effect
  useEffect(() => {
    if (!settings.autoSpeak && isSpeaking) {
      stopSpeaking();
    }
  }, [settings.autoSpeak, isSpeaking, stopSpeaking]);

  useEffect(() => {
    if (isOpen) {
      setStatusMessage(lang === "en" ? "Ready to listen. Press the microphone button below." : "మాట్లాడటానికి సిద్ధంగా ఉన్నాను. కింద మైక్రోఫోన్ బటన్ నొక్కండి.");
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen, lang]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 backdrop-blur-md p-6 text-white">
      {/* Top Header */}
      <div className="w-full max-w-2xl flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-400 tracking-wider">
            {lang === "en" ? "Saarathi Voice Assistant" : "సారథి వాయిస్ అసిస్టెంట్ (Voice Mode)"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 bg-slate-900 border border-slate-880 hover:bg-slate-800 rounded-full transition-all cursor-pointer"
          aria-label="Close voice assistant"
        >
          <X className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Speech Status & Assistant Content */}
      <div className="flex-grow flex flex-col items-center justify-center max-w-xl text-center px-4">
        {!speechSupported && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {lang === "en" 
                ? "Voice recognition is not supported in this browser. Use Chrome or Safari." 
                : "ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు సపోర్ట్ చేయదు. Chrome లేదా Safari వాడండి."}
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={statusMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-lg md:text-xl font-medium leading-relaxed text-slate-100 max-h-[300px] overflow-y-auto px-2"
          >
            {statusMessage}
          </motion.div>
        </AnimatePresence>

        {transcript && isListening && (
          <p className="text-xs text-slate-500 mt-3 animate-pulse">
            {lang === "en" ? `You said: "${transcript}"` : `మీరు అంటున్నది: "${transcript}"`}
          </p>
        )}
      </div>

      {/* Visual Animation & Control Center */}
      <div className="w-full max-w-md flex flex-col items-center gap-8 mb-8">
        {/* Voice Wave Animation */}
        <div className="h-16 flex items-center justify-center gap-1.5 w-full">
          {isListening ? (
            Array.from({ length: 9 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-blue-500 rounded-full"
                animate={{
                  height: [16, Math.max(20, Math.random() * 64), 16],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.5 + Math.random() * 0.4,
                  ease: "easeInOut",
                }}
              />
            ))
          ) : isSpeaking ? (
            Array.from({ length: 9 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-sky-400 rounded-full"
                animate={{
                  height: [16, Math.max(20, Math.random() * 40), 16],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.7 + Math.random() * 0.3,
                  ease: "easeInOut",
                }}
              />
            ))
          ) : (
            <div className="flex gap-1.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-6">
          {/* Mute/Unmute Audio */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
              }
            }}
            disabled={!isSpeaking}
            className={`p-4 rounded-full border transition-all cursor-pointer ${
              isSpeaking
                ? "bg-slate-900 border-slate-800 text-sky-400 hover:bg-slate-800"
                : "bg-slate-950 border-slate-900 text-slate-650 cursor-not-allowed"
            }`}
            title="Stop speaking"
            aria-label="Stop reading out loud"
          >
            <VolumeX className="w-5 h-5" />
          </button>

          {/* Central Mic Button */}
          <button
            onClick={isListening ? stopListening : () => startListening(lang)}
            className={`p-7 rounded-full transition-all shadow-xl cursor-pointer ${
              isListening
                ? "bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-red-600/30"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
            }`}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          {/* Status Indicator */}
          <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            <Volume2 className={`w-5 h-5 ${isSpeaking ? "text-sky-400 animate-bounce" : ""}`} />
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center font-medium">
          {isListening
            ? (lang === "en" ? "Will automatically stop when you stop speaking" : "మాట్లాడటం పూర్తయ్యాక దానంతట అదే ఆగుతుంది")
            : (lang === "en" ? "Press microphone to start speaking" : "మైక్ నొక్కి మాట్లాడటం ప్రారంభించండి")}
        </p>
      </div>
    </div>
  );
}
