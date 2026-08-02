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
  const [continuousMode, setContinuousMode] = useState(true);
  const [wakeWordMode, setWakeWordMode] = useState(false);
  const restartListeningRef = React.useRef<((lang: "te" | "en") => void) | null>(null);

  const getInitialMessage = () => {
    return lang === "en" 
      ? "Saarathi Live Voice Mode is active. Talk now."
      : "సారథి లైవ్ వాయిస్ మోడ్ సక్రియంగా ఉంది. మాట్లాడండి.";
  };

  const [statusMessage, setStatusMessage] = useState(getInitialMessage());
  const [voiceStage, setVoiceStage] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");

  useEffect(() => {
    setStatusMessage(getInitialMessage());
  }, [lang]);

  // Set up speech hook
  const {
    isListening,
    transcript,
    isSpeaking,
    speechSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeech({
    speechRate: settings.speechRate,
    speechPitch: settings.speechPitch,
    onResult: (text) => {
      if (text) {
        setStatusMessage(text);
        setVoiceStage("listening");
      }
    },
    onSpeechEnd: async (finalText) => {
      if (!finalText.trim()) {
        setStatusMessage(lang === "en" ? "I couldn't hear you. Tap to try again." : "నేను వినలేకపోయాను. దయచేసి మళ్ళీ చెప్పండి.");
        setVoiceStage("idle");
        if (continuousMode && isOpen) {
          setTimeout(() => restartListeningRef.current?.(lang), 800);
        }
        return;
      }

      if (wakeWordMode) {
        const normalized = finalText.toLowerCase();
        const hasWakeWord = normalized.includes("saarathi") || normalized.includes("సారథి");
        if (!hasWakeWord) {
          setStatusMessage(
            lang === "en"
              ? "Wake word not detected. Say 'Saarathi' to talk."
              : "Wake word గుర్తించలేదు. కొనసాగించడానికి 'సారథి' చెప్పండి."
          );
          setVoiceStage("idle");
          if (continuousMode && isOpen) {
            setTimeout(() => restartListeningRef.current?.(lang), 800);
          }
          return;
        }
      }
      
      setStatusMessage(lang === "en" ? "Thinking..." : "ఆలోచిస్తున్నాను...");
      setVoiceStage("thinking");
      
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
            profile: {
              district: settings.district,
              state: settings.state,
              occupation: settings.occupation,
              landOwnedAcres: settings.landOwnedAcres,
            }
          }),
        });

        if (!res.ok) {
          throw new Error(lang === "en" ? "A network error occurred." : "నెట్‌వర్క్ లోపం సంభవించింది.");
        }

        const data = await res.json();
        const aiText = data.result;
        setStatusMessage(aiText);
        setVoiceStage("speaking");
        
        // Report to parent
        onResponse(finalText, aiText);

        // Auto play speech if allowed
        if (settings.autoSpeak) {
          speak(aiText, lang, () => {
            setVoiceStage("idle");
            if (continuousMode && isOpen) {
              setTimeout(() => restartListeningRef.current?.(lang), 500);
            }
          });
        } else {
          setVoiceStage("idle");
          if (continuousMode && isOpen) {
            setTimeout(() => restartListeningRef.current?.(lang), 1000);
          }
        }
      } catch (err: any) {
        console.warn("Voice assistant fetch failed:", err?.message || err);
        setStatusMessage(lang === "en" 
          ? "Sorry, a server error occurred. Please check OpenRouter Key." 
          : "క్షమించండి, సర్వర్ లోపం సంభవించింది. దయచేసి OpenRouter API Key సరిచూసుకోండి.");
        setVoiceStage("idle");
        if (continuousMode && isOpen) {
          setTimeout(() => restartListeningRef.current?.(lang), 1200);
        }
      }
    },
  });

  useEffect(() => {
    restartListeningRef.current = startListening;
  }, [startListening]);

  // Sync state stage
  useEffect(() => {
    if (isListening) {
      setVoiceStage("listening");
    } else if (isSpeaking) {
      setVoiceStage("speaking");
    } else if (voiceStage !== "thinking") {
      setVoiceStage("idle");
    }
  }, [isListening, isSpeaking]);

  // Handle auto-speak toggle side effect
  useEffect(() => {
    if (!settings.autoSpeak && isSpeaking) {
      stopSpeaking();
    }
  }, [settings.autoSpeak, isSpeaking, stopSpeaking]);

  useEffect(() => {
    if (isOpen) {
      setStatusMessage(lang === "en" ? "Ready. Talk now." : "మాట్లాడటానికి సిద్ధంగా ఉన్నాను.");
      startListening(lang);
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen, lang]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/98 backdrop-blur-2xl p-6 text-white overflow-hidden">
      
      {/* Dynamic ambient orb matching agent status (Gemini Live style) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{
            scale: voiceStage === "listening" ? [1, 1.3, 1] : voiceStage === "thinking" ? [1.1, 0.9, 1.1] : voiceStage === "speaking" ? [1.2, 1.4, 1.2] : 1,
            opacity: voiceStage === "idle" ? 0.06 : 0.22,
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className={`w-[450px] h-[450px] rounded-full blur-[110px] transition-colors duration-1000 ${
            voiceStage === "listening" ? "bg-emerald-600" :
            voiceStage === "thinking" ? "bg-amber-500" :
            voiceStage === "speaking" ? "bg-emerald-500" : "bg-teal-600"
          }`}
        />
        
        {/* Particle bubbles */}
        {voiceStage !== "idle" && (
          <div className="absolute inset-0 w-full h-full">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * 800 - 400,
                  y: 500,
                  opacity: 0.1,
                  scale: 0.5 + Math.random() * 0.5,
                }}
                animate={{
                  y: -600,
                  opacity: [0.1, 0.7, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 5 + Math.random() * 5,
                  delay: Math.random() * 2,
                  ease: "easeOut",
                }}
                className={`absolute w-3.5 h-3.5 rounded-full blur-[1px] ${
                  voiceStage === "listening" ? "bg-emerald-400/20" :
                  voiceStage === "speaking" ? "bg-emerald-400/10" : "bg-amber-400/20"
                }`}
                style={{
                  left: "50%",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Top Header */}
      <div className="w-full max-w-2xl flex items-center justify-between py-4 z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${
            voiceStage === "listening" ? "bg-emerald-500 animate-pulse" :
            voiceStage === "thinking" ? "bg-amber-500 animate-bounce" :
            voiceStage === "speaking" ? "bg-emerald-400 animate-pulse" : "bg-slate-700"
          }`} />
          <span className="text-xs font-black text-slate-400 tracking-widest uppercase">
            {lang === "en" ? "Gemma Voice Live Pipeline" : "గెమ్మా వాయిస్ పైప్‌లైన్"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-slate-900/60 border border-slate-800 hover:bg-slate-800 rounded-full transition-all cursor-pointer backdrop-blur-md"
          aria-label="Close voice assistant"
        >
          <X className="w-5 h-5 text-slate-350" />
        </button>
      </div>

      {/* Status Screen */}
      <div className="flex-grow flex flex-col items-center justify-center max-w-xl text-center px-6 z-10 relative">
        {!speechSupported && (
          <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>
              {lang === "en" 
                ? "Voice recognition requires Google Chrome or Safari browser." 
                : "వాయిస్ గుర్తింపు కోసం గూగుల్ క్రోమ్ లేదా సఫారి బ్రౌజర్ ఉపయోగించండి."}
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={statusMessage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className={`font-semibold leading-relaxed tracking-wide text-white max-h-[350px] overflow-y-auto px-4 ${
              statusMessage.length > 80 ? "text-sm md:text-base text-slate-300" : "text-xl md:text-2xl"
            }`}
          >
            {statusMessage}
          </motion.div>
        </AnimatePresence>

        {transcript && isListening && (
          <p className="text-xs text-emerald-450 mt-5 font-bold bg-emerald-950/40 px-4 py-1.5 rounded-full border border-emerald-900/40 animate-pulse shadow-sm">
            {lang === "en" ? `Hearing: "${transcript}"` : `వింటున్నది: "${transcript}"`}
          </p>
        )}
      </div>

      {/* Action Waveform & Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-8 mb-8 z-10 relative">
        {/* Animated Fluid SVG Waves */}
        <div className="h-20 flex items-center justify-center w-full relative">
          <svg className="absolute w-full h-full inset-0" viewBox="0 0 200 60" fill="none">
            {voiceStage === "listening" && (
              <>
                <motion.path
                  animate={{ d: ["M10,30 Q40,10 80,30 T150,30 T190,30", "M10,30 Q40,50 80,30 T150,30 T190,30", "M10,30 Q40,10 80,30 T150,30 T190,30"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  d="M10,30 Q40,20 80,30 T150,30 T190,30"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <motion.path
                  animate={{ d: ["M10,30 Q30,50 90,30 T160,30 T190,30", "M10,30 Q30,10 90,30 T160,30 T190,30", "M10,30 Q30,50 90,30 T160,30 T190,30"] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  d="M10,30 Q30,40 90,30 T160,30 T190,30"
                  stroke="#14b8a6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                />
              </>
            )}
            {voiceStage === "speaking" && (
              <>
                <motion.path
                  animate={{ d: ["M10,30 Q50,5 100,30 T190,30", "M10,30 Q50,55 100,30 T190,30", "M10,30 Q50,5 100,30 T190,30"] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  d="M10,30 Q50,15 100,30 T190,30"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <motion.path
                  animate={{ d: ["M10,30 Q60,45 110,30 T190,30", "M10,30 Q60,15 110,30 T190,30", "M10,30 Q60,45 110,30 T190,30"] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  d="M10,30 Q60,35 110,30 T190,30"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </>
            )}
            {voiceStage === "thinking" && (
              <div className="flex gap-2 justify-center items-center h-full">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" />
              </div>
            )}
            {voiceStage === "idle" && (
              <line x1="10" y1="30" x2="190" y2="30" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </div>

        {/* Action Button Set */}
        <div className="flex items-center gap-6 relative">
          {/* Cancel Synthesis / Interrupt */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
                setStatusMessage(lang === "en" ? "Interrupted. Ready for next query." : "ఆపబడింది. మాట్లాడటానికి సిద్ధంగా ఉన్నాను.");
                setVoiceStage("idle");
              }
            }}
            disabled={!isSpeaking}
            className={`p-4 rounded-full border transition-all cursor-pointer ${
              isSpeaking
                ? "bg-slate-900 border-slate-800 text-red-500 hover:bg-slate-800 hover:scale-105"
                : "bg-slate-950/40 border-slate-900 text-slate-700 cursor-not-allowed"
            }`}
            title="Interrupt AI Speech"
          >
            <VolumeX className="w-5 h-5" />
          </button>

          {/* Core Mic Button (Gemini Live style glass effect & ripples) */}
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md animate-pulse pointer-events-none scale-110" />
            )}
            <button
              onClick={isListening ? stopListening : () => startListening(lang)}
              className={`p-8 rounded-full transition-all duration-300 hover:scale-105 cursor-pointer relative z-10 border border-white/10 ${
                isListening
                  ? "bg-red-650 text-white shadow-xl shadow-red-500/20"
                  : "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-500/20"
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          {/* Quick auto-read indicator */}
          <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-450">
            <Volume2 className={`w-5 h-5 ${isSpeaking ? "text-emerald-450 animate-bounce" : ""}`} />
          </div>
        </div>

        {/* Configuration settings toggle */}
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setContinuousMode((prev) => !prev)}
            className={`rounded-xl border px-4 py-2 font-bold transition-colors cursor-pointer ${
              continuousMode ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-slate-800 bg-slate-900/60 text-slate-400"
            }`}
          >
            {lang === "en" ? "Continuous Mode" : "కొనసాగింపు మోడ్"}
          </button>
          <button
            onClick={() => setWakeWordMode((prev) => !prev)}
            className={`rounded-xl border px-4 py-2 font-bold transition-colors cursor-pointer ${
              wakeWordMode ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-slate-800 bg-slate-900/60 text-slate-400"
            }`}
          >
            {lang === "en" ? "Wake Word 'Saarathi'" : "వేక్ వర్డ్ 'సారథి'"}
          </button>
        </div>
      </div>
    </div>
  );
}
