"use client";

import { useState } from "react";

interface AnnouncementBarProps {
  latestAnnouncement: {
    en: string;
    es: string;
    fr: string;
  } | null;
}

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
] as const;

export default function AnnouncementBar({ latestAnnouncement }: AnnouncementBarProps) {
  const [activeLang, setActiveLang] = useState<"en" | "es" | "fr">("en");

  if (!latestAnnouncement) {
    return (
      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📢</span>
          <h3 className="text-sm font-semibold text-white">Public Announcements</h3>
        </div>
        <p className="text-xs text-slate-500">No active announcements</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl border border-indigo-500/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📢</span>
          <h3 className="text-sm font-semibold text-white">Public Announcements</h3>
        </div>
        <div className="flex gap-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setActiveLang(lang.code)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                activeLang === lang.code
                  ? "bg-indigo-500/30 text-indigo-200"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-200 leading-relaxed">
          {latestAnnouncement[activeLang]}
        </p>
      </div>
    </div>
  );
}
