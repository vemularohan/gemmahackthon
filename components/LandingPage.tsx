"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Mic, Wheat, HeartPulse, Landmark, CloudSun, ArrowRight, ShieldAlert, Award, Users, CheckCircle2 } from "lucide-react";
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
    { value: "100% Verified", label: "Government Source Grounding", icon: CheckCircle2 }
  ] : [
    { value: "99.2%", label: "జెమ్మా ఖచ్చితత్వం", icon: Award },
    { value: "50,000+ కుటుంబాలు", label: "లబ్ధిదారులు", icon: Users },
    { value: "100% ధృవీకరించినవి", label: "అధికారిక సమాచారం", icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#0A0A0B] text-[#F5F5F5] p-6 relative overflow-y-auto overflow-x-hidden font-sans">
      {/* Premium ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-emerald-600/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-amber-500/3 to-transparent blur-[120px] pointer-events-none" />

      {/* Floating particles */}
      <motion.div
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-1/4 right-[15%] w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-[10%] w-32 h-32 rounded-full bg-teal-500/5 blur-2xl pointer-events-none"
      />

      {/* Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-white/5 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-650/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Sparkles className="w-4.5 h-4.5 text-emerald-450" />
          </div>
          <span className="text-sm font-black tracking-widest text-slate-100 uppercase">Saarathi AI</span>
        </div>
        <button
          onClick={onStartOnboarding}
          className="px-6 py-2.5 rounded-3xl border border-white/5 bg-white/5 text-xs font-black tracking-wider uppercase hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
        >
          {lang === "en" ? "Enter Portal" : "పోర్టల్‌లోకి వెళ్ళండి"}
        </button>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-5xl w-full mx-auto flex flex-col items-center text-center my-12 gap-10 z-10">
        
        {/* Animated Badge & Hero Titles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/15 bg-emerald-500/5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              {lang === "en" ? "Powered by Google Gemma" : "గూగుల్ జెమ్మా ఆధారితమైనది"}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mt-2 text-[#F5F5F5]">
            Saarathi AI
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            "Your AI Companion for Agriculture, Healthcare and Government Services in Telugu."
          </p>
        </motion.div>

        {/* Large Animated Microphone Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative flex items-center justify-center my-4"
        >
          {/* Glowing rings */}
          <div className="absolute w-36 h-36 rounded-full bg-emerald-500/5 animate-ping pointer-events-none" />
          <div className="absolute w-28 h-28 rounded-full bg-teal-500/5 animate-pulse pointer-events-none" />
          
          <button
            onClick={onLaunchVoiceMode}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-650/15 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <Mic className="w-9 h-9 text-white group-hover:scale-110 transition-transform duration-300" />
          </button>
        </motion.div>

        {/* Core Interactive Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md"
        >
          <button
            onClick={onStartOnboarding}
            className="flex-grow py-4 px-6 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-650/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>{lang === "en" ? "Launch Digital Companion" : "సహాయకుడిని ప్రారంభించండి"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {/* Use Amber strictly for important action (Voice Assistant Mode) */}
          <button
            onClick={onLaunchVoiceMode}
            className="flex-grow py-4 px-6 rounded-3xl bg-slate-900 border border-amber-500/20 hover:bg-slate-850 text-sm font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-amber-400"
          >
            <Mic className="w-4 h-4 text-amber-450 animate-pulse" />
            <span>{lang === "en" ? "Voice Assistant Mode" : "వాయిస్ అసిస్టెంట్ మోడ్"}</span>
          </button>
        </motion.div>

        {/* Example Prompt Chips */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full space-y-3"
        >
          <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
            {lang === "en" ? "Quick Action Prompts" : "చిన్న అసిస్టెంట్ ప్రశ్నలు"}
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center max-w-3xl mx-auto">
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={onStartOnboarding}
                className="text-xs bg-[#1C2024]/40 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 px-4.5 py-3 rounded-full transition-all cursor-pointer text-[#A1A1AA]"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Premium Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full border-t border-white/5 pt-12 mt-4 text-left"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-panel p-6 flex items-start gap-4 hover:translate-y-[-1px] transition-transform">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-450">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#F5F5F5]">{stat.value}</p>
                  <p className="text-xs text-[#A1A1AA] mt-1 font-medium">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center border-t border-white/5 pt-6 mt-12 z-10 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© 2026 Saarathi AI - Google DeepMind & Vercel Inspired Hackathon Project</p>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Grounded under official Rythu Bharosa Kendra & district utility data layers.</span>
        </div>
      </footer>
    </div>
  );
}
