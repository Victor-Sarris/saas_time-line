import { useEffect } from "react";
import { motion } from "framer-motion";

/** Casca reutilizável: fundo escurecido, ESC pra fechar, trava o scroll. */
export default function Modal({ onClose, children, className = "" }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-romance-950/70 p-4 backdrop-blur-sm sm:p-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
        className={`relative my-auto w-full rounded-3xl bg-cream shadow-2xl shadow-romance-950/50 ${className}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute -top-3 -right-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-romance-600 text-lg text-cream shadow-lg transition hover:bg-romance-700"
        >
          ×
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
