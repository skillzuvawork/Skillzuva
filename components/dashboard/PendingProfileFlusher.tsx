"use client";

import { useEffect } from "react";
import { upsertStudentProfile } from "@/services/profiles.client";

export default function PendingProfileFlusher() {
  useEffect(() => {
    const raw = localStorage.getItem("sz_pending_profile");
    if (!raw) return;
    localStorage.removeItem("sz_pending_profile");
    try {
      const data = JSON.parse(raw);
      upsertStudentProfile(data).catch(() => {});
    } catch {}
  }, []);

  return null;
}
