"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookmarkCheck,
  CloudSun,
  HeartPulse,
  Landmark,
  Mic,
  Settings as SettingsIcon,
  Sparkles,
  Trash2,
  Upload,
  Wheat,
  ArrowRight,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { authService, dbService } from "@/lib/firebase";
import { emergencyContacts, findDistrictContext } from "@/lib/local/local-context";
import AccessibilitySettings from "@/components/AccessibilitySettings";
import { useAccessibility } from "@/context/AccessibilityContext";
import { t } from "@/utils/translations";
import { PlantDiseaseResult } from "@/types/assistant";

interface DashboardProps {
  onSelectQuery: (query: string, category: string) => void;
  onNewChat: () => void;
  onLaunchVoiceMode: () => void;
}

type DashboardTab =
  | "dashboard"
  | "agriculture"
  | "health"
  | "government"
  | "weather"
  | "bookmarks"
  | "settings";

interface WeatherResult {
  place: string;
  temperatureC: number;
  rainProbability: number;
  humidity: number;
  windSpeed: number;
  farmingAdvice: string;
}

export default function Dashboard({ onSelectQuery, onLaunchVoiceMode }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [user, setUser] = useState<any | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const { settings } = useAccessibility();
  const lang = settings.language || "te";

  const [agriQuery, setAgriQuery] = useState("");
  const [healthQuery, setHealthQuery] = useState("");
  const [govQuery, setGovQuery] = useState("");

  const [weatherLocation, setWeatherLocation] = useState("");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherResult, setWeatherResult] = useState<WeatherResult | null>(null);
  const [weatherError, setWeatherError] = useState("");

  const [plantMimeType, setPlantMimeType] = useState<string | null>(null);
  const [plantImageBase64, setPlantImageBase64] = useState<string | null>(null);
  const [plantLoading, setPlantLoading] = useState(false);
  const [plantResult, setPlantResult] = useState<PlantDiseaseResult | null>(null);
  const [plantError, setPlantError] = useState("");
  const plantInputRef = useRef<HTMLInputElement>(null);

  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState("");
  const [eligibilityForm, setEligibilityForm] = useState({
    age: "",
    occupation: "",
    annualIncome: "",
    district: "",
    landOwnedAcres: "",
    gender: "",
    category: "",
  });

  useEffect(() => {
    if (settings.district) {
      setWeatherLocation(settings.district);
    }
  }, [settings.district]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        dbService.getBookmarks(currentUser.uid).then(setBookmarks);
      } else {
        setBookmarks([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteBookmark = async (bookmarkId: string) => {
    if (!user) return;
    await dbService.deleteBookmark(user.uid, bookmarkId);
    const savedBookmarks = await dbService.getBookmarks(user.uid);
    setBookmarks(savedBookmarks);
  };

  const handlePlantUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPlantMimeType(file.type);
    setPlantResult(null);
    setPlantError("");

    const reader = new FileReader();
    reader.onload = (fileEvent) => {
      const value = fileEvent.target?.result;
      if (typeof value === "string") {
        setPlantImageBase64(value);
      }
    };
    reader.readAsDataURL(file);
  };

  const analyzePlantImage = async () => {
    if (!plantImageBase64 || !plantMimeType) return;
    setPlantLoading(true);
    setPlantError("");
    try {
      const imageBase64 = plantImageBase64.split(",")[1];
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "plant-disease",
          imageBase64,
          mimeType: plantMimeType,
          language: lang,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Plant analysis failed");
      }
      setPlantResult(data.result as PlantDiseaseResult);
    } catch (error) {
      setPlantError(error instanceof Error ? error.message : "Failed to analyze plant image");
    } finally {
      setPlantLoading(false);
    }
  };

  const runEligibilityCheck = async () => {
    setEligibilityLoading(true);
    try {
      const payload = {
        age: Number(eligibilityForm.age),
        occupation: eligibilityForm.occupation,
        annualIncome: Number(eligibilityForm.annualIncome),
        district: eligibilityForm.district,
        landOwnedAcres: Number(eligibilityForm.landOwnedAcres),
        gender: eligibilityForm.gender,
        category: eligibilityForm.category,
      };
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "government-eligibility",
          input: payload,
          language: lang,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Eligibility check failed");
      }
      setEligibilityResult(data.result || "");
    } catch (error) {
      setEligibilityResult(error instanceof Error ? error.message : "Eligibility check failed");
    } finally {
      setEligibilityLoading(false);
    }
  };

  const loadWeather = async () => {
    if (!weatherLocation.trim()) return;
    setWeatherLoading(true);
    setWeatherError("");
    setWeatherResult(null);
    try {
      const response = await fetch(
        `/api/weather?location=${encodeURIComponent(weatherLocation)}&language=${lang}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Weather fetch failed");
      }
      setWeatherResult(data.result as WeatherResult);
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : "Weather fetch failed");
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12 pt-2 px-1">
      
      {/* Navigation Subheader Tabs (OS App-Bar look) */}
      <nav className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-950/60 border border-white/5 max-w-max mx-auto md:mx-0 backdrop-blur-md">
        {[
          { id: "dashboard", label: t("dashboard", lang), icon: Sparkles },
          { id: "agriculture", label: lang === "en" ? "Agriculture" : "వ్యవసాయం", icon: Wheat },
          { id: "health", label: t("health", lang), icon: HeartPulse },
          { id: "government", label: lang === "en" ? "Schemes" : "పథకాలు", icon: Landmark },
          { id: "weather", label: lang === "en" ? "Weather" : "వాతావరణం", icon: CloudSun },
          { id: "bookmarks", label: t("bookmarks", lang), icon: BookmarkCheck },
          { id: "settings", label: t("settings", lang), icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-650 text-white shadow-md shadow-emerald-500/10 border border-emerald-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* DASHBOARD GENERAL */}
      {activeTab === "dashboard" && (
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Welcome Premium Box */}
          <div className="glass-panel p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-2.5 max-w-xl text-left relative z-10">
              <span className="text-[10px] font-black text-emerald-450 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                ACTIVE OPERATING SESSION
              </span>
              <h2 className="text-3xl font-black text-white leading-tight">
                {lang === "en" ? "Saarathi AI Companion" : "సారథి AI డిజిటల్ తోడు"}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                {lang === "en"
                  ? "Welcome to Saarathi OS. Use the specialized hubs below or speak to Saarathi directly using the Live Voice interface."
                  : "సారథి OS లోకి స్వాగతం. కింది విభాగాలు చూడండి లేదా నేరుగా మాట్లాడటానికి మైక్రోఫోన్ నొక్కండి."}
              </p>
            </div>
            {/* Amber accent for voice Assistant Mode button */}
            <button
              onClick={onLaunchVoiceMode}
              className="px-6 py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-sm font-black text-white flex items-center gap-2.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 border border-amber-550/20 relative z-10"
            >
              <Mic className="h-4 w-4 text-white animate-pulse" />
              <span>{t("voiceAssistant", lang)}</span>
            </button>
          </div>

          {/* Premium Feature Split Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Agriculture module preview */}
            <div className="glass-panel p-6 flex flex-col justify-between items-start hover:border-emerald-500/20 group relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              <div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 w-11 h-11 flex items-center justify-center mb-5">
                  <Wheat className="w-5.5 h-5.5" />
                </div>
                <h3 className="text-lg font-black text-slate-100">{lang === "en" ? "Agriculture Hub" : "వ్యవసాయ కేంద్రం"}</h3>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-semibold">
                  {lang === "en" ? "Pest and crop disease warnings, market rates, and fertilizer calculations." : "ఆకు వ్యాధులు, నివారణ చికిత్సలు మరియు వ్యవసాయ సలహాల సమాచారం."}
                </p>
              </div>
              <button
                onClick={() => setActiveTab("agriculture")}
                className="mt-6 text-xs font-bold text-emerald-400 flex items-center gap-1.5 group-hover:text-emerald-350 cursor-pointer"
              >
                <span>{lang === "en" ? "Open Module" : "విభాగం తెరవండి"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>

            {/* Healthcare module preview */}
            <div className="glass-panel p-6 flex flex-col justify-between items-start hover:border-cyan-500/20 group relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
              <div>
                <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-450 w-11 h-11 flex items-center justify-center mb-5">
                  <HeartPulse className="w-5.5 h-5.5" />
                </div>
                <h3 className="text-lg font-black text-slate-100">{lang === "en" ? "Healthcare Advice" : "ఆరోగ్య సహాయం"}</h3>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-semibold">
                  {lang === "en" ? "Grounded diagnostic advice, emergency numbers, and regional hospital locators." : "ఆరోగ్య లక్షణాల మార్గదర్శకత్వం, అత్యవసర కాంటాక్టులు మరియు ఆసుపత్రి సిఫార్సులు."}
                </p>
              </div>
              <button
                onClick={() => setActiveTab("health")}
                className="mt-6 text-xs font-bold text-teal-450 flex items-center gap-1.5 group-hover:text-teal-350 cursor-pointer"
              >
                <span>{lang === "en" ? "Open Module" : "విభాగం తెరవండి"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>

            {/* Government welfare schemes preview */}
            <div className="glass-panel p-6 flex flex-col justify-between items-start hover:border-purple-500/20 group relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
              <div>
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-11 h-11 flex items-center justify-center mb-5">
                  <Landmark className="w-5.5 h-5.5" />
                </div>
                <h3 className="text-lg font-black text-slate-100">{lang === "en" ? "Welfare Schemes" : "ప్రభుత్వ పథకాలు"}</h3>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-semibold">
                  {lang === "en" ? "Eligibility check for PM Kisan, pension eligibility, and MeeSeva certifications." : "పీఎం కిసాన్, పెన్షన్ల అర్హత తనిఖీ మరియు అవసరమైన సర్టిఫికెట్ల వివరాలు."}
                </p>
              </div>
              <button
                onClick={() => setActiveTab("government")}
                className="mt-6 text-xs font-bold text-purple-400 flex items-center gap-1.5 group-hover:text-purple-300 cursor-pointer"
              >
                <span>{lang === "en" ? "Open Module" : "విభాగం తెరవండి"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Context & Utilities Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Local emergency helpline details */}
            <div className="glass-panel p-6 text-left">
              <h3 className="text-base font-black text-slate-100 mb-5">{lang === "en" ? "Emergency Helplines" : "అత్యవసర హెల్ప్‌లైన్లు"}</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">{lang === "en" ? "Ambulance" : "అంబులెన్స్"}</p>
                  <p className="text-base font-black text-red-400 mt-1">{emergencyContacts.ambulance}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-colors">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">{lang === "en" ? "Health Advice" : "ఆరోగ్య సలహా"}</p>
                  <p className="text-base font-black text-orange-400 mt-1">{emergencyContacts.healthHelpline}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-teal-500/5 border border-teal-500/10 hover:bg-teal-500/10 transition-colors">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">{lang === "en" ? "Farmer Call Center" : "రైతు హెల్ప్‌లైన్"}</p>
                  <p className="text-xs font-black text-teal-400 mt-1 truncate">{emergencyContacts.farmerCallCenter}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">{lang === "en" ? "Women Helpline" : "మహిళా రక్షణ"}</p>
                  <p className="text-base font-black text-amber-400 mt-1">{emergencyContacts.womenHelpline}</p>
                </div>
              </div>
            </div>

            {/* Hyper-local regional layers */}
            <div className="glass-panel p-6 text-left flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-100 mb-2">{lang === "en" ? "District Utility Layer" : "జిల్లా సమాచార ప్యానెల్"}</h3>
                {(() => {
                  const info = findDistrictContext(settings.district);
                  if (!info) {
                    return (
                      <p className="text-xs text-slate-400 mt-4 leading-relaxed font-semibold">
                        {lang === "en" ? "Go to Settings to configure your district and unlock local market predictions." : "స్థానిక పంటలు మరియు వాతావరణ సలహాల కోసం సెట్టింగ్స్ లో మీ జిల్లా ఎంచుకోండి."}
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2 mt-4 text-xs">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-slate-450">{lang === "en" ? "Selected District" : "ఎంచుకున్న జిల్లా"}</span>
                        <span className="font-bold text-white bg-white/5 px-2.5 py-0.5 rounded-full">{info.district} ({info.state})</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-slate-450">{lang === "en" ? "Primary Crops" : "ప్రధాన పంటలు"}</span>
                        <span className="font-bold text-emerald-450">{info.primaryCrops.join(", ")}</span>
                      </div>
                      <p className="text-slate-300 mt-3 leading-relaxed bg-[#0b0f15]/80 p-3.5 rounded-2xl border border-white/5 font-semibold text-xs">
                        {info.marketHint}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* AGRICULTURE HUB */}
      {activeTab === "agriculture" && (
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass-panel p-6 text-left space-y-5 border-l-2 border-emerald-500/20">
            <div>
              <span className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[9px] font-black uppercase text-emerald-400 tracking-widest">
                {lang === "en" ? "Agriculture Assistant" : "వ్యవసాయ సహాయకుడు"}
              </span>
              <h3 className="text-xl font-black text-slate-100 mt-3">
                {lang === "en" ? "Farming and Crop Advisories" : "వ్యవసాయ మరియు పంటల సలహాలు"}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                lang === "en" ? "Crop recommendation for current season" : "ప్రస్తుత సీజన్‌కు పంట సిఫార్సులు",
                lang === "en" ? "Pest diagnosis and treatment" : "పురుగు నిర్ధారణ మరియు చికిత్స",
                lang === "en" ? "Disease diagnosis and preventive measures" : "వ్యాధి నిర్ధారణ మరియు నివారణ",
                lang === "en" ? "Fertilizer and irrigation advice" : "ఎరువు మరియు నీరుపారుదల సలహా",
                lang === "en" ? "Market price guidance" : "మార్కెట్ ధరల మార్గదర్శనం",
                lang === "en" ? "Government agriculture schemes" : "వ్యవసాయ ప్రభుత్వ పథకాలు",
              ].map((queryText) => (
                <button
                  key={queryText}
                  onClick={() => onSelectQuery(queryText, "agriculture")}
                  className="rounded-2xl border border-white/5 bg-slate-905/30 p-4.5 text-left text-xs font-bold text-slate-300 transition-all hover:bg-emerald-500/5 hover:border-emerald-500/20 cursor-pointer"
                >
                  {queryText}
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-3">
              <textarea
                value={agriQuery}
                onChange={(event) => setAgriQuery(event.target.value)}
                className="h-28 w-full rounded-2xl border border-white/5 bg-slate-950/70 p-4.5 text-sm text-slate-100 outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
                placeholder={lang === "en" ? "Ask custom agriculture question..." : "వ్యవసాయం గురించి మీ ప్రశ్న అడగండి..."}
              />
              <button
                onClick={() => agriQuery.trim() && onSelectQuery(agriQuery, "agriculture")}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-black text-slate-950 transition cursor-pointer"
              >
                {t("submit", lang)}
              </button>
            </div>
          </div>

          {/* Plant Leaf OCR Vision Upload */}
          <div className="glass-panel p-6 border border-white/5 text-left relative overflow-hidden border-l-2 border-emerald-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <h4 className="text-base font-black text-slate-100 relative z-10">
              {lang === "en" ? "Crop Disease Vision Diagnosis" : "మొక్కల తెగుళ్ల విజువల్ గుర్తింపు"}
            </h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-semibold relative z-10">
              {lang === "en"
                ? "Upload or capture a leaf photo. Google Gemma will analyze and output disease metrics & remedies."
                : "ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి. జెమ్మా వ్యాధి నిర్ధారణ, చికిత్స మరియు నివారణ మార్గాలను విశ్లేషిస్తుంది."}
            </p>
            <input
              ref={plantInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePlantUpload}
            />
            <div className="mt-5 flex flex-wrap items-center gap-3 relative z-10">
              <button
                onClick={() => plantInputRef.current?.click()}
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/5 bg-slate-900/60 px-5 py-3 text-xs font-black text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>{lang === "en" ? "Upload / Capture Leaf" : "ఆకు ఫోటో అప్‌లోడ్ / కెమెరా"}</span>
              </button>
              <button
                onClick={analyzePlantImage}
                disabled={!plantImageBase64 || plantLoading}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"
              >
                {plantLoading ? (lang === "en" ? "Analyzing..." : "విశ్లేషిస్తోంది...") : lang === "en" ? "Analyze Leaf" : "ఆకు విశ్లేషణ"}
              </button>
            </div>

            {plantImageBase64 && (
              <div className="mt-5 max-w-xs overflow-hidden rounded-2xl border border-white/10 relative z-10 shadow-lg">
                <img src={plantImageBase64} alt="Plant preview" className="h-auto w-full object-cover" />
              </div>
            )}

            {plantError && <p className="mt-3 text-xs text-red-400 font-bold relative z-10">{plantError}</p>}

            <AnimatePresence>
              {plantResult && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-5 rounded-2xl border border-white/5 bg-slate-950/40 p-5 text-xs text-slate-350 space-y-3 relative z-10"
                >
                  <p className="text-sm">
                    <strong className="text-white">{lang === "en" ? "Disease" : "వ్యాధి"}:</strong> <span className="font-bold text-emerald-450">{plantResult.disease}</span>
                  </p>
                  <p>
                    <strong className="text-white">{lang === "en" ? "Confidence" : "నమ్మక స్థాయి"}:</strong> {Math.round(plantResult.confidence * 100)}%
                  </p>
                  
                  <div className="space-y-1.5">
                    <p className="font-bold text-white">{lang === "en" ? "Treatments" : "చికిత్స మార్గాలు"}:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {plantResult.treatments.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-bold text-white">{lang === "en" ? "Preventive Measures" : "నివారణ చర్యలు"}:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {plantResult.preventiveMeasures.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-slate-400 leading-relaxed mt-2 italic">{plantResult.teluguExplanation}</p>
                  <p className="text-amber-400/80 text-[10px] bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">{plantResult.disclaimer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {/* HEALTH HUB */}
      {activeTab === "health" && (
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 text-left space-y-5 border-l-2 border-cyan-500/20"
        >
          <div>
            <span className="px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[9px] font-black uppercase text-cyan-400 tracking-widest">
              {lang === "en" ? "Healthcare Advice" : "ఆరోగ్య సహాయం"}
            </span>
            <h3 className="text-xl font-black text-slate-100 mt-3">{t("askHealth", lang)}</h3>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-cyan-500/10 bg-cyan-950/20 p-4 text-xs text-teal-400">
            <AlertCircle className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-semibold">
              {lang === "en"
                ? "Emergency warning is enabled. Serious symptoms are always redirected to doctors/hospitals. Disclaimers are included in all responses."
                : "అత్యవసర హెచ్చరిక అమల్లో ఉంది. తీవ్రమైన ఆరోగ్య లక్షణాలకు ఎల్లప్పుడూ సమీప డాక్టర్/ఆసుపత్రి సిఫార్సు అందించబడుతుంది."}
            </p>
          </div>

          <textarea
            value={healthQuery}
            onChange={(event) => setHealthQuery(event.target.value)}
            className="h-28 w-full rounded-2xl border border-white/5 bg-slate-950/70 p-4.5 text-sm text-slate-100 outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20"
            placeholder={t("askHealthPlaceholder", lang)}
          />
          <button
            onClick={() => healthQuery.trim() && onSelectQuery(healthQuery, "health")}
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-black text-slate-950 transition cursor-pointer"
          >
            {t("submit", lang)}
          </button>
        </motion.section>
      )}

      {/* GOVERNMENT WELFARE SCHEMES */}
      {activeTab === "government" && (
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass-panel p-6 text-left space-y-5 border-l-2 border-purple-500/20">
            <div>
              <span className="px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-[9px] font-black uppercase text-purple-400 tracking-widest">
                {lang === "en" ? "Welfare Schemes" : "ప్రభుత్వ పథకాలు"}
              </span>
              <h3 className="text-xl font-black text-slate-100 mt-3">
                {lang === "en" ? "Government Scheme Assistant" : "ప్రభుత్వ పథకాల సహాయకుడు"}
              </h3>
            </div>
            <textarea
              value={govQuery}
              onChange={(event) => setGovQuery(event.target.value)}
              className="h-28 w-full rounded-2xl border border-white/5 bg-slate-950/70 p-4.5 text-sm text-slate-100 outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              placeholder={t("askGovPlaceholder", lang)}
            />
            <button
              onClick={() => govQuery.trim() && onSelectQuery(govQuery, "government")}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-black text-slate-950 transition cursor-pointer"
            >
              {t("submit", lang)}
            </button>
          </div>

          {/* Interactive Eligibility Input Fields */}
          <div className="glass-panel p-6 border border-white/5 text-left space-y-5 relative overflow-hidden border-l-2 border-purple-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div>
              <h4 className="text-base font-black text-slate-100">
                {lang === "en" ? "Welfare Scheme Eligibility Checker" : "పథకాల అర్హత తనిఖీ వ్యవస్థ"}
              </h4>
              <p className="text-xs text-slate-400 mt-1.5 font-semibold">
                {lang === "en" ? "Enter details to see PM-KISAN, pensions, or welfare benefits matches." : "మీ అర్హతలను కనుగొనడానికి వయస్సు, ఆదాయం వివరాలను నమోదు చేయండి."}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(
                [
                  ["age", lang === "en" ? "Age" : "వయస్సు"],
                  ["occupation", lang === "en" ? "Occupation (e.g. Farmer)" : "వృత్తి (ఉదా: Farmer)"],
                  ["annualIncome", lang === "en" ? "Annual Income" : "వార్షిక ఆదాయం"],
                  ["district", lang === "en" ? "District" : "జмилаా"],
                  ["landOwnedAcres", lang === "en" ? "Land owned (acres)" : "భూమి (ఎకరాలు)"],
                  ["gender", lang === "en" ? "Gender" : "లింగం"],
                  ["category", lang === "en" ? "Category (e.g. General, BC)" : "వర్గం (ఉదా: BC)"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</label>
                  <input
                    value={eligibilityForm[key]}
                    onChange={(event) =>
                      setEligibilityForm((prev) => ({ ...prev, [key]: event.target.value }))
                    }
                    placeholder={label}
                    className="rounded-xl border border-white/5 bg-slate-950/70 px-4 py-3.5 text-xs text-slate-100 outline-none focus:border-emerald-500/40"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={runEligibilityCheck}
              disabled={eligibilityLoading}
              className="px-6 py-3.5 rounded-xl bg-emerald-650 hover:bg-emerald-600 text-xs font-black text-white disabled:opacity-50 transition-colors cursor-pointer border border-emerald-500/10"
            >
              {eligibilityLoading
                ? lang === "en" ? "Analyzing Profile..." : "పరిశీలిస్తోంది..."
                : lang === "en" ? "Verify Scheme Eligibility" : "పథకాల అర్హత తనిఖీ చేయండి"}
            </button>
            <AnimatePresence>
              {eligibilityResult && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="rounded-2xl border border-white/5 bg-slate-950/60 p-4.5"
                >
                  <pre className="text-xs text-slate-300 font-semibold font-mono whitespace-pre-wrap leading-relaxed">
                    {eligibilityResult}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {/* WEATHER HUB */}
      {activeTab === "weather" && (
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 text-left space-y-5 border-l-2 border-amber-500/20"
        >
          <div>
            <span className="px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-[9px] font-black uppercase text-amber-400 tracking-widest">
              {lang === "en" ? "Weather Advisory" : "వాతావరణ వ్యవసాయ సలహా"}
            </span>
            <h3 className="text-xl font-black text-slate-100 mt-3">
              {lang === "en" ? "Live Weather Forecast" : "లైవ్ వాతావరణం మరియు సలహా"}
            </h3>
          </div>

          <div className="flex flex-col gap-3.5 md:flex-row">
            <input
              value={weatherLocation}
              onChange={(event) => setWeatherLocation(event.target.value)}
              placeholder={lang === "en" ? "Enter village/district" : "గ్రామం/జిల్లా నమోదు చేయండి"}
              className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-slate-100 outline-none focus:border-amber-500/40"
            />
            <button
              onClick={loadWeather}
              disabled={weatherLoading}
              className="rounded-xl bg-amber-600 hover:bg-amber-500 px-6 py-3.5 text-xs font-black text-white disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            >
              {weatherLoading ? (lang === "en" ? "Loading..." : "లోడ్ అవుతోంది...") : lang === "en" ? "Get Forecast" : "వాతావరణం పొందండి"}
            </button>
          </div>

          {weatherError && <p className="text-xs text-red-400 font-bold">{weatherError}</p>}

          <AnimatePresence>
            {weatherResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 pt-2"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center">
                    <Thermometer className="w-5.5 h-5.5 text-amber-400 mb-1.5" />
                    <p className="text-[9px] text-slate-400 uppercase font-black">{lang === "en" ? "Temp" : "ఉష్ణోగ్రత"}</p>
                    <p className="text-lg font-black text-white mt-1">{weatherResult.temperatureC}°C</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center">
                    <CloudRain className="w-5.5 h-5.5 text-teal-450 mb-1.5" />
                    <p className="text-[9px] text-slate-400 uppercase font-black">{lang === "en" ? "Rain" : "వర్షం అవకాశం"}</p>
                    <p className="text-lg font-black text-white mt-1">{weatherResult.rainProbability}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center">
                    <Droplets className="w-5.5 h-5.5 text-teal-400 mb-1.5" />
                    <p className="text-[9px] text-slate-400 uppercase font-black">{lang === "en" ? "Humidity" : "ఆర్ద్రత"}</p>
                    <p className="text-lg font-black text-white mt-1">{weatherResult.humidity}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center">
                    <Wind className="w-5.5 h-5.5 text-slate-300 mb-1.5" />
                    <p className="text-[9px] text-slate-400 uppercase font-black">{lang === "en" ? "Wind" : "గాలి వేగం"}</p>
                    <p className="text-lg font-black text-white mt-1">{weatherResult.windSpeed} km/h</p>
                  </div>
                </div>

                <div className="p-5.5 rounded-2xl bg-[#0b0f15]/80 border border-white/5 text-emerald-100">
                  <div className="flex items-center gap-2 mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                      {weatherResult.place} - {lang === "en" ? "Farming Advice" : "వ్యవసాయ సలహా"}
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed font-semibold">{weatherResult.farmingAdvice}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}

      {/* BOOKMARKS MODULE */}
      {activeTab === "bookmarks" && (
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 text-left space-y-5"
        >
          <h3 className="text-lg font-black text-slate-100">{t("bookmarksTitle", lang)}</h3>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 font-semibold">{t("noBookmarks", lang)}</p>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-white/5 bg-slate-905/30 p-4.5"
                >
                  <div className="space-y-1.5">
                    <span className="inline-flex rounded-full border border-slate-700 px-2.5 py-0.5 text-[8px] font-black uppercase text-slate-400">
                      {item.type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 pt-1">{item.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">{item.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBookmark(item.id)}
                    className="p-2 rounded-xl text-slate-450 hover:bg-slate-800 hover:text-red-400 cursor-pointer shrink-0 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* SETTINGS MODULE */}
      {activeTab === "settings" && (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AccessibilitySettings />
        </motion.section>
      )}
    </div>
  );
}
