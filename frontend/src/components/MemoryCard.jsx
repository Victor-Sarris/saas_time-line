import { motion } from "framer-motion";
import { FaLock } from "react-icons/fa";
import { AUTHOR_LABELS, formatLongDate } from "../utils/format.js";

const AUTHOR_STYLES = {
  // azul frio — contraste clássico com os temas quentes
  ele: "bg-sky-100/80 text-sky-700",
  // segue o tema atual (rosa padrão, âmbar no nordestino, etc.)
  ela: "bg-romance-100 text-romance-700",
  // dourado adaptativo — usa --color-gold, que muda com o tema
  nos: "bg-gold/20 text-romance-800",
};

export default function MemoryCard({ memory, side = "left", onOpen }) {
  const tilt = side === "left" ? -1.4 : 1.4;
  const notes = memory.annotations?.length ?? 0;

  const handleOpen = () => {
    if (memory.is_locked) {
      alert(
        `Esta cápsula do tempo só abre em: ${new Date(memory.unlock_date).toLocaleDateString()}`,
      );
    } else {
      onOpen(memory);
    }
  };

  const srcSet = [
    memory.thumb_url && `${memory.thumb_url} 640w`,
    memory.image_url && `${memory.image_url} 1600w`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.article
      initial={{ opacity: 0, y: 40, rotate: tilt * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ rotate: 0, y: -6, scale: 1.015 }}
      onClick={handleOpen}
      className={`group relative cursor-pointer rounded-[22px] bg-cream p-3 shadow-[0_18px_45px_-18px] shadow-romance-900/40 ring-1 ring-romance-100 transition-shadow hover:shadow-[0_26px_60px_-18px] hover:shadow-romance-700/40 ${memory.is_locked ? "opacity-90" : ""}`}
    >
      {/* fitinha de washi tape */}
      <span
        aria-hidden="true"
        className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 rounded-xs bg-romance-200/70 shadow-sm"
      />

      {/* Esconde a tag de favorito se a cápsula estiver trancada */}
      {memory.is_favorite && !memory.is_locked && (
        <span
          title="momento favorito"
          className="absolute -top-3 -right-2 z-10 animate-heartbeat rounded-full bg-cream px-2 py-1 text-lg shadow-md"
        >
          ❤️
        </span>
      )}

      <div className="relative overflow-hidden rounded-2xl bg-romance-100">
        {memory.is_locked ? (
          <div className="aspect-4/5 w-full flex flex-col items-center justify-center bg-romance-900/80 text-cream sm:aspect-3/2">
            <FaLock size={40} className="mb-3 text-romance-300" />
            <span className="font-display text-lg">Cápsula do Tempo</span>
          </div>
        ) : (
          <>
            <img
              src={memory.thumb_url || memory.image_url}
              srcSet={srcSet || undefined}
              sizes="(min-width: 768px) 470px, 92vw"
              alt={memory.title}
              loading="lazy"
              draggable="false"
              width={memory.image_width || undefined}
              height={memory.image_height || undefined}
              className="aspect-4/5 w-full object-cover transition duration-700 group-hover:scale-[1.05] sm:aspect-3/2"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-romance-950/55 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-medium tracking-wide text-romance-700">
              {formatLongDate(memory.happened_on)}
            </span>
            {memory.location && (
              <span className="absolute right-3 bottom-3 rounded-full bg-romance-900/60 px-3 py-1 text-[11px] text-cream backdrop-blur-xs">
                📍 {memory.location}
              </span>
            )}
          </>
        )}
      </div>

      <div className="space-y-2 px-2 pt-4 pb-2">
        <h3 className="font-display text-xl leading-snug text-romance-900">
          {memory.is_locked ? "Guardado a sete chaves..." : memory.title}
        </h3>

        {!memory.is_locked && memory.note && (
          <p className="line-clamp-3 font-hand text-xl leading-snug text-romance-700/90">
            {memory.note}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              AUTHOR_STYLES[memory.author] ?? AUTHOR_STYLES.nos
            }`}
          >
            {AUTHOR_LABELS[memory.author] ?? "Nós dois"}
          </span>
          {notes > 0 && !memory.is_locked && (
            <span className="rounded-full bg-romance-50 px-2.5 py-1 text-[11px] text-romance-500 ring-1 ring-romance-100">
              💬 {notes} {notes === 1 ? "recado" : "recados"}
            </span>
          )}
          <span className="ml-auto text-[11px] text-romance-300 opacity-0 transition group-hover:opacity-100 pointer-coarse:opacity-100">
            {memory.is_locked ? "trancado 🔒" : "abrir ↗"}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
