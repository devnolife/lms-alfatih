"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface GameState {
  xp: number;
  lives: number;
  increaseXp: (amount: number) => void;
  decreaseLife: () => void;
  refillLives: () => void;
}

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(5);

  const increaseXp = useCallback((amount: number) => {
    setXp((prev) => prev + amount);
  }, []);

  const decreaseLife = useCallback(() => {
    setLives((prev) => Math.max(0, prev - 1));
  }, []);

  const refillLives = useCallback(() => {
    setLives(5);
  }, []);

  return (
    <GameContext.Provider value={{ xp, lives, increaseXp, decreaseLife, refillLives }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameContext);
  // Graceful no-op fallback so the Sandbox demo on the marketing page works
  // without the authenticated GameProvider (real XP/lives live in /app).
  if (!ctx) {
    return {
      xp: 0,
      lives: 5,
      increaseXp: () => {},
      decreaseLife: () => {},
      refillLives: () => {},
    } satisfies GameState;
  }
  return ctx;
}
