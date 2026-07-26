import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Modal from "./Modal.jsx";
import { AUTHOR_LABELS, formatLongDate } from "../utils/format.js";

const AUTHORS = ["ele", "ela", "nos"];

export default function MemoryModal({
  memory,
  config,
  onClose,
  onAddAnnotation,
  onToggleFavorite,
  onDelete,
}) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("ele");
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const names = {
    ele: config?.his_name || "Ele",
    ela: config?.her_name || "Ela",
    nos: "Nós dois",
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await onAddAnnotation(memory.id, { text: text.trim(), author });
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal onClose={onClose} className="max-w-5xl overflow-hidden">
      <div className="grid max-h-[85vh] grid-cols-1 overflow-y-auto md:grid-cols-[1.1fr_1fr] md:overflow-hidden">
        <div className="relative bg-romance-950/95">
          <img
            src={memory.image_url}
            alt={memory.title}
            className="max-h-[42vh] w-full object-contain md:max-h-[85vh]"
          />
          <button
            type="button"
            onClick={() => onToggleFavorite(memory.id)}
            className="absolute top-4 left-4 cursor-pointer rounded-full bg-cream/90 px-3 py-2 text-lg shadow-md transition hover:scale-110"
            title={
              memory.is_favorite
                ? "Tirar dos favoritos"
                : "Marcar como favorito"
            }
          >
            {memory.is_favorite ? "💖" : "🤍"}
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto p-6 sm:p-8">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-romance-400 uppercase">
              {formatLongDate(memory.happened_on)}
              {memory.location && ` · ${memory.location}`}
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight text-romance-900">
              {memory.title}
            </h2>
            <p className="mt-1 text-xs text-romance-400">
              guardado por {names[memory.author] ?? AUTHOR_LABELS[memory.author]}
            </p>
          </div>

          {memory.note && (
            <blockquote className="paper-note rounded-2xl bg-white/70 p-4 font-hand text-2xl leading-7 text-romance-800 ring-1 ring-romance-100">
              {memory.note}
            </blockquote>
          )}

          <div className="space-y-3">
            <h3 className="text-[11px] tracking-[0.28em] text-romance-400 uppercase">
              recadinhos
            </h3>

            <AnimatePresence initial={false}>
              {memory.annotations?.map((annotation) => (
                <motion.div
                  key={annotation.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className={`rounded-2xl px-4 py-3 ring-1 ${
                    annotation.author === "ela"
                      ? "bg-romance-50 ring-romance-100"
                      : "bg-sky-50/70 ring-sky-100"
                  }`}
                >
                  <span className="block text-[11px] font-medium text-romance-400">
                    {names[annotation.author] ?? annotation.author_display}
                  </span>
                  <p className="font-hand text-xl text-romance-800">
                    {annotation.text}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>

            {!memory.annotations?.length && (
              <p className="text-sm text-romance-300 italic">
                Nenhum recado ainda. Escreve o primeiro? 💌
              </p>
            )}
          </div>

          <form onSubmit={submit} className="mt-auto space-y-3">
            <div className="flex gap-2">
              {AUTHORS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAuthor(value)}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-xs transition ${
                    author === value
                      ? "bg-romance-600 text-cream shadow-md"
                      : "bg-romance-50 text-romance-500 ring-1 ring-romance-100 hover:bg-romance-100"
                  }`}
                >
                  {names[value]}
                </button>
              ))}
            </div>

            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={2}
              placeholder="deixa um recadinho nessa foto..."
              className="w-full resize-none rounded-2xl border-none bg-white/80 px-4 py-3 font-hand text-xl text-romance-800 ring-1 ring-romance-200 outline-none placeholder:text-romance-300 focus:ring-2 focus:ring-romance-400"
            />

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="flex-1 cursor-pointer rounded-full bg-romance-600 px-5 py-2.5 text-sm font-medium text-cream shadow-lg shadow-romance-300/60 transition hover:bg-romance-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? "guardando..." : "guardar recado"}
              </button>

              <button
                type="button"
                onClick={() =>
                  confirmDelete ? onDelete(memory.id) : setConfirmDelete(true)
                }
                className="cursor-pointer rounded-full px-3 py-2.5 text-xs text-romance-300 transition hover:text-romance-600"
              >
                {confirmDelete ? "confirmar exclusão?" : "apagar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
