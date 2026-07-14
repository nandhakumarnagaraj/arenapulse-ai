"use client";

import { useState, useEffect } from "react";
import { MATCH_INFO } from "@/data/stadium";

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isPast: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

export default function Header() {
  const countdown = useCountdown(MATCH_INFO.kickoffTime);

  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-blue-800/30">
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
              AP
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <span className="gradient-text">ArenaPulse AI</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/20">
                  BETA
                </span>
              </h1>
              <p className="text-[11px] text-blue-300/60 -mt-0.5">
                GenAI Operational Intelligence Copilot
              </p>
            </div>
          </div>

          {/* Match Info */}
          <div className="hidden md:flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] text-blue-300/50 uppercase tracking-wider">Venue</p>
              <p className="text-sm text-white font-semibold">{MATCH_INFO.venue}</p>
              <p className="text-[10px] text-slate-500">{MATCH_INFO.city}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-blue-300/50 uppercase tracking-wider">Match</p>
              <p className="text-sm text-white font-semibold">
                {MATCH_INFO.homeTeam}{" "}
                <span className="text-blue-400 mx-1">vs</span>{" "}
                {MATCH_INFO.awayTeam}
              </p>
              <p className="text-[10px] text-slate-500">FIFA World Cup 2026</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-blue-300/50 uppercase tracking-wider">Attendance</p>
              <p className="text-sm text-white font-semibold">
                {MATCH_INFO.attendance.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500">Capacity</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-4">
            {/* Countdown */}
            {countdown.isPast ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-300 text-xs font-bold">⚽ MATCH IN PROGRESS</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                {[
                  { value: countdown.days, label: "D" },
                  { value: countdown.hours, label: "H" },
                  { value: countdown.minutes, label: "M" },
                  { value: countdown.seconds, label: "S" },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg px-2 py-1 min-w-[36px] text-center">
                      <p className="text-sm font-bold text-white font-mono">
                        {String(item.value).padStart(2, "0")}
                      </p>
                      <p className="text-[8px] text-slate-500 -mt-0.5">{item.label}</p>
                    </div>
                    {i < 3 && <span className="text-slate-600 text-xs">:</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-emerald-300 text-xs font-semibold">LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
