import React from "react";

const EFFECTS = [
  { id: "hearts", label: "Corações", icon: "❤️" },
  { id: "petals", label: "Pétalas", icon: "🌸" },
  { id: "snow", label: "Neve", icon: "❄️" },
  { id: "stars", label: "Estrelas", icon: "✨" },
  { id: "confetti", label: "Confetes", icon: "🎊" },
];

export default function ThemeSelector({ currentEffect, onEffectChange }) {
  return (
    <div className="relative z-40 mb-4 flex flex-col items-center justify-center px-3 sm:px-4">
      <p className="mb-2 font-hand text-lg text-romance-500">
        clima da nossa história
      </p>

      <div className="glass hide-scrollbar flex max-w-full snap-x gap-1.5 overflow-x-auto rounded-full p-1.5 shadow-lg shadow-romance-200/50">
        {EFFECTS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onEffectChange(item.id)}
            className={`shrink-0 snap-center flex items-center gap-1.5 cursor-pointer rounded-full px-4 py-2.5 text-sm whitespace-nowrap transition sm:py-1.5 sm:text-xs ${
              currentEffect === item.id
                ? "bg-romance-600 text-cream shadow-md"
                : "text-romance-500 hover:bg-romance-100"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
