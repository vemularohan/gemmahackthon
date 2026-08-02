"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, dbService } from "@/lib/firebase";

export type FontSize = "normal" | "large" | "xlarge";
export type ThemeMode = "dark" | "light";

export interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
  voiceNav: boolean;
  autoSpeak: boolean;
  language: "te" | "en";
  theme: ThemeMode;
  speechRate: number;
  speechPitch: number;
  district: string;
  state: "Telangana" | "Andhra Pradesh";
  occupation: string;
  landOwnedAcres: number;
  onboardingDone: boolean;
}

interface AccessibilityContextProps {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: "normal",
  highContrast: false,
  voiceNav: false,
  autoSpeak: true,
  language: "te",
  theme: "dark",
  speechRate: 1,
  speechPitch: 1,
  district: "Warangal",
  state: "Telangana",
  occupation: "",
  landOwnedAcres: 0,
  onboardingDone: false,
};

const AccessibilityContext = createContext<AccessibilityContextProps | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [userId, setUserId] = useState<string | null>(null);

  // Sync user state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        setUserId(user.uid);
        // Load settings from Firebase/LocalStorage
        dbService.getSettings(user.uid).then((saved) => {
          if (saved) {
            setSettings({ ...defaultSettings, ...saved });
          }
        });
      } else {
        setUserId(null);
        // Load default/guest settings from localStorage if available
        const local = localStorage.getItem("saarathi_guest_accessibility");
        if (local) {
          try {
            setSettings(JSON.parse(local));
          } catch (e) {
            console.error(e);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Apply settings to document element
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Reset font sizes
    root.classList.remove("font-size-normal", "font-size-large", "font-size-xlarge");
    root.classList.add(`font-size-${settings.fontSize}`);

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    root.setAttribute("data-theme", settings.theme);
  }, [settings]);

  const updateSetting = async <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    if (userId) {
      await dbService.saveSettings(userId, updated);
    } else {
      localStorage.setItem("saarathi_guest_accessibility", JSON.stringify(updated));
    }
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    if (userId) {
      await dbService.saveSettings(userId, defaultSettings);
    } else {
      localStorage.setItem("saarathi_guest_accessibility", JSON.stringify(defaultSettings));
    }
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};
