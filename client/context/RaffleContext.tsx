import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface RaffleHistoryItem {
  id: string;
  date: string;
  type: "list" | "number";
  items: string[];
  minNumber?: number;
  maxNumber?: number;
  winnersCount: number;
  allowRepetition: boolean;
  results: string[];
  weights?: Record<string, number>;
}

interface RaffleContextType {
  history: RaffleHistoryItem[];
  addToHistory: (item: Omit<RaffleHistoryItem, "id" | "date">) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
}

const RaffleContext = createContext<RaffleContextType | undefined>(undefined);

const HISTORY_KEY = "@sorteio_history";

export function RaffleProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<RaffleHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const saveHistory = async (newHistory: RaffleHistoryItem[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  };

  const addToHistory = (item: Omit<RaffleHistoryItem, "id" | "date">) => {
    const newItem: RaffleHistoryItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const newHistory = [newItem, ...history];
    saveHistory(newHistory);
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    saveHistory(newHistory);
  };

  return (
    <RaffleContext.Provider
      value={{ history, addToHistory, clearHistory, deleteHistoryItem }}
    >
      {children}
    </RaffleContext.Provider>
  );
}

export function useRaffle() {
  const context = useContext(RaffleContext);
  if (!context) {
    throw new Error("useRaffle must be used within RaffleProvider");
  }
  return context;
}
