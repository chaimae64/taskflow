import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";

const MODES = {
  work:       { label: "Focus",      duration: 25 * 60, color: "#6366F1" },
  shortBreak: { label: "Pause",      duration: 5 * 60,  color: "#10B981" },
  longBreak:  { label: "Long Break", duration: 15 * 60, color: "#F59E0B" },
};

export default function Pomodoro({ dark }) {
  const [mode, setMode]       = useState("work");
  const [seconds, setSeconds] = useState(MODES.work.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "work") setSessions(n => n + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const switchMode = (m) => {
    setMode(m);
    setSeconds(MODES[m].duration);
    setRunning(false);
  };

  const reset = () => { setSeconds(MODES[mode].duration); setRunning(false); };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const pct = ((MODES[mode].duration - seconds) / MODES[mode].duration) * 100;
  const color = MODES[mode].color;

  const bg  = dark ? "#1E1E2E" : "rgba(255,255,255,0.8)";
  const txt = dark ? "#E2E8F0" : "#1E293B";
  const sub = dark ? "#64748B" : "#94A3B8";

  return (
    <div style={{ background: bg, backdropFilter: "blur(12px)", border: `1px solid ${color}33`, borderRadius: "16px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>⏱ Pomodoro</p>

      {/* Mode switcher */}
      <div style={{ display: "flex", gap: "0.3rem" }}>
        {Object.entries(MODES).map(([key, val]) => (
          <button key={key} onClick={() => switchMode(key)}
            style={{ flex: 1, padding: "0.3rem", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.68rem", fontWeight: 600, fontFamily: "inherit", background: mode === key ? `${val.color}22` : "transparent", color: mode === key ? val.color : sub, transition: "all 0.15s" }}>
            {val.label}
          </button>
        ))}
      </div>

      {/* Cercle */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ position: "relative", width: "90px", height: "90px" }}>
          <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="45" cy="45" r="40" fill="none" stroke={`${color}22`} strokeWidth="6" />
            <circle cx="45" cy="45" r="40" fill="none" stroke={color} strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color, fontFamily: "monospace" }}>{mm}:{ss}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button onClick={() => setRunning(!running)}
            style={{ background: color, color: "#fff", border: "none", borderRadius: "8px", padding: "0.4rem 0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 700, fontFamily: "inherit" }}>
            {running ? <Pause size={13} /> : <Play size={13} />}
            {running ? "Pause" : "Start"}
          </button>
          <button onClick={reset}
            style={{ background: `${color}22`, color, border: "none", borderRadius: "8px", padding: "0.4rem 0.6rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Sessions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: i < (sessions % 4) ? color : `${color}33` }} />
        ))}
        <span style={{ fontSize: "0.7rem", color: sub, marginLeft: "0.3rem" }}>{sessions} sessions</span>
      </div>
    </div>
  );
}