import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemePreference = "light" | "dark" | "system";

interface Settings {
  theme: ThemePreference;
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateTheme: (theme: ThemePreference) => void;
  toggleSound: () => void;
  toggleAnimations: () => void;
}

const defaultSettings: Settings = {
  theme: "system",
  soundEnabled: true,
  animationsEnabled: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = "@sorteio_settings";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const updateTheme = (theme: ThemePreference) => {
    saveSettings({ ...settings, theme });
  };

  const toggleSound = () => {
    saveSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const toggleAnimations = () => {
    saveSettings({ ...settings, animationsEnabled: !settings.animationsEnabled });
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateTheme, toggleSound, toggleAnimations }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
