import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import AddMemoryModal from "./components/AddMemoryModal.jsx";
import FallingPetals from "./components/FallingPetals.jsx";
import FinalLetter from "./components/FinalLetter.jsx";
import Hero from "./components/Hero.jsx";
import Intro from "./components/Intro.jsx";
import MemoryModal from "./components/MemoryModal.jsx";
import SpotifyPlayer from "./components/SpotifyPlayer.jsx";
import Timeline from "./components/Timeline.jsx";
import Toast from "./components/Toast.jsx";
import { useTimeline } from "./hooks/useTimeline.js";

const FILTERS = [
  { id: "todos", label: "tudo" },
  { id: "favoritos", label: "💖 favoritos" },
  { id: "ele", label: "por ele" },
  { id: "ela", label: "por ela" },
  { id: "nos", label: "nós dois" },
];

export default function App() {
  const [opened, setOpened] = useState(false);
  const [filter, setFilter] = useState("todos");
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");

  const query = useMemo(() => {
    if (filter === "favoritos") return { favorites: "1" };
    if (["ele", "ela", "nos"].includes(filter)) return { author: filter };
    return {};
  }, [filter]);

  const {
    config,
    memories,
    summary,
    loading,
    error,
    reload,
    createMemory,
    deleteMemory,
    toggleFavorite,
    addAnnotation,
  } = useTimeline(query);

  const selected = memories.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    document.title = `A nossa história · ${config.her_name}`;
  }, [config.her_name]);

  const handleCreate = async (formData) => {
    await createMemory(formData);
    setAdding(false);
    setToast("Momento guardado na nossa timeline 💗");
  };

  const handleDelete = async (id) => {
    setSelectedId(null);
    await deleteMemory(id);
    setToast("Memória apagada.");
  };

  const handleAnnotation = async (id, payload) => {
    await addAnnotation(id, payload);
    setToast("Recadinho guardado 💌");
  };

  return (
    <div className="relative min-h-screen">
      <FallingPetals />

      <AnimatePresence>
        {!opened && (
          <Intro herName={config.her_name} onOpen={() => setOpened(true)} />
        )}
      </AnimatePresence>

      <main className="relative z-10">
        <Hero config={config} summary={summary} />

        {/* filtros */}
        {memories.length > 0 || filter !== "todos" ? (
          <div className="sticky top-0 z-40 mb-8 flex justify-center px-4 py-3">
            <div className="glass flex flex-wrap justify-center gap-1.5 rounded-full p-1.5 shadow-lg shadow-romance-200/50">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs transition ${
                    filter === item.id
                      ? "bg-romance-600 text-cream shadow-md"
                      : "text-romance-500 hover:bg-romance-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {loading && (
          <div className="flex flex-col items-center gap-3 py-24 text-romance-400">
            <span className="animate-heartbeat text-4xl">💗</span>
            <p className="font-hand text-xl">juntando as nossas memórias...</p>
          </div>
        )}

        {error && !loading && (
          <div className="mx-auto max-w-lg rounded-3xl bg-cream/90 p-8 text-center shadow-xl ring-1 ring-romance-100">
            <p className="text-sm text-romance-700">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-4 cursor-pointer rounded-full bg-romance-600 px-5 py-2 text-sm text-cream"
            >
              tentar de novo
            </button>
          </div>
        )}

        {!loading && !error && memories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md px-6 py-16 text-center"
          >
            <span className="text-5xl">📷</span>
            <p className="mt-4 font-display text-2xl text-romance-700">
              A linha do tempo está vazia
            </p>
            <p className="mt-2 font-hand text-xl text-romance-500">
              a primeira memória é a mais bonita de guardar.
            </p>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-6 cursor-pointer rounded-full bg-romance-600 px-6 py-3 text-sm text-cream shadow-lg shadow-romance-300/60"
            >
              guardar a primeira foto
            </button>
          </motion.div>
        )}

        {!loading && !error && memories.length > 0 && (
          <Timeline memories={memories} onOpen={(m) => setSelectedId(m.id)} />
        )}

        <FinalLetter config={config} />
      </main>

      {/* botão flutuante */}
      <motion.button
        type="button"
        onClick={() => setAdding(true)}
        whileHover={{ scale: 1.08, rotate: 90 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Guardar um novo momento"
        className="fixed right-5 bottom-5 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-linear-to-br from-romance-500 to-romance-700 text-3xl font-light text-cream shadow-xl shadow-romance-400/50"
      >
        +
      </motion.button>

      <SpotifyPlayer embedUrl={config.spotify_embed_url} started={opened} />

      <AnimatePresence>
        {selected && (
          <MemoryModal
            key="detail"
            memory={selected}
            config={config}
            onClose={() => setSelectedId(null)}
            onAddAnnotation={handleAnnotation}
            onToggleFavorite={toggleFavorite}
            onDelete={handleDelete}
          />
        )}
        {adding && (
          <AddMemoryModal
            key="add"
            config={config}
            onClose={() => setAdding(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>

      <Toast message={toast} />
    </div>
  );
}
