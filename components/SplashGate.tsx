"use client";

import { useEffect, useState } from "react";
import SplashScreen from "./SplashScreen";

const STORAGE_KEY = "sz_launched";
const LAUNCH_DATE = new Date("2026-06-18T18:37:00+05:30");

export default function SplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pastLaunch = Date.now() >= LAUNCH_DATE.getTime();

    if (pastLaunch) {
      // After launch time: skip splash entirely, go straight to the website
      localStorage.setItem(STORAGE_KEY, "true");
      setShowSplash(false);
    } else {
      // Before launch time: always show countdown splash
      localStorage.removeItem(STORAGE_KEY);
      setShowSplash(true);
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
