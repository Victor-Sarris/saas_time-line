import { useEffect, useState } from "react";

function diffFrom(startISO) {
  const [y, m, d] = startISO.split("-").map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0);
  const total = Math.max(0, Date.now() - start.getTime());
  const seconds = Math.floor(total / 1000);
  return {
    dias: Math.floor(seconds / 86400),
    horas: Math.floor((seconds % 86400) / 3600),
    min: Math.floor((seconds % 3600) / 60),
    seg: seconds % 60,
  };
}

/** Contador ao vivo desde a data em que vocês começaram. */
export default function TogetherCounter({ since, label = "juntos há" }) {
  const [elapsed, setElapsed] = useState(() => (since ? diffFrom(since) : null));

  useEffect(() => {
    if (!since) return;
    setElapsed(diffFrom(since));
    const id = setInterval(() => setElapsed(diffFrom(since)), 1000);
    return () => clearInterval(id);
  }, [since]);

  if (!since || !elapsed) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="font-hand text-xl text-romance-600">{label}</span>
      <div className="flex gap-2 sm:gap-3">
        {Object.entries(elapsed).map(([unit, value]) => (
          <div
            key={unit}
            className="glass min-w-16 rounded-2xl px-3 py-2 text-center shadow-lg shadow-romance-200/50 sm:min-w-20 sm:px-4 sm:py-3"
          >
            <div className="font-display text-2xl text-romance-700 tabular-nums sm:text-3xl">
              {String(value).padStart(2, "0")}
            </div>
            <div className="text-[10px] tracking-[0.2em] text-romance-400 uppercase">
              {unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
