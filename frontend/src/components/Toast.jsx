import { AnimatePresence, motion } from "framer-motion";

export default function Toast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 24, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 12, x: "-50%" }}
          className="fixed bottom-6 left-1/2 z-80 rounded-full bg-romance-800 px-6 py-3 text-sm text-cream shadow-2xl shadow-romance-900/40"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
