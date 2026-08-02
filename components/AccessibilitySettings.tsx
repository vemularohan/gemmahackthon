"use client";

import React from "react";
import { useAccessibility, FontSize } from "@/context/AccessibilityContext";
import { Eye, Type, Volume2, VolumeX, RefreshCw, Globe, Moon, Sun } from "lucide-react";
import { t } from "@/utils/translations";

export default function AccessibilitySettingsComponent() {
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const lang = settings.language || "te";

  const handleFontSizeChange = (size: FontSize) => {
    updateSetting("fontSize", size);
  };

  const handleLanguageChange = (language: "te" | "en") => {
    updateSetting("language", language);
  };

  return (
    <div className="glass-panel p-6 rounded-[28px] border border-white/5 bg-slate-900/40 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-450" />
          {t("accessibilitySettings", lang)}
        </h3>
        <button
          onClick={resetSettings}
          className="text-xs text-emerald-400 hover:text-emerald-350 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          aria-label="Reset accessibility settings to default"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t("reset", lang)}
        </button>
      </div>

      <div className="space-y-6">
        {/* Language Selector */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-450" />
            {t("selectLanguage", lang)}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["te", "en"] as const).map((language) => {
              const label = language === "te" ? t("telugu", lang) : t("english", lang);
              const isActive = lang === language;

              return (
                <button
                  key={language}
                  onClick={() => handleLanguageChange(language)}
                  className={`py-3.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-650 border-emerald-500/20 text-white shadow-md shadow-emerald-550/10"
                      : "bg-slate-950/60 border-white/5 text-slate-350 hover:bg-slate-800"
                  }`}
                  aria-pressed={isActive}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Size Selector */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-450" />
            {t("textSize", lang)}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["normal", "large", "xlarge"] as FontSize[]).map((size) => {
              const label =
                size === "normal"
                  ? t("textSizeNormal", lang)
                  : size === "large"
                  ? t("textSizeLarge", lang)
                  : t("textSizeXlarge", lang);

              const isActive = settings.fontSize === size;

              return (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`py-3.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-650 border-emerald-500/20 text-white shadow-md shadow-emerald-550/10"
                      : "bg-slate-950/60 border-white/5 text-slate-350 hover:bg-slate-800"
                  }`}
                  aria-pressed={isActive}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/5">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200">{t("highContrast", lang)}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{t("highContrastDesc", lang)}</span>
          </div>
          <button
            onClick={() => updateSetting("highContrast", !settings.highContrast)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              settings.highContrast ? "bg-emerald-650" : "bg-slate-800"
            }`}
            role="switch"
            aria-checked={settings.highContrast}
            aria-label="High contrast mode"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.highContrast ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Auto Speak Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/5">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200">{t("autoVoice", lang)}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{t("autoVoiceDesc", lang)}</span>
          </div>
          <button
            onClick={() => updateSetting("autoSpeak", !settings.autoSpeak)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              settings.autoSpeak ? "bg-emerald-650" : "bg-slate-800"
            }`}
            role="switch"
            aria-checked={settings.autoSpeak}
            aria-label="Auto voice response reading"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.autoSpeak ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Voice Navigation Help Banner */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950/40 border border-emerald-500/10 text-xs text-slate-300">
          {settings.autoSpeak ? (
            <Volume2 className="w-5 h-5 text-emerald-450 shrink-0 animate-pulse" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-500 shrink-0" />
          )}
          <span className="text-left font-semibold">
            {settings.autoSpeak
              ? t("voiceActive", lang)
              : t("voiceInactive", lang)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
            {lang === "en" ? "Theme" : "థీమ్"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "dark", icon: Moon, label: lang === "en" ? "Dark" : "డార్క్" },
                { id: "light", icon: Sun, label: lang === "en" ? "Light" : "లైట్" },
              ] as const
            ).map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = settings.theme === themeOption.id;
              return (
                <button
                  key={themeOption.id}
                  onClick={() => updateSetting("theme", themeOption.id)}
                  className={`py-3.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-emerald-650 border-emerald-500/20 text-white shadow-md shadow-emerald-555/10"
                      : "bg-slate-950/60 border-white/5 text-slate-350 hover:bg-slate-800"
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon className="w-4 h-4" />
                  {themeOption.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
            {lang === "en" ? "Speech Speed" : "వాయిస్ వేగం"} ({settings.speechRate.toFixed(1)}x)
          </label>
          <input
            type="range"
            min={0.6}
            max={1.4}
            step={0.1}
            value={settings.speechRate}
            onChange={(event) => updateSetting("speechRate", Number(event.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="space-y-2 text-left">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
            {lang === "en" ? "Speech Pitch" : "వాయిస్ పిచ్"} ({settings.speechPitch.toFixed(1)})
          </label>
          <input
            type="range"
            min={0.8}
            max={1.2}
            step={0.1}
            value={settings.speechPitch}
            onChange={(event) => updateSetting("speechPitch", Number(event.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="space-y-2 text-left">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
            {lang === "en" ? "State" : "రాష్ట్రం"}
          </label>
          <select
            value={settings.state}
            onChange={(event) =>
              updateSetting(
                "state",
                event.target.value === "Andhra Pradesh" ? "Andhra Pradesh" : "Telangana"
              )
            }
            className="w-full rounded-2xl border border-white/5 bg-slate-950/70 px-4 py-4 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/40"
          >
            <option value="Telangana">Telangana</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
          </select>
        </div>

        <div className="space-y-2 text-left">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
            {lang === "en" ? "District" : "జిల్లా"}
          </label>
          <input
            value={settings.district}
            onChange={(event) => updateSetting("district", event.target.value)}
            placeholder={lang === "en" ? "Enter district name" : "జిల్లా పేరు నమోదు చేయండి"}
            className="w-full rounded-2xl border border-white/5 bg-slate-950/70 px-4 py-4 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/40"
          />
        </div>

        <div className="space-y-2 text-left">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
            {lang === "en" ? "Occupation" : "వృత్తి"}
          </label>
          <input
            value={settings.occupation}
            onChange={(event) => updateSetting("occupation", event.target.value)}
            placeholder={lang === "en" ? "Farmer / Worker / Student..." : "రైతు / కూలీ / విద్యార్థి..."}
            className="w-full rounded-2xl border border-white/5 bg-slate-950/70 px-4 py-4 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/40"
          />
        </div>

        <div className="space-y-2 text-left">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
            {lang === "en" ? "Land Owned (acres)" : "భూమి (ఎకరాలు)"}
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={settings.landOwnedAcres}
            onChange={(event) => updateSetting("landOwnedAcres", Number(event.target.value))}
            className="w-full rounded-2xl border border-white/5 bg-slate-950/70 px-4 py-4 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/40"
          />
        </div>

        <button
          onClick={() => updateSetting("onboardingDone", true)}
          className="w-full rounded-2xl bg-gradient-to-r from-emerald-650 to-emerald-600 hover:from-emerald-600 hover:to-emerald-550 py-4 text-xs font-black text-white cursor-pointer border border-emerald-500/10 shadow-lg shadow-emerald-500/5 transition-all hover:scale-[1.01]"
        >
          {lang === "en" ? "Save Rural Profile" : "గ్రామీణ ప్రొఫైల్ సేవ్ చేయండి"}
        </button>
      </div>
    </div>
  );
}
