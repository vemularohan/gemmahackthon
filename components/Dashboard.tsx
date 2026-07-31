"use client";

import React, { useState, useEffect } from "react";
import {
  Wheat,
  HeartPulse,
  Landmark,
  Languages,
  Settings as SettingsIcon,
  Bookmark,
  Mic,
  ArrowRight,
  Sparkles,
  Trash2,
  BookmarkCheck,
} from "lucide-react";
import { authService, dbService } from "@/lib/firebase";
import AccessibilitySettings from "./AccessibilitySettings";
import { useAccessibility } from "@/context/AccessibilityContext";
import { t } from "@/utils/translations";

interface DashboardProps {
  onSelectQuery: (query: string, category: string) => void;
  onNewChat: () => void;
  onLaunchVoiceMode: () => void;
}

export default function Dashboard({
  onSelectQuery,
  onNewChat,
  onLaunchVoiceMode,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "farmer" | "health" | "government" | "translator" | "bookmarks" | "settings">("dashboard");
  const [user, setUser] = useState<any | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const { settings } = useAccessibility();
  const lang = settings.language || "te";

  // Form states
  const [farmerQuery, setFarmerQuery] = useState("");
  const [healthQuery, setHealthQuery] = useState("");
  const [govQuery, setGovQuery] = useState("");
  const [govCategory, setGovCategory] = useState("Aadhaar");
  
  // Translator states
  const [transText, setTransText] = useState("");
  const [transDirection, setTransDirection] = useState<"en-te" | "te-en" | "roman-te">("en-te");
  const [transResult, setTransResult] = useState("");
  const [transLoading, setTransLoading] = useState(false);

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

  const handleTranslate = async () => {
    if (!transText.trim()) return;
    setTransLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate",
          text: transText,
          direction: transDirection,
        }),
      });
      const data = await res.json();
      setTransResult(data.result);
    } catch (e) {
      console.error(e);
      setTransResult(lang === "te" ? "అనువాదంలో లోపం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి." : "Translation error occurred. Please try again.");
    } finally {
      setTransLoading(false);
    }
  };

  const handleDeleteBookmark = async (bid: string) => {
    if (!user) return;
    try {
      await dbService.deleteBookmark(user.uid, bid);
      const savedBookmarks = await dbService.getBookmarks(user.uid);
      setBookmarks(savedBookmarks);
    } catch (err) {
      console.error(err);
    }
  };

  const demoQueries = lang === "te" ? [
    { text: "నాకు రైతు బంధు పథకం గురించి చెప్పు", cat: "farmer" },
    { text: "ఈ మందు ఎలా వాడాలి?", cat: "health" },
    { text: "నా బిడ్డకు జ్వరం ఉంది", cat: "health" },
    { text: "Aadhaar update ఎలా చేయాలి?", cat: "government" },
    { text: "ఈ పంటకు ఏ ఎరువు వేయాలి?", cat: "farmer" },
    { text: "Meeting ki late avthanu", cat: "translator" },
  ] : [
    { text: "Tell me about Rythu Bandhu scheme", cat: "farmer" },
    { text: "How should I use this medicine?", cat: "health" },
    { text: "My child has a fever", cat: "health" },
    { text: "How to update Aadhaar?", cat: "government" },
    { text: "Which fertilizer is good for this crop?", cat: "farmer" },
    { text: "I'll be late to the meeting", cat: "translator" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Navigation Tab Bar */}
      <nav className="grid grid-cols-4 sm:grid-cols-7 gap-2 p-1.5 bg-slate-950/40 rounded-2xl border border-slate-900 shadow-inner">
        {(
          [
            { id: "dashboard", label: t("dashboard", lang), icon: Landmark },
            { id: "farmer", label: t("farmerBazar", lang), icon: Wheat },
            { id: "health", label: t("health", lang), icon: HeartPulse },
            { id: "government", label: t("services", lang), icon: Landmark },
            { id: "translator", label: t("translator", lang), icon: Languages },
            { id: "bookmarks", label: t("bookmarks", lang), icon: Bookmark },
            { id: "settings", label: t("settings", lang), icon: SettingsIcon },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                console.log("Tab changed in dashboard:", tab.id);
                setActiveTab(tab.id);
              }}
              className={`py-3 px-1.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-500 hover:text-slate-350 hover:bg-slate-900/30"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="truncate w-full text-center">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Workspace Contents */}
      <div className="flex-grow min-h-[400px]">
        {/* 1. Main Hub */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* SaaS Style Hero Panel */}
            <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-blue-600/90 to-sky-600/90 border border-blue-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center md:text-left max-w-lg">
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-sky-500/20 border border-sky-400/25 text-sky-200 rounded-full">
                  {lang === "te" ? "సారథి డిజిటల్ తోడు" : "Saarathi Digital Companion"}
                </span>
                <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
                  {t("heroTitle", lang)}
                </h2>
                <p className="text-sm text-blue-100 leading-relaxed font-medium">
                  {t("heroDesc", lang)}
                </p>
              </div>
              <button
                onClick={onLaunchVoiceMode}
                className="flex items-center gap-2.5 py-4.5 px-7 bg-white hover:bg-slate-100 text-blue-600 text-sm font-extrabold rounded-2xl shadow-xl transition-all hover:scale-105 hover:shadow-white/10 active:scale-95 cursor-pointer shrink-0"
              >
                <Mic className="w-5 h-5 text-blue-600 animate-bounce" />
                {t("voiceAssistant", lang)}
              </button>
            </div>

            {/* Quick Cards Grid */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4 pl-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                {t("quickQueries", lang)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      console.log("Demo query clicked:", item.text);
                      onSelectQuery(item.text, item.cat);
                    }}
                    className="text-left p-5 rounded-2xl bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900 hover:border-slate-800 text-sm text-slate-355 flex items-center justify-between group transition-all hover:translate-y-[-2px] cursor-pointer"
                  >
                    <span className="font-semibold leading-relaxed pr-4">{item.text}</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-900/50 group-hover:bg-blue-600/10 flex items-center justify-center transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Farmer Corner */}
        {activeTab === "farmer" && (
          <div className="glass-panel p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-slate-850/60 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl">
                <Wheat className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{t("askFarmer", lang)}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t("askFarmerDesc", lang)}</p>
              </div>
            </div>
            <div className="space-y-4">
              <textarea
                value={farmerQuery}
                onChange={(e) => setFarmerQuery(e.target.value)}
                placeholder={t("askFarmerPlaceholder", lang)}
                className="w-full h-28 py-4 px-4 rounded-2xl bg-slate-950/60 border border-slate-850 text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-blue-500 text-sm transition-colors"
              />
              <button
                onClick={() => {
                  if (farmerQuery.trim()) onSelectQuery(farmerQuery, "farmer");
                }}
                className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {t("submit", lang)}
              </button>
            </div>
          </div>
        )}

        {/* 3. Healthcare Assistant */}
        {activeTab === "health" && (
          <div className="glass-panel p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-slate-850/60 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-2xl">
                <HeartPulse className="w-6 h-6 text-red-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{t("askHealth", lang)}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t("askHealthDesc", lang)}</p>
              </div>
            </div>
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-400 rounded-xl leading-relaxed">
              {lang === "te" 
                ? "⚠️ గమనిక: ఇది కేవలం ప్రాథమిక సమాచారం కోసం మాత్రమే. అత్యవసర పరిస్థితుల్లో దయచేసి తక్షణమే వైద్యుడిని సంప్రదించండి."
                : "⚠️ Note: This is for general informational purposes only. In case of an emergency, please consult a medical professional immediately."}
            </div>
            <div className="space-y-4">
              <textarea
                value={healthQuery}
                onChange={(e) => setHealthQuery(e.target.value)}
                placeholder={t("askHealthPlaceholder", lang)}
                className="w-full h-28 py-4 px-4 rounded-2xl bg-slate-950/60 border border-slate-850 text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-blue-500 text-sm transition-colors"
              />
              <button
                onClick={() => {
                  if (healthQuery.trim()) onSelectQuery(healthQuery, "health");
                }}
                className="py-3 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {t("submit", lang)}
              </button>
            </div>
          </div>
        )}

        {/* 4. Government Services */}
        {activeTab === "government" && (
          <div className="glass-panel p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-slate-850/60 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-600/10 border border-amber-500/20 rounded-2xl">
                <Landmark className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{t("askGov", lang)}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t("askGovDesc", lang)}</p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {["Aadhaar", "MeeSeva", "Pension", "Ration Card", "Income Certificate"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGovCategory(cat)}
                  className={`py-2 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    govCategory === cat
                      ? "bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/15"
                      : "bg-slate-950/40 border-slate-800 text-slate-450 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <textarea
                value={govQuery}
                onChange={(e) => setGovQuery(e.target.value)}
                placeholder={lang === "te" ? `ఉదాహరణకు: ${govCategory} అప్డేట్ చేసుకోవడానికి అవసరమైన డాక్యుమెంట్లు ఏమిటి?` : `Example: What documents are required to update ${govCategory}?`}
                className="w-full h-28 py-4 px-4 rounded-2xl bg-slate-950/60 border border-slate-850 text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-blue-500 text-sm transition-colors"
              />
              <button
                onClick={() => {
                  if (govQuery.trim()) onSelectQuery(govQuery, `government:${govCategory}`);
                }}
                className="py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-600/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {t("submit", lang)}
              </button>
            </div>
          </div>
        )}

        {/* 5. Translation */}
        {activeTab === "translator" && (
          <div className="glass-panel p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-slate-850/60 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                <Languages className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{t("translatorTitle", lang)}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t("transDesc", lang)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {[
                { id: "en-te", label: t("entote", lang) },
                { id: "te-en", label: t("teentoen", lang) },
                { id: "roman-te", label: t("romantote", lang) },
              ].map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => setTransDirection(dir.id as any)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    transDirection === dir.id
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/15"
                      : "bg-slate-950/40 border-slate-800 text-slate-450 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  {dir.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {lang === "te" ? "ఇన్పుట్ టెక్స్ట్" : "Input Text"}
                </label>
                <textarea
                  value={transText}
                  onChange={(e) => setTransText(e.target.value)}
                  placeholder={t("transPlaceholder", lang)}
                  className="w-full h-32 py-3 px-4 rounded-2xl bg-slate-950/60 border border-slate-850 text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                />
              </div>
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {t("transResultLabel", lang)}
                </label>
                <div className="flex-grow h-32 py-3.5 px-4 rounded-2xl bg-slate-950/30 border border-slate-900 text-slate-200 text-sm overflow-y-auto leading-relaxed whitespace-pre-wrap">
                  {transLoading ? (
                    <span className="text-slate-500 italic animate-pulse">{t("transLoading", lang)}</span>
                  ) : (
                    transResult || <span className="text-slate-700 italic">{lang === "te" ? "అనువదించిన టెక్స్ట్ ఇక్కడ కనిపిస్తుంది..." : "Translated text will appear here..."}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleTranslate}
              disabled={transLoading || !transText.trim()}
              className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {t("transButton", lang)}
            </button>
          </div>
        )}

        {/* 6. Bookmarks */}
        {activeTab === "bookmarks" && (
          <div className="glass-panel p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-slate-850/60 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-sky-600/10 border border-sky-500/20 rounded-2xl">
                <BookmarkCheck className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{t("bookmarksTitle", lang)}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{lang === "te" ? "మళ్ళీ చదువుకోవడానికి దాచుకున్న ముఖ్యమైన సమాధానాలు" : "Saved important answers for future reference"}</p>
              </div>
            </div>

            {bookmarks.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-16">{t("noBookmarks", lang)}</p>
            ) : (
              <div className="space-y-4">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-5 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-slate-850 flex items-start justify-between gap-4 transition-all"
                  >
                    <div className="space-y-2">
                      <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-slate-900 border border-slate-850 text-slate-450 rounded-full">
                        {bm.type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-200">{bm.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-2">{bm.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBookmark(bm.id)}
                      className="p-1.5 text-slate-650 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      title={t("deleteBookmark", lang)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. Settings */}
        {activeTab === "settings" && <AccessibilitySettings />}
      </div>
    </div>
  );
}
