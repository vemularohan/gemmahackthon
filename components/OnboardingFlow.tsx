"use client";

import { useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, User, MapPin, Wheat, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { t } from "@/utils/translations";

export default function OnboardingFlow() {
  const { settings, updateSetting } = useAccessibility();
  const lang = settings.language || "te";
  const [step, setStep] = useState(1);

  if (settings.onboardingDone) {
    return null;
  }

  const occupationsList = [
    { id: "farmer", labelEn: "Farmer / Cultivator", labelTe: "రైతు / వ్యవసాయదారుడు" },
    { id: "laborer", labelEn: "Daily Wage Laborer", labelTe: "రోజువారీ కూలీ" },
    { id: "homemaker", labelEn: "Homemaker", labelTe: "గృహిణి" },
    { id: "student", labelEn: "Student", labelTe: "విద్యార్థి" },
    { id: "merchant", labelEn: "Small Business / Retailer", labelTe: "చిన్న వ్యాపారి" },
    { id: "other", labelEn: "Other Occupation", labelTe: "ఇతర వృత్తి" }
  ];

  const handleFinishOnboarding = () => {
    updateSetting("onboardingDone", true);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500 blur-sm" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-widest text-blue-500 uppercase">Saarathi AI</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            {lang === "en" ? `Step ${step} of 3` : `దశ ${step} / 3`}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: LANGUAGE */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-black text-white">
                  {lang === "en" ? "Select your primary language" : "మీ ప్రాధాన్య భాషను ఎంచుకోండి"}
                </h2>
                <p className="text-sm text-slate-400 mt-2">
                  {lang === "en" 
                    ? "Choose the language you prefer for voice assistant replies and interface screens." 
                    : "వాయిస్ సహాయకుడి సమాధానాలు మరియు అసిస్టెంట్ స్క్రీన్ల కోసం భాషను ఎంచుకోండి."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => updateSetting("language", "te")}
                  className={`flex items-center justify-between rounded-2xl border p-5 text-left transition-all ${
                    settings.language === "te"
                      ? "border-blue-500 bg-blue-500/10 text-white shadow-lg shadow-blue-500/5"
                      : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <p className="text-lg font-black">తెలుగు</p>
                    <p className="text-xs text-slate-400 mt-1">Telugu voice response default</p>
                  </div>
                  {settings.language === "te" && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
                </button>

                <button
                  onClick={() => updateSetting("language", "en")}
                  className={`flex items-center justify-between rounded-2xl border p-5 text-left transition-all ${
                    settings.language === "en"
                      ? "border-blue-500 bg-blue-500/10 text-white shadow-lg shadow-blue-500/5"
                      : "border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <p className="text-lg font-black">English</p>
                    <p className="text-xs text-slate-400 mt-1">English voice response default</p>
                  </div>
                  {settings.language === "en" && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 py-3.5 text-sm font-black text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/15 cursor-pointer"
              >
                <span>{lang === "en" ? "Continue" : "తదుపరి"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: REGION */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black text-white">
                  {lang === "en" ? "Tell us where you live" : "మీ ప్రాంతాన్ని నమోదు చేయండి"}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {lang === "en"
                    ? "This helps Saarathi provide hyper-local weather alerts, market rates, and welfare schemes."
                    : "ఇది మీకు సమీప వాతావరణ హెచ్చరికలు, మార్కెట్ ధరలు మరియు పథకాలను అందించడంలో సహాయపడుతుంది."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateSetting("state", "Telangana")}
                    className={`rounded-2xl border p-4 text-center font-bold text-sm transition-all ${
                      settings.state === "Telangana"
                        ? "border-sky-500 bg-sky-500/10 text-white"
                        : "border-slate-800 bg-slate-900/40 text-slate-400"
                    }`}
                  >
                    Telangana
                  </button>
                  <button
                    onClick={() => updateSetting("state", "Andhra Pradesh")}
                    className={`rounded-2xl border p-4 text-center font-bold text-sm transition-all ${
                      settings.state === "Andhra Pradesh"
                        ? "border-sky-500 bg-sky-500/10 text-white"
                        : "border-slate-800 bg-slate-900/40 text-slate-400"
                    }`}
                  >
                    Andhra Pradesh
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {lang === "en" ? "District" : "జిల్లా"}
                  </label>
                  <select
                    value={settings.district || "Warangal"}
                    onChange={(event) => updateSetting("district", event.target.value)}
                    className="w-full rounded-2xl border border-slate-850 bg-slate-900/70 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {settings.state === "Telangana" ? (
                      <>
                        <option value="Warangal">Warangal</option>
                        <option value="Karimnagar">Karimnagar</option>
                        <option value="Nalgonda">Nalgonda</option>
                        <option value="Khammam">Khammam</option>
                        <option value="Nizamabad">Nizamabad</option>
                        <option value="Mahabubnagar">Mahabubnagar</option>
                        <option value="Medak">Medak</option>
                        <option value="Adilabad">Adilabad</option>
                        <option value="Suryapet">Suryapet</option>
                      </>
                    ) : (
                      <>
                        <option value="Guntur">Guntur</option>
                        <option value="Krishna">Krishna</option>
                        <option value="Anantapur">Anantapur</option>
                        <option value="East Godavari">East Godavari</option>
                        <option value="West Godavari">West Godavari</option>
                        <option value="Chittoor">Chittoor</option>
                        <option value="Kurnool">Kurnool</option>
                        <option value="Kadapa">Kadapa</option>
                        <option value="Nellore">Nellore</option>
                        <option value="Visakhapatnam">Visakhapatnam</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 rounded-2xl border border-slate-800 hover:bg-slate-900 py-3.5 text-sm font-bold text-slate-300 cursor-pointer"
                >
                  {lang === "en" ? "Back" : "వెనుకకు"}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="w-2/3 rounded-2xl bg-blue-600 hover:bg-blue-500 py-3.5 text-sm font-black text-white flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{lang === "en" ? "Continue" : "తదుపరి"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: OCCUPATION */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black text-white">
                  {lang === "en" ? "Select your occupation" : "మీ వృత్తిని ఎంచుకోండి"}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {lang === "en"
                    ? "Choose your occupation and land holdings for customized farming support or schemes."
                    : "వ్యవసాయ మద్దతు మరియు పథకాల సలహాల కోసం మీ వృత్తి మరియు భూమిని నమోదు చేయండి."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                  {occupationsList.map((occ) => (
                    <button
                      key={occ.id}
                      onClick={() => updateSetting("occupation", occ.id)}
                      className={`rounded-xl border p-3.5 text-left text-xs transition-all ${
                        settings.occupation === occ.id
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-slate-850 bg-slate-900/40 text-slate-350 hover:border-slate-800"
                      }`}
                    >
                      <p className="font-bold">{lang === "en" ? occ.labelEn : occ.labelTe}</p>
                    </button>
                  ))}
                </div>

                {settings.occupation === "farmer" && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="space-y-2 pt-2"
                  >
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {lang === "en" ? "Land Owned (Acres)" : "భూమి (ఎకరాలలో)"}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={settings.landOwnedAcres}
                      onChange={(event) => updateSetting("landOwnedAcres", Number(event.target.value))}
                      placeholder="e.g. 2.5"
                      className="w-full rounded-2xl border border-slate-850 bg-slate-900/70 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </motion.div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 rounded-2xl border border-slate-800 hover:bg-slate-900 py-3.5 text-sm font-bold text-slate-300 cursor-pointer"
                >
                  {lang === "en" ? "Back" : "వెనుకకు"}
                </button>
                <button
                  onClick={handleFinishOnboarding}
                  className="w-2/3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-sm font-black text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/15 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-350" />
                  <span>{lang === "en" ? "Get Started" : "సారథి ప్రారంభించండి"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
