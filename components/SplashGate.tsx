"use client";

import { useEffect, useState } from "react";
import SplashScreen from "./SplashScreen";

const STORAGE_KEY = "sz_launched";
const LAUNCH_DATE = new Date("2026-06-15T19:03:00+05:30");

export default function SplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const launched = Date.now() >= LAUNCH_DATE.getTime();

    if (!launched) {
      // Before launch time: always show splash (clear stale flag so countdown shows)
      localStorage.removeItem(STORAGE_KEY);
      setShowSplash(true);
    } else {
      // After launch time: only skip if user explicitly entered before
      const alreadyEntered = localStorage.getItem(STORAGE_KEY) === "true";
      setShowSplash(!alreadyEntered);
    }

    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <>
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}
      {children}
    </>
  );
}
