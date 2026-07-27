import { useState } from "react";
import { motion } from "framer-motion";

const PANEL_HEIGHT = 404; // 352 do iframe + o cabecinho e o padding

/**
 * Player flutuante com o embed oficial do Spotify.
 *
 * Detalhe importante: o iframe NUNCA é desmontado depois que aparece.
 * Fechar o player só encolhe o painel (height: 0 + overflow hidden) — o
 * iframe continua vivo lá dentro e a música não para. Se ele fosse
 * removido da árvore, o Spotify seria descarregado junto e o som cortaria.
 *
 * Ele também só monta depois que a pessoa clicou em "abrir a nossa história",
 * porque é esse gesto que dá ao navegador permissão pra tocar som.
 */
export default function SpotifyPlayer({ embedUrl, started = false }) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  if (!embedUrl || !started) return null;

  const src = `${embedUrl}?utm_source=generator&theme=0&autoplay=1`;

  const toggle = () => {
    setOpen((value) => !value);
    setEverOpened(true);
  };

  return (
    <div className="bottom-safe fixed left-5 z-50 flex flex-col items-start gap-3">
      <motion.div
        initial={false}
        animate={
          open
            ? { height: PANEL_HEIGHT, opacity: 1, y: 0 }
            : { height: 0, opacity: 0, y: 12 }
        }
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={!open}
        className={`w-[min(23rem,calc(100vw-2.5rem))] overflow-hidden ${
          open ? "" : "pointer-events-none"
        }`}
      >
        <div className="rounded-3xl bg-cream/95 p-3 shadow-2xl shadow-romance-900/30 ring-1 ring-romance-200 backdrop-blur-md">
          <p className="px-2 pb-2 font-hand text-lg text-romance-500">
            a trilha sonora da gente ♫
          </p>
          <iframe
            title="Nossa playlist no Spotify"
            src={src}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="rounded-2xl"
          />
        </div>
      </motion.div>

      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label={
          open
            ? "Esconder a playlist (a música continua)"
            : "Mostrar a playlist"
        }
        title={
          everOpened && !open
            ? "A música continua tocando 💗"
            : "Nossa playlist"
        }
        className="relative flex h-15 w-15 cursor-pointer items-center justify-center rounded-full bg-linear-to-br from-romance-500 to-romance-700 text-2xl text-cream shadow-xl shadow-romance-400/50 sm:h-14 sm:w-14"
      >
        <motion.span
          animate={everOpened ? { rotate: 360 } : { rotate: 0 }}
          transition={
            everOpened
              ? { duration: 6, repeat: Infinity, ease: "linear" }
              : { duration: 0.3 }
          }
        >
          {everOpened ? "💿" : "🎧"}
        </motion.span>

        {!open && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-70" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-gold" />
          </span>
        )}
      </motion.button>
    </div>
  );
}
