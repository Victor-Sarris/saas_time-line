import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import TogetherCounter, { hasStarted } from "./TogetherCounter.jsx";

/** Carta selada no fim da página — ela clica no envelope pra abrir. */
export default function FinalLetter({ config }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative px-5 pb-32 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.button
              key="envelope"
              type="button"
              onClick={() => setOpen(true)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.6 }}
              className="group mx-auto flex cursor-pointer flex-col items-center gap-4"
            >
              <span className="text-7xl drop-shadow-lg transition group-hover:animate-float-slow">
                💌
              </span>
              <span className="font-hand text-2xl text-romance-600">
                tem uma carta pra você aqui
              </span>
              <span className="rounded-full bg-romance-600 px-6 py-2.5 text-sm text-cream shadow-lg shadow-romance-300/60">
                abrir
              </span>
            </motion.button>
          ) : (
            <motion.article
              key="letter"
              initial={{ opacity: 0, y: 26, rotateX: -12 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="paper-note relative rounded-3xl bg-cream/90 p-6 text-left shadow-2xl shadow-romance-300/50 ring-1 ring-romance-100 sm:p-12"
            >
              <span
                aria-hidden="true"
                className="absolute -top-4 left-1/2 h-8 w-28 -translate-x-1/2 rotate-1 rounded-xs bg-romance-200/70"
              />

              <h2 className="font-display text-3xl text-romance-800 sm:text-4xl">
                {config.letter_title}
              </h2>

              <p className="mt-5 font-hand text-[1.4rem] leading-8 whitespace-pre-line text-romance-800 sm:mt-6 sm:text-3xl sm:leading-11">
                {config.letter_body}
              </p>

              <p className="mt-8 text-right font-hand text-2xl text-romance-500">
                — {config.his_name}
              </p>

              {hasStarted(config.couple_since) && (
                <div className="mt-10 border-t border-dashed border-romance-200 pt-8">
                  <TogetherCounter
                    since={config.couple_since}
                    label="e o relógio já está correndo:"
                  />
                </div>
              )}
            </motion.article>
          )}
        </AnimatePresence>

        <p className="mt-16 text-xs tracking-[0.3em] text-romance-300 uppercase">
          feito à mão, com amor · {config.his_name} &amp; {config.her_name}
        </p>
      </div>
    </section>
  );
}
