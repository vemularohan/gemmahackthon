"use client";

import React from "react";
import { useAccessibility, FontSize } from "@/context/AccessibilityContext";
import { Eye, Type, Volume2, VolumeX, RefreshCw } from "lucide-react";

export default function AccessibilitySettingsComponent() {
  const { settings, updateSetting, resetSettings } = useAccessibility();

  const handleFontSizeChange = (size: FontSize) => {
    updateSetting("fontSize", size);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Eye className="w-5 h-5 text-sky-400" />
          అనుకూలత సెట్టింగులు (Accessibility Settings)
        </h3>
        <button
          onClick={resetSettings}
          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          aria-label="Reset accessibility settings to default"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          రీసెట్ (Reset)
        </button>
      </div>

      <div className="space-y-6">
        {/* Font Size Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Type className="w-4 h-4 text-sky-400" />
            అక్షరాల పరిమాణం (Text Size)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["normal", "large", "xlarge"] as FontSize[]).map((size) => {
              const label =
                size === "normal"
                  ? "సాధారణ (Normal)"
                  : size === "large"
                  ? "పెద్దది (Large)"
                  : "చాలా పెద్దది (Extra Large)";

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
            <span className="text-sm font-medium text-slate-200">హై కాంట్రాస్ట్ (High Contrast)</span>
            <span className="text-xs text-slate-400">చూపు మెరుగుపరచడానికి నలుపు-తెలుపు రంగులు</span>
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
            <span className="text-sm font-medium text-slate-200">స్వయంచాలక వాయిస్ (Auto Voice Output)</span>
            <span className="text-xs text-slate-400">ప్రతి సమాధానాన్ని బిగ్గరగా చదవడానికి</span>
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
              ? "వాయిస్ సక్రియం చేయబడింది. సహాయకుడు మీ ప్రశ్నలకు తెలుగులో సమాధానాలు చదువుతారు."
              : "వాయిస్ నిలిపివేయబడింది. మీరు టెక్స్ట్ రూపంలో మాత్రమే సమాధానాలు చూస్తారు."}
          </span>
        </div>
      </div>
    </div>
  );
}
