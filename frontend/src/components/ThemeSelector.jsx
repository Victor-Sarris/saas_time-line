import React from "react";

const EFFECTS = [
  { id: "hearts", label: "Corações", icon: "❤️" },
  { id: "petals", label: "Pétalas", icon: "🌸" },
  { id: "snow", label: "Neve", icon: "❄️" },
  { id: "stars", label: "Estrelas", icon: "✨" },
  { id: "confetti", label: "Confetes", icon: "🎊" },
  { id: "nordestino", label: "Nordestino", icon: "☀️" },
];

export default function ThemeSelector({ currentEffect, onEffectChange }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {EFFECTS.map((item) => {
          const active = currentEffect === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onEffectChange(item.id)}
              aria-pressed={active}
              className={`group relative flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl px-2 py-3 transition-all duration-300 ${
                active
                  ? "scale-[1.03] bg-linear-to-br from-romance-500 to-romance-700 text-cream shadow-lg shadow-romance-400/50"
                  : "bg-white/70 text-romance-500 ring-1 ring-romance-100 hover:-translate-y-0.5 hover:bg-romance-50 hover:ring-romance-200"
              }`}
            >
              <span
                className={`text-2xl transition-transform duration-300 ${
                  active ? "scale-110" : "group-hover:scale-110"
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[11px] font-medium tracking-wide">
                {item.label}
              </span>
              {active && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cream text-[9px] font-bold text-romance-600 shadow-md">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
