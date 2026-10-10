import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GrConfigure } from "react-icons/gr";
import AddMemoryModal from "./components/AddMemoryModal.jsx";
import FinalLetter from "./components/FinalLetter.jsx";
import Hero from "./components/Hero.jsx";
import Intro from "./components/Intro.jsx";
import MemoryModal from "./components/MemoryModal.jsx";
import SpotifyPlayer from "./components/SpotifyPlayer.jsx";
import Timeline from "./components/Timeline.jsx";
import Toast from "./components/Toast.jsx";
import { useTimeline } from "./hooks/useTimeline.js";
import BackgroundEffects from "./components/BackgroundEffects.jsx";
import ThemeSelector from "./components/ThemeSelector.jsx";
import Modal from "./components/Modal.jsx";
import ExportBookButton from "./components/ExportBookButton.jsx";

const FILTERS = [
  { id: "todos", label: "tudo" },
  { id: "favoritos", label: "🌟 favoritos" },
  { id: "ele", label: "por ele" },
  { id: "ela", label: "por ela" },
  { id: "nos", label: "nós dois" },
];

export default function App() {
  const [opened, setOpened] = useState(false);
  const [filter, setFilter] = useState("todos");
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState("");

  const [backgroundEffect, setBackgroundEffect] = useState(() => {
    return localStorage.getItem("tema_site") || "hearts";
  });

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

  // ✅ Callbacks estáveis — evita que o useEffect do Modal re-rode
  //    a cada render e deixe o body travado.
  const closeSettings = useCallback(() => setShowSettings(false), []);
  const closeAdding = useCallback(() => setAdding(false), []);
  const closeSelected = useCallback(() => setSelectedId(null), []);
  const openSettings = useCallback(() => setShowSettings(true), []);
  const openAdding = useCallback(() => setAdding(true), []);
  const openIntro = useCallback(() => setOpened(true), []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    document.title = `A nossa história • ${config.her_name}`;
  }, [config.her_name]);

  const handleCreate = useCallback(
    async (formData) => {
      await createMemory(formData);
      setAdding(false);
      setToast("Momento guardado na nossa timeline 💌");
    },
    [createMemory],
  );

  const handleDelete = useCallback(
    async (id) => {
      setSelectedId(null);
      await deleteMemory(id);
      setToast("Memória apagada.");
    },
    [deleteMemory],
  );

  const handleAnnotation = useCallback(
    async (id, payload) => {
      await addAnnotation(id, payload);
      setToast("Recadinho guardado 📝");
    },
    [addAnnotation],
  );

  const handleOpenMemory = useCallback((m) => setSelectedId(m.id), []);

  useEffect(() => {
    localStorage.setItem("tema_site", backgroundEffect);
    document.documentElement.setAttribute("data-theme", backgroundEffect);
  }, [backgroundEffect]);

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <BackgroundEffects effectType={backgroundEffect} />

      <AnimatePresence>
        {!opened && <Intro herName={config.her_name} onOpen={openIntro} />}
      </AnimatePresence>

      <main className="relative z-10">
        <Hero config={config} summary={summary} memories={memories} />

        {/* botão flutuante de configurações */}
        {opened && (
          <motion.button
            type="button"
            onClick={openSettings}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.05, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            className="fixed top-5 right-5 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-cream/90 text-xl text-romance-600 shadow-lg shadow-romance-300/30 ring-1 ring-romance-200 backdrop-blur-md transition hover:bg-cream sm:top-6 sm:right-6"
            aria-label="Personalizar aparência"
          >
            <GrConfigure />
          </motion.button>
        )}

        {/* filtro */}
        {memories.length > 0 || filter !== "todos" ? (
          <div className="sticky top-0 z-40 mb-6 flex justify-center px-3 py-3 sm:mb-8 sm:px-4">
            <div className="glass hide-scrollbar flex max-w-full snap-x gap-1.5 overflow-x-auto rounded-full p-1.5 shadow-lg shadow-romance-200/50">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`shrink-0 snap-center cursor-pointer rounded-full px-4 py-2.5 text-sm whitespace-nowrap transition sm:py-1.5 sm:text-xs ${
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
            <span className="animate-heartbeat text-4xl">🤍</span>
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
            <span className="text-5xl">🎞️</span>
            <p className="mt-4 font-display text-2xl text-romance-700">
              A linha do tempo está vazia
            </p>
            <p className="mt-2 font-hand text-xl text-romance-500">
              a primeira memória é a mais bonita de guardar.
            </p>
            <button
              type="button"
              onClick={openAdding}
              className="mt-6 cursor-pointer rounded-full bg-romance-600 px-6 py-3 text-sm text-cream shadow-lg shadow-romance-300/60"
            >
              guardar a primeira foto
            </button>
          </motion.div>
        )}

        {!loading && !error && memories.length > 0 && (
          <Timeline memories={memories} onOpen={handleOpenMemory} />
        )}

        <FinalLetter config={config} />
      </main>

      {/* botão flutuante de adicionar (+) */}
      <motion.button
        type="button"
        onClick={openAdding}
        whileHover={{ scale: 1.08, rotate: 90 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Guardar um novo momento"
        className="bottom-safe fixed right-5 z-50 flex h-15 w-15 cursor-pointer items-center justify-center rounded-full bg-linear-to-br from-romance-500 to-romance-700 text-3xl font-light text-cream shadow-xl shadow-romance-400/50 sm:h-14 sm:w-14"
      >
        +
      </motion.button>

      <SpotifyPlayer embedUrl={config.spotify_embed_url} started={opened} />

      {/* MODAIS DA APLICAÇÃO */}
      <AnimatePresence>
        {selected && (
          <MemoryModal
            key="detail"
            memory={selected}
            config={config}
            onClose={closeSelected}
            onAddAnnotation={handleAnnotation}
            onToggleFavorite={toggleFavorite}
            onDelete={handleDelete}
          />
        )}

        {adding && (
          <AddMemoryModal
            key="add"
            config={config}
            onClose={closeAdding}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>

      {/* MODAL DE CONFIGURAÇÕES / TEMA */}
      {showSettings && (
        <Modal
          key="settings"
          onClose={closeSettings}
          className="max-w-md px-5 pt-9 pb-6 sm:px-7 sm:pt-10 sm:pb-7"
        >
          {/* Cabeçalho */}
          <div className="text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-romance-100 to-romance-200 text-2xl shadow-inner shadow-romance-200/60">
              ✨
            </span>
            <h2 className="mt-3 font-display text-3xl leading-tight text-romance-900">
              Configurações
            </h2>
            <p className="mt-1 font-hand text-xl text-romance-500">
              deixa tudo com a nossa cara
            </p>
          </div>

          {/* Seção: Aparência */}
          <div className="mt-6 rounded-3xl bg-romance-50/60 p-4 ring-1 ring-romance-100">
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className="text-base">🎨</span>
              <span className="text-[11px] font-semibold tracking-[0.28em] text-romance-400 uppercase">
                Aparência
              </span>
            </div>
            <ThemeSelector
              currentEffect={backgroundEffect}
              onEffectChange={setBackgroundEffect}
            />
          </div>

          {/* Seção: Exportar (só aparece se tiver memória) */}
          {memories.length > 0 && (
            <div className="mt-4 rounded-3xl bg-romance-50/60 p-4 ring-1 ring-romance-100">
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className="text-base">📖</span>
                <span className="text-[11px] font-semibold tracking-[0.28em] text-romance-400 uppercase">
                  Nosso livrinho
                </span>
              </div>
              <ExportBookButton memories={memories} config={config} />
            </div>
          )}

          {/* Botão pronto */}
          <button
            type="button"
            onClick={closeSettings}
            className="mt-5 w-full cursor-pointer rounded-2xl bg-romance-100 px-6 py-3.5 text-sm font-medium text-romance-700 transition hover:bg-romance-200 active:scale-[0.99]"
          >
            Pronto
          </button>
        </Modal>
      )}

      <Toast message={toast} />
    </div>
  );
}
