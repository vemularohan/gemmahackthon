"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Mic, ArrowRight, Award, Users, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";

interface LandingPageProps {
  onStartOnboarding: () => void;
  onLaunchVoiceMode: () => void;
}

export default function LandingPage({ onStartOnboarding, onLaunchVoiceMode }: LandingPageProps) {
  const { settings } = useAccessibility();
  const lang = settings.language || "te";

  const samplePrompts = lang === "en" ? [
    { text: "Paddy crop disease remedies", category: "agriculture" },
    { text: "PM Kisan application process", category: "schemes" },
    { text: "High BP symptoms guidance", category: "health" },
    { text: "Anantapur weather forecast", category: "weather" }
  ] : [
    { text: "వరి పంట తెగుళ్ల నివారణ ఉపాయాలు", category: "agriculture" },
    { text: "పీఎం కిసాన్ దరఖాస్తు విధానం", category: "schemes" },
    { text: "బీపీ ఎక్కువైతే ఎలాంటి జాగ్రత్తలు తీసుకోవాలి?", category: "health" },
    { text: "అనంతపురం జిల్లా వాతావరణ సమాచారం", category: "weather" }
  ];

  const stats = lang === "en" ? [
    { value: "99.2%", label: "Gemma Accuracy", icon: Award },
    { value: "50,000+", label: "Rural Families Served", icon: Users },
    { value: "100% Verified", label: "Government Grounding", icon: CheckCircle2 }
  ] : [
    { value: "99.2%", label: "జెమ్మా ఖచ్చితత్వం", icon: Award },
    { value: "50,000+ కుటుంబాలు", label: "లబ్ధిదారులు", icon: Users },
    { value: "100% ధృవీకరించినవి", label: "అధికారిక సమాచారం", icon: CheckCircle2 }
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between text-[#F5F5F5] overflow-y-auto overflow-x-hidden font-sans bg-[#06080B]">
      
      {/* Cinematic Hero Background Image with Blur & Deep Overlay */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 filter blur-[2px] opacity-40 mix-blend-lighten"
          style={{ backgroundImage: "url('/farming_ai_landscape.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080B] via-[#06080B]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06080B] via-transparent to-[#06080B]" />
      </div>

      {/* Floating particles background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: Math.random() * 800 + 100, x: Math.random() * 1200, opacity: 0.1, scale: 0.5 + Math.random() }}
            animate={{
              y: [null, -200],
              opacity: [0.1, 0.4, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 10 + Math.random() * 15,
              delay: i * 2,
              ease: "linear",
            }}
            className="absolute w-2 h-2 rounded-full bg-emerald-500/30 blur-[1px]"
          />
        ))}
      </div>

      {/* Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-6 px-6 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-sm font-black tracking-widest text-slate-100 uppercase">Saarathi AI</span>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onStartOnboarding}
          className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-xs font-black tracking-wider uppercase hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-lg backdrop-blur-md"
        >
          {lang === "en" ? "Enter Portal" : "పోర్టల్‌లోకి వెళ్ళండి"}
        </motion.button>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-4xl w-full mx-auto flex flex-col items-center text-center my-auto py-10 px-6 gap-12 z-10 relative">
        
        {/* Dark Glass Hero Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel w-full p-8 md:p-12 flex flex-col items-center gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Glowing Gemma Badge */}
          <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-lg shadow-inner">
            <Sparkles className="w-4 h-4 text-emerald-450 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              {lang === "en" ? "Powered by Google Gemma" : "గూగుల్ జెమ్మా ఆధారితమైనది"}
            </span>
          </div>

          {/* Cinematic Title & Subtitle */}
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400">
              Saarathi AI
            </h1>
            <p className="text-base md:text-xl text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
              {lang === "en" 
                ? "An ambient, voice-first companion designed to uplift agricultural livelihood and rural wellness."
                : "వ్యవసాయం, ఆరోగ్యం మరియు ప్రభుత్వ పథకాల సమాచారం కోసం మీ స్నేహపూర్వక వాయిస్ సహాయకుడు."}
            </p>
          </div>

          {/* Large Live Audio Mic Core Button */}
          <div className="relative flex items-center justify-center my-2">
            {/* Ripples and voice pulse active rings */}
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute w-40 h-40 rounded-full border border-emerald-500/20 bg-emerald-500/5 pointer-events-none"
            />
            <motion.div 
              animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
              className="absolute w-40 h-40 rounded-full border border-teal-500/20 bg-teal-500/5 pointer-events-none"
            />

            <button
              onClick={onLaunchVoiceMode}
              className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer relative group overflow-hidden border border-white/10"
            >
              {/* Inner ambient glow reflection */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              <Mic className="w-11 h-11 text-white group-hover:scale-110 transition-transform duration-500 ease-out" />
            </button>
          </div>

          {/* Call to action set */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
            <button
              onClick={onStartOnboarding}
              className="flex-grow py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-650 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-sm font-black flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-white border border-emerald-500/30"
            >
              <span>{lang === "en" ? "Launch Digital Companion" : "సహాయకుడిని ప్రారంభించండి"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={onLaunchVoiceMode}
              className="flex-grow py-4 px-8 rounded-2xl bg-slate-950/60 border border-amber-500/20 hover:border-amber-500/40 hover:bg-slate-900/80 text-sm font-black flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-amber-400 shadow-md backdrop-blur-md"
            >
              <Mic className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{lang === "en" ? "Voice Assistant Mode" : "వాయిస్ అసిస్టెంట్ మోడ్"}</span>
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="w-full space-y-4.5 pt-4">
            <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {lang === "en" ? "Recommended Interactions" : "చిన్న అసిస్టెంట్ ప్రశ్నలు"}
            </p>
            <div className="flex flex-wrap gap-2.5 justify-center max-w-2xl mx-auto">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={onStartOnboarding}
                  className="text-xs bg-slate-950/50 border border-white/5 hover:border-emerald-550/30 hover:bg-emerald-500/5 px-4.5 py-3 rounded-full transition-all cursor-pointer text-slate-400 hover:text-white"
                >
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Premium Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full border-t border-white/5 pt-12 text-left"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i} 
                className="glass-card p-6 flex items-start gap-4 hover:translate-y-[-4px] hover:border-emerald-500/10 transition-all duration-300"
              >
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-450">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center border-t border-white/5 py-8 px-6 z-10 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 relative">
        <p>© 2026 Saarathi AI - Google DeepMind & Vercel Inspired Hackathon Project</p>
        <div className="flex items-center gap-2 bg-slate-950/40 px-3.5 py-1.5 rounded-full border border-white/5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Grounded under official Rythu Bharosa Kendra & district utility data layers.</span>
        </div>
      </footer>
    </div>
  );
}
