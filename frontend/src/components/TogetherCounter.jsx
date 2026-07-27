import { useEffect, useState } from "react";

/**
 * Aceita "2026-08-04" ou "2026-08-04T20:30" (a hora exata do pedido).
 * Sem hora, começa à meia-noite daquele dia.
 */
export function parseMoment(value) {
  if (!value) return null;
  const [datePart, timePart = ""] = String(value).trim().split(/[T ]/);
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;

  const [hour = 0, minute = 0, second = 0] = timePart
    ? timePart.split(":").map(Number)
    : [];

  const moment = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
  return Number.isNaN(moment.getTime()) ? null : moment;
}

/** Já começou a contar? Serve pra decidir se o bloco aparece. */
export function hasStarted(value) {
  const moment = parseMoment(value);
  return Boolean(moment) && moment.getTime() <= Date.now();
}

function diffFrom(value) {
  const start = parseMoment(value);
  if (!start) return null;

  const total = Date.now() - start.getTime();
  if (total < 0) return null; // ainda não chegou a hora

  const seconds = Math.floor(total / 1000);
  return {
    dias: Math.floor(seconds / 86400),
    horas: Math.floor((seconds % 86400) / 3600),
    min: Math.floor((seconds % 3600) / 60),
    seg: seconds % 60,
  };
}

/**
 * Contador ao vivo desde o momento em que vocês começaram.
 * Enquanto a data não chega, ele simplesmente não aparece — melhor do que
 * mostrar 00 00 00 00 e parecer quebrado.
 */
export default function TogetherCounter({ since, label = "juntos há" }) {
  const [elapsed, setElapsed] = useState(() => diffFrom(since));

  useEffect(() => {
    if (!since) return;
    setElapsed(diffFrom(since));
    // segue rodando mesmo antes da hora, pra aparecer sozinho na virada
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
