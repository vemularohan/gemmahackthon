"use client";

import React from "react";
import { useAccessibility, FontSize } from "@/context/AccessibilityContext";
import { Eye, Type, Volume2, VolumeX, RefreshCw, Globe } from "lucide-react";
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
    <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Eye className="w-5 h-5 text-sky-400" />
          {t("accessibilitySettings", lang)}
        </h3>
        <button
          onClick={resetSettings}
          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          aria-label="Reset accessibility settings to default"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t("reset", lang)}
        </button>
      </div>

      <div className="space-y-6">
        {/* Language Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
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
                  className={`py-3 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700"
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
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Type className="w-4 h-4 text-sky-400" />
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
                  className={`py-3 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700"
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
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">{t("highContrast", lang)}</span>
            <span className="text-xs text-slate-400">{t("highContrastDesc", lang)}</span>
          </div>
          <button
            onClick={() => updateSetting("highContrast", !settings.highContrast)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              settings.highContrast ? "bg-blue-600" : "bg-slate-700"
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
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">{t("autoVoice", lang)}</span>
            <span className="text-xs text-slate-400">{t("autoVoiceDesc", lang)}</span>
          </div>
          <button
            onClick={() => updateSetting("autoSpeak", !settings.autoSpeak)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              settings.autoSpeak ? "bg-blue-600" : "bg-slate-700"
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
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-blue-500/20 text-xs text-slate-300">
          {settings.autoSpeak ? (
            <Volume2 className="w-5 h-5 text-blue-400 shrink-0 animate-pulse" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-500 shrink-0" />
          )}
          <span>
            {settings.autoSpeak
              ? t("voiceActive", lang)
              : t("voiceInactive", lang)}
          </span>
        </div>
      </div>
    </div>
  );
}
