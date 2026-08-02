"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Mic, Wheat, HeartPulse, Landmark, CloudSun, ArrowRight, HelpCircle, ShieldAlert } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";

interface LandingPageProps {
  onStartOnboarding: () => void;
  onLaunchVoiceMode: () => void;
}

export default function LandingPage({ onStartOnboarding, onLaunchVoiceMode }: LandingPageProps) {
  const { settings } = useAccessibility();
  const lang = settings.language || "te";

  const samplePrompts = lang === "en" ? [
    { text: "Is my tomato leaf diseased?", category: "agriculture" },
    { text: "Am I eligible for PM-KISAN pension?", category: "schemes" },
    { text: "What doctor to visit for severe chest pain?", category: "health" },
    { text: "Show current weather for Warangal district.", category: "weather" }
  ] : [
    { text: "టొమాటో ఆకు తెగులు నివారణ ఎలా?", category: "agriculture" },
    { text: "నేను పీఎం కిసాన్ పథకానికి అర్హుడినా?", category: "schemes" },
    { text: "ఛాతి నొప్పితో బాధపడుతుంటే ఏ డాక్టర్ని కలవాలి?", category: "health" },
    { text: "వరంగల్ జిల్లా ప్రస్తుత వాతావరణం చూపించు.", category: "weather" }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#070b13] text-white p-6 relative overflow-y-auto">
      {/* Background glow meshes */}
      <div className="absolute top-1/4 left-10 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-900 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-base font-black tracking-widest text-slate-100 uppercase">Saarathi AI</span>
        </div>
        <button
          onClick={onStartOnboarding}
          className="px-5 py-2.5 rounded-full border border-slate-800 bg-slate-900/40 text-xs font-black tracking-wider uppercase hover:bg-slate-800 transition-all cursor-pointer"
        >
          {lang === "en" ? "Enter Portal" : "పోర్టల్‌లోకి వెళ్ళండి"}
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl w-full mx-auto flex flex-col items-center text-center my-16 gap-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <span className="px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-600/10 text-xs font-black text-blue-400 uppercase tracking-widest">
            {lang === "en" ? "Google AI Hackathon 2026 Entry" : "గూగుల్ AI హ్యాకథాన్ 2026 ఎంట్రీ"}
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mt-4">
            {lang === "en" ? (
              <>
                Voice-First AI for Rural <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-sky-300">Telugu Communities</span>
              </>
            ) : (
              <>
                గ్రామీణ తెలుగు కమ్యూనిటీల కోసం <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-sky-300">వాయిస్-ఫస్ట్ AI సహాయకుడు</span>
              </>
            )}
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mt-2">
            {lang === "en" 
              ? "Bridging the digital divide. Powered by Google Gemma, Saarathi AI helps with crop disease detection, local weather advisories, healthcare guidance, and government schemes eligibility."
              : "డిజిటల్ విభజనను తొలగిస్తూ, గూగుల్ జెమ్మా సహాయంతో పంటల తెగుళ్లు, వాతావరణం, ఆరోగ్య సమస్యలు మరియు ప్రభుత్వ పథకాలకు తక్షణ సహాయం అందిస్తుంది."}
          </p>
        </motion.div>

        {/* Core CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md pt-4"
        >
          <button
            onClick={onStartOnboarding}
            className="flex-grow py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <span>{lang === "en" ? "Get Started" : "ప్రారంభించండి"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLaunchVoiceMode}
            className="flex-grow py-4 px-6 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-sm font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>{lang === "en" ? "Launch Voice Demo" : "వాయిస్ డెమో ప్రారంభించు"}</span>
          </button>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-12 text-left">
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition-all">
            <Wheat className="w-8 h-8 text-amber-500 mb-3" />
            <h3 className="font-bold text-slate-100">{lang === "en" ? "Agriculture & Disease" : "వ్యవసాయం & ఆకు తెగుళ్లు"}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {lang === "en" ? "Diagnose leaf problems by uploading crop images. Get grounded treatment rules in simple Telugu." : "పంట ఫోటోలను అప్‌లోడ్ చేసి ఆకు తెగుళ్లను గుర్తించండి. వాటి నివారణ మార్గాలను తెలుగులో పొందండి."}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition-all">
            <HeartPulse className="w-8 h-8 text-rose-500 mb-3" />
            <h3 className="font-bold text-slate-100">{lang === "en" ? "Healthcare & Advisories" : "ఆరోగ్యం & అత్యవసర సేవలు"}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {lang === "en" ? "Understand symptoms with strict health disclaimers. Immediate district hospitals referral & emergency helplines." : "లక్షణాలను సులభంగా అర్థం చేసుకోండి. ఆసుపత్రి వివరాలు మరియు అత్యవసర హెల్ప్‌లైన్ నంబర్లు."}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition-all">
            <Landmark className="w-8 h-8 text-sky-500 mb-3" />
            <h3 className="font-bold text-slate-100">{lang === "en" ? "Welfare & Eligibility" : "ప్రభుత్వ పథకాల అర్హత"}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {lang === "en" ? "Check pension, welfare, and housing scheme eligibility automatically based on farmer details." : "వయస్సు, వార్షిక ఆదాయం మరియు భూమి వివరాల ఆధారంగా ప్రభుత్వ పథకాల అర్హత చెక్ చేయండి."}
            </p>
          </div>
        </div>

        {/* Sample Prompts / Walkthrough */}
        <div className="w-full mt-8 border-t border-slate-900 pt-10">
          <p className="text-xs font-black tracking-widest text-slate-500 uppercase mb-4">
            {lang === "en" ? "Try These Sample Voice Prompts" : "కింది ప్రశ్నలను వాయిస్ ద్వారా అడగండి"}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={onStartOnboarding}
                className="text-xs bg-slate-900/60 border border-slate-850 hover:bg-slate-800 px-4 py-2.5 rounded-full transition-all cursor-pointer"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center border-t border-slate-900 pt-6 mt-8 z-10 text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© 2026 Saarathi AI - Google Gemma Hackathon Project</p>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Grounded in official Telangana/AP regional data layers.</span>
        </div>
      </footer>
    </div>
  );
}
