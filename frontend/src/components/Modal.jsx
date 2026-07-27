import { useEffect } from "react";
import { motion } from "framer-motion";

/** Casca reutilizável: fundo escurecido, ESC pra fechar, trava o scroll. */
export default function Modal({ onClose, children, className = "" }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);

    // trava a página atrás sem perder a posição do scroll (o iOS insiste
    // em rolar o fundo se a gente só mexer no overflow)
    const { body } = document;
    const scrollY = window.scrollY;
    const anterior = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      Object.assign(body.style, anterior);
      window.scrollTo(0, scrollY);
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
      className="fixed inset-0 z-60 flex items-end justify-center overflow-y-auto overscroll-contain bg-romance-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
        className={`relative mt-auto w-full rounded-t-3xl bg-cream shadow-2xl shadow-romance-950/50 sm:my-auto sm:rounded-3xl ${className}`}
      >
        {/* alcinha de arrastar — só decorativa, mas diz "isso aqui é uma gaveta" */}
        <span
          aria-hidden="true"
          className="absolute top-2.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-romance-200 sm:hidden"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-romance-600/95 text-xl text-cream shadow-lg backdrop-blur-xs transition hover:bg-romance-700 sm:-top-3 sm:-right-3 sm:h-9 sm:w-9 sm:text-lg"
        >
          ×
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
