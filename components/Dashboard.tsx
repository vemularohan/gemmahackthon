"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bookmark,
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
} from "lucide-react";
import { authService, dbService } from "@/lib/firebase";
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

const dashboardCards = (lang: "te" | "en") =>
  lang === "en"
    ? [
        { title: "Agriculture", subtitle: "Crop, fertilizer, pest, disease, irrigation" },
        { title: "Healthcare", subtitle: "Symptom guidance with emergency safeguards" },
        { title: "Gov Schemes", subtitle: "Eligibility check + grounded scheme help" },
        { title: "Weather", subtitle: "Rain/humidity/wind + farming advisory" },
      ]
    : [
        { title: "వ్యవసాయం", subtitle: "పంటలు, ఎరువులు, పురుగులు, వ్యాధులు, నీరుపారుదల" },
        { title: "ఆరోగ్యం", subtitle: "అత్యవసర హెచ్చరికలతో ఆరోగ్య మార్గదర్శనం" },
        { title: "ప్రభుత్వ పథకాలు", subtitle: "అర్హత తనిఖీ + ధృవీకరించిన సమాచారం" },
        { title: "వాతావరణం", subtitle: "వర్షం/ఆర్ద్రత/గాలి + వ్యవసాయ సలహా" },
      ];

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <nav className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-2 md:grid-cols-7">
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
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? "border border-blue-500/40 bg-blue-500/15 text-blue-100"
                  : "border border-transparent text-slate-300 hover:bg-slate-900/70"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {activeTab === "dashboard" && (
        <section className="space-y-6">
          <div className="glass-panel rounded-3xl border border-slate-800/70 p-8">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl space-y-3">
                <h2 className="text-2xl font-black tracking-tight text-slate-100 md:text-4xl">
                  {lang === "en"
                    ? "Saarathi AI Rural Companion"
                    : "సారథి AI గ్రామీణ డిజిటల్ తోడు"}
                </h2>
                <p className="text-sm leading-relaxed text-slate-300">
                  {lang === "en"
                    ? "Voice-first bilingual assistance for agriculture, health, welfare schemes, and weather guidance."
                    : "వ్యవసాయం, ఆరోగ్యం, ప్రభుత్వ పథకాలు, వాతావరణానికి వాయిస్-ఫస్ట్ ద్విభాషా సహాయం."}
                </p>
              </div>
              <button
                onClick={onLaunchVoiceMode}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                <Mic className="h-4 w-4" />
                {t("voiceAssistant", lang)}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {dashboardCards(lang).map((card) => (
              <div
                key={card.title}
                className="glass-panel rounded-2xl border border-slate-800/60 p-5"
              >
                <h3 className="text-base font-bold text-slate-100">{card.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{card.subtitle}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "agriculture" && (
        <section className="space-y-5">
          <div className="glass-panel rounded-3xl border border-slate-800/70 p-6">
            <h3 className="text-lg font-bold text-slate-100">
              {lang === "en" ? "Agriculture Assistant" : "వ్యవసాయ సహాయకుడు"}
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
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
                  className="min-h-12 rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800/70"
                >
                  {queryText}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <textarea
                value={agriQuery}
                onChange={(event) => setAgriQuery(event.target.value)}
                className="h-28 w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500"
                placeholder={
                  lang === "en"
                    ? "Ask custom agriculture question..."
                    : "వ్యవసాయం గురించి మీ ప్రశ్న అడగండి..."
                }
              />
              <button
                onClick={() => agriQuery.trim() && onSelectQuery(agriQuery, "agriculture")}
                className="min-h-11 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-slate-100"
              >
                {t("submit", lang)}
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-emerald-600/20 p-6">
            <h4 className="text-base font-bold text-slate-100">
              {lang === "en" ? "Plant Disease Detection" : "మొక్కల వ్యాధి గుర్తింపు"}
            </h4>
            <p className="mt-1 text-xs text-slate-300">
              {lang === "en"
                ? "Upload or capture a leaf image to get disease confidence, treatment, and preventive measures."
                : "ఆకు చిత్రం అప్‌లోడ్ చేసి వ్యాధి నమ్మక స్థాయి, చికిత్స, నివారణ మార్గాలు పొందండి."}
            </p>
            <input
              ref={plantInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePlantUpload}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => plantInputRef.current?.click()}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100"
              >
                <Upload className="h-4 w-4" />
                {lang === "en" ? "Upload / Capture Leaf" : "ఆకు ఫోటో అప్‌లోడ్ / కెమెరా"}
              </button>
              <button
                onClick={analyzePlantImage}
                disabled={!plantImageBase64 || plantLoading}
                className="min-h-11 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {plantLoading ? (lang === "en" ? "Analyzing..." : "విశ్లేషిస్తోంది...") : lang === "en" ? "Analyze Leaf" : "ఆకు విశ్లేషణ"}
              </button>
            </div>
            {plantImageBase64 && (
              <div className="mt-4 max-w-xs overflow-hidden rounded-xl border border-slate-700">
                <img src={plantImageBase64} alt="Plant leaf preview" className="h-auto w-full object-cover" />
              </div>
            )}
            {plantError && <p className="mt-3 text-xs text-red-400">{plantError}</p>}
            {plantResult && (
              <div className="mt-4 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 text-sm text-slate-200">
                <p>
                  <strong>{lang === "en" ? "Disease" : "వ్యాధి"}:</strong> {plantResult.disease}
                </p>
                <p>
                  <strong>{lang === "en" ? "Confidence" : "నమ్మక స్థాయి"}:</strong>{" "}
                  {Math.round(plantResult.confidence * 100)}%
                </p>
                <p className="mt-2">
                  <strong>{lang === "en" ? "Treatments" : "చికిత్సలు"}:</strong>
                </p>
                <ul className="list-disc pl-5">
                  {plantResult.treatments.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-2">
                  <strong>{lang === "en" ? "Preventive Measures" : "నివారణ చర్యలు"}:</strong>
                </p>
                <ul className="list-disc pl-5">
                  {plantResult.preventiveMeasures.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-slate-300">{plantResult.teluguExplanation}</p>
                <p className="mt-1 text-xs text-amber-300">{plantResult.disclaimer}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "health" && (
        <section className="glass-panel rounded-3xl border border-slate-800/70 p-6">
          <h3 className="text-lg font-bold text-slate-100">{t("askHealth", lang)}</h3>
          <p className="mt-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            {lang === "en"
              ? "Emergency warning is enabled. Serious symptoms are always redirected to doctors/hospitals."
              : "అత్యవసర హెచ్చరిక అమల్లో ఉంది. తీవ్రమైన లక్షణాలకు ఎల్లప్పుడూ డాక్టర్/ఆసుపత్రి సూచన ఉంటుంది."}
          </p>
          <textarea
            value={healthQuery}
            onChange={(event) => setHealthQuery(event.target.value)}
            className="mt-4 h-28 w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500"
            placeholder={t("askHealthPlaceholder", lang)}
          />
          <button
            onClick={() => healthQuery.trim() && onSelectQuery(healthQuery, "health")}
            className="mt-3 min-h-11 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-slate-100"
          >
            {t("submit", lang)}
          </button>
        </section>
      )}

      {activeTab === "government" && (
        <section className="space-y-5">
          <div className="glass-panel rounded-3xl border border-slate-800/70 p-6">
            <h3 className="text-lg font-bold text-slate-100">
              {lang === "en" ? "Government Scheme Assistant" : "ప్రభుత్వ పథకాల సహాయకుడు"}
            </h3>
            <textarea
              value={govQuery}
              onChange={(event) => setGovQuery(event.target.value)}
              className="mt-4 h-28 w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500"
              placeholder={t("askGovPlaceholder", lang)}
            />
            <button
              onClick={() => govQuery.trim() && onSelectQuery(govQuery, "government")}
              className="mt-3 min-h-11 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-slate-100"
            >
              {t("submit", lang)}
            </button>
          </div>

          <div className="glass-panel rounded-3xl border border-blue-600/20 p-6">
            <h4 className="text-base font-bold text-slate-100">
              {lang === "en" ? "Eligibility Checker" : "అర్హత తనిఖీ"}
            </h4>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {(
                [
                  ["age", lang === "en" ? "Age" : "వయస్సు"],
                  ["occupation", lang === "en" ? "Occupation" : "వృత్తి"],
                  ["annualIncome", lang === "en" ? "Annual Income" : "వార్షిక ఆదాయం"],
                  ["district", lang === "en" ? "District" : "జిల్లా"],
                  ["landOwnedAcres", lang === "en" ? "Land owned (acres)" : "భూమి (ఎకరాలు)"],
                  ["gender", lang === "en" ? "Gender" : "లింగం"],
                  ["category", lang === "en" ? "Category" : "వర్గం"],
                ] as const
              ).map(([key, label]) => (
                <input
                  key={key}
                  value={eligibilityForm[key]}
                  onChange={(event) =>
                    setEligibilityForm((prev) => ({ ...prev, [key]: event.target.value }))
                  }
                  placeholder={label}
                  className="min-h-11 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                />
              ))}
            </div>
            <button
              onClick={runEligibilityCheck}
              disabled={eligibilityLoading}
              className="mt-4 min-h-11 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {eligibilityLoading
                ? lang === "en"
                  ? "Checking..."
                  : "తనిఖీ చేస్తోంది..."
                : lang === "en"
                ? "Check Eligibility"
                : "అర్హత తనిఖీ చేయండి"}
            </button>
            {eligibilityResult && (
              <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-700/70 bg-slate-900/70 p-4 text-xs text-slate-200">
                {eligibilityResult}
              </pre>
            )}
          </div>
        </section>
      )}

      {activeTab === "weather" && (
        <section className="glass-panel rounded-3xl border border-slate-800/70 p-6">
          <h3 className="text-lg font-bold text-slate-100">
            {lang === "en" ? "Weather + Farming Advisory" : "వాతావరణం + వ్యవసాయ సలహా"}
          </h3>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              value={weatherLocation}
              onChange={(event) => setWeatherLocation(event.target.value)}
              placeholder={lang === "en" ? "Enter village/district" : "గ్రామం/జిల్లా నమోదు చేయండి"}
              className="min-h-11 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
            />
            <button
              onClick={loadWeather}
              disabled={weatherLoading}
              className="min-h-11 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {weatherLoading ? (lang === "en" ? "Loading..." : "లోడ్ అవుతోంది...") : lang === "en" ? "Get Weather" : "వాతావరణం పొందండి"}
            </button>
          </div>
          {weatherError && <p className="mt-3 text-xs text-red-400">{weatherError}</p>}
          {weatherResult && (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
                <p className="text-[10px] text-slate-400">{lang === "en" ? "Temperature" : "ఉష్ణోగ్రత"}</p>
                <p className="text-sm font-bold text-slate-100">{weatherResult.temperatureC}°C</p>
              </div>
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
                <p className="text-[10px] text-slate-400">{lang === "en" ? "Rain chance" : "వర్షం అవకాశం"}</p>
                <p className="text-sm font-bold text-slate-100">{weatherResult.rainProbability}%</p>
              </div>
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
                <p className="text-[10px] text-slate-400">{lang === "en" ? "Humidity" : "ఆర్ద్రత"}</p>
                <p className="text-sm font-bold text-slate-100">{weatherResult.humidity}%</p>
              </div>
              <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
                <p className="text-[10px] text-slate-400">{lang === "en" ? "Wind" : "గాలి వేగం"}</p>
                <p className="text-sm font-bold text-slate-100">{weatherResult.windSpeed} km/h</p>
              </div>
              <div className="col-span-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="mb-1 text-xs text-emerald-200">{weatherResult.place}</p>
                {weatherResult.farmingAdvice}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === "bookmarks" && (
        <section className="glass-panel rounded-3xl border border-slate-800/70 p-6">
          <h3 className="text-lg font-bold text-slate-100">{t("bookmarksTitle", lang)}</h3>
          {bookmarks.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">{t("noBookmarks", lang)}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {bookmarks.map((bookmarkItem) => (
                <div
                  key={bookmarkItem.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4"
                >
                  <div>
                    <span className="inline-flex rounded-full border border-slate-600 px-2 py-1 text-[10px] uppercase text-slate-300">
                      {bookmarkItem.type}
                    </span>
                    <h4 className="mt-2 text-sm font-bold text-slate-100">{bookmarkItem.title}</h4>
                    <p className="mt-1 text-xs text-slate-300">{bookmarkItem.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBookmark(bookmarkItem.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "settings" && <AccessibilitySettings />}
    </div>
  );
}
