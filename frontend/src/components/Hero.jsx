import { motion } from "framer-motion";
import ExportBookButton from "./ExportBookButton.jsx";

import TogetherCounter from "./TogetherCounter.jsx";

export default function Hero({ config, summary, memories }) {
  const total = summary?.total_memories ?? 0;

  return (
    <header className="relative flex min-h-[92dvh] flex-col items-center justify-center gap-7 px-6 py-20 text-center sm:gap-8 sm:py-24">
      <motion.span
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="font-hand text-2xl text-romance-500"
      >
        para {config.her_name}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.15 }}
        className="text-gradient-romance max-w-3xl text-balance font-display text-[2.6rem] leading-[1.08] font-semibold sm:text-7xl"
      >
        {config.hero_title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.35 }}
        className="max-w-xl text-pretty text-base leading-relaxed text-romance-900/70 sm:text-lg"
      >
        {config.hero_subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.55 }}
      >
        <TogetherCounter since={config.couple_since} />
      </motion.div>

      {total > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-sm tracking-[0.25em] text-romance-400 uppercase"
        >
          {total} {total === 1 ? "momento guardado" : "momentos guardados"}
        </motion.p>
      )}

      {memories?.length > 0 && (
        <ExportBookButton memories={memories} config={config} />
      )}

      <motion.a
        href="#timeline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="group absolute bottom-6 flex flex-col items-center gap-1.5 py-2 text-romance-500 sm:bottom-8 sm:gap-2"
      >
        <span className="font-hand text-lg">role para começar</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl"
        >
          ↓
        </motion.span>
      </motion.a>
    </header>
  );
}
