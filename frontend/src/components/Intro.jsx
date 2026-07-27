import { motion } from "framer-motion";

/**
 * Cortina de abertura. O clique no botão é o gesto do usuário que
 * autoriza o navegador a liberar o player de música.
 */
export default function Intro({ herName, onOpen }) {
  return (
    <motion.div
      className="fixed inset-0 z-70 flex min-h-dvh flex-col items-center justify-center gap-6 overflow-y-auto bg-linear-to-b from-romance-950 via-romance-900 to-romance-800 px-6 py-10 text-center sm:gap-8"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 1.1, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-6xl animate-heartbeat"
      >
        💗
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9 }}
        className="font-hand text-2xl text-romance-200"
      >
        Fiz uma coisa pra você...
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 1 }}
        className="text-balance font-display text-[2.75rem] leading-tight text-cream sm:text-7xl"
      >
        {herName}
      </motion.h1>

      <motion.button
        type="button"
        onClick={onOpen}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.9 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="mt-2 cursor-pointer rounded-full border border-romance-300/60 bg-romance-100/10 px-9 py-4 font-display text-lg tracking-wide text-romance-100 shadow-[0_0_40px_-8px] shadow-romance-400/60 transition hover:bg-romance-100/20"
      >
        abrir a nossa história
      </motion.button>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="text-xs tracking-[0.3em] text-romance-200 uppercase"
      >
        de preferência com som
      </motion.span>
    </motion.div>
  );
}
