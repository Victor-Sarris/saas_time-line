import { useEffect, useRef, useState } from "react";
import Modal from "./Modal.jsx";
import { compressImage, formatBytes } from "../utils/compressImage.js";
import { todayISO } from "../utils/format.js";

// limites de envio
const HARD_LIMIT = 4.2 * 1024 * 1024;
const AUTHORS = ["ele", "ela", "nos"];
const EMPTY = {
  title: "",
  note: "",
  happened_on: todayISO(),
  location: "",
  author: "ele",
  is_favorite: false,
};

export default function AddMemoryModal({ config, onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [sizes, setSizes] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  // Estados da Cápsula do Tempo
  const [isTimeCapsule, setIsTimeCapsule] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");

  // Estados da Galeria
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const names = {
    ele: config?.his_name || "Ele",
    ela: config?.her_name || "Ela",
    nos: "Nós dois",
  };

  // Prepara o preview da imagem principal
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  // Processa a imagem principal
  const pickFile = async (candidate) => {
    if (!candidate) return;
    if (!candidate.type.startsWith("image/")) {
      setError("Esse arquivo não é uma imagem. 🥺");
      return;
    }

    setError("");
    setOptimizing(true);
    try {
      const otimizada = await compressImage(candidate);
      setFile(otimizada);
      setSizes({ antes: candidate.size, depois: otimizada.size });
      if (otimizada.size > HARD_LIMIT) {
        setError(
          "Essa foto ficou pesada demais mesmo depois de otimizada. Tenta uma outra?",
        );
      }
    } finally {
      setOptimizing(false);
    }
  };

  // Processa as múltiplas imagens da galeria
  const pickGalleryFiles = async (candidates) => {
    if (!candidates || candidates.length === 0) return;
    setOptimizing(true);

    const processedFiles = [];
    const previews = [];

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      if (candidate.type.startsWith("image/")) {
        const otimizada = await compressImage(candidate);
        processedFiles.push(otimizada);
        previews.push(URL.createObjectURL(otimizada));
      }
    }

    setGalleryFiles((prev) => [...prev, ...processedFiles]);
    setGalleryPreviews((prev) => [...prev, ...previews]);
    setOptimizing(false);
  };

  // Envio para o Backend
  const submit = async (event) => {
    event.preventDefault(); // Corrigido de e.preventDefault() para event.preventDefault()

    if (saving) return;
    if (optimizing)
      return setError("Só um segundo, ainda estou otimizando a foto.");
    if (!file) return setError("Escolhe uma foto principal pra essa memória.");
    if (file.size > HARD_LIMIT)
      return setError("Essa foto é pesada demais pro envio. Tenta uma outra?");
    if (!form.title.trim()) return setError("Dá um nome pra esse momento. ✨");

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));

    // Anexa a imagem principal
    payload.append("image", file);

    // Anexa a data da cápsula (se ativada)
    if (isTimeCapsule && unlockDate) {
      payload.append("unlock_date", new Date(unlockDate).toISOString());
    }

    // Anexa as imagens extra (Galeria)
    galleryFiles.forEach((extraFile) => {
      payload.append("gallery", extraFile);
    });

    setSaving(true);
    setError("");
    try {
      await onCreate(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} className="max-w-3xl">
      <form
        onSubmit={submit}
        className="max-h-[88dvh] overflow-y-auto overscroll-contain p-5 pt-7 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8"
      >
        <h2 className="font-display text-3xl text-romance-900">
          Guardar um momento
        </h2>
        <p className="mt-1 font-hand text-xl text-romance-500">
          uma foto e o que você sentiu nela.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Upload Principal */}
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              pickFile(event.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center transition ${
              dragging
                ? "border-romance-500 bg-romance-100"
                : "border-romance-200 bg-white/60 hover:border-romance-400 hover:bg-romance-50"
            }`}
          >
            {optimizing ? (
              <>
                <span className="animate-heartbeat text-4xl">💗</span>
                <p className="text-sm text-romance-500">otimizando a foto...</p>
              </>
            ) : preview ? (
              <>
                <img
                  src={preview}
                  alt="pré-visualização"
                  className="max-h-56 w-full rounded-xl object-contain"
                />
                {sizes && (
                  <p className="text-xs text-romance-400">
                    {sizes.depois < sizes.antes ? (
                      <>
                        {formatBytes(sizes.antes)} →{" "}
                        <strong className="text-romance-600">
                          {formatBytes(sizes.depois)}
                        </strong>{" "}
                        ✨
                      </>
                    ) : (
                      formatBytes(sizes.depois)
                    )}
                  </p>
                )}
              </>
            ) : (
              <>
                <span className="text-4xl">📸</span>
                <p className="text-sm text-romance-500">
                  <span className="pointer-coarse:hidden">
                    Arraste a foto principal aqui ou clique para escolher
                  </span>
                  <span className="hidden pointer-coarse:inline">
                    Toque para escolher uma foto principal
                  </span>
                </p>
                <p className="text-xs text-romance-300">
                  JPG, PNG ou WEBP — otimizo o tamanho pra você
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => pickFile(event.target.files?.[0])}
            />
          </div>

          {/* Campos de Texto */}
          <div className="space-y-4">
            <Field label="Esse momento foi...">
              <input
                type="text"
                value={form.title}
                onChange={update("title")}
                maxLength={140}
                placeholder="o dia em que a gente..."
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Quando">
                <input
                  type="date"
                  value={form.happened_on}
                  onChange={update("happened_on")}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Onde (opcional)">
                <input
                  type="text"
                  value={form.location}
                  onChange={update("location")}
                  placeholder="praia, casa, ..."
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Quem está guardando">
              <div className="flex gap-2">
                {AUTHORS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((c) => ({ ...c, author: value }))}
                    className={`flex-1 cursor-pointer rounded-full px-3 py-3 text-sm transition sm:py-2 sm:text-xs ${
                      form.author === value
                        ? "bg-romance-600 text-cream shadow-md"
                        : "bg-romance-50 text-romance-500 ring-1 ring-romance-100 hover:bg-romance-100"
                    }`}
                  >
                    {names[value]}
                  </button>
                ))}
              </div>
            </Field>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-romance-600">
              <input
                type="checkbox"
                checked={form.is_favorite}
                onChange={(event) =>
                  setForm((c) => ({ ...c, is_favorite: event.target.checked }))
                }
                className="h-4 w-4 accent-romance-600"
              />
              marcar como momento favorito 💖
            </label>
          </div>
        </div>

        {/* Upload da Galeria (Embutido no estilo do projeto) */}
        <div className="mt-6 p-4 rounded-2xl bg-white/60 border border-romance-100">
          <Field label="Tem mais fotos desse dia? (Galeria Extra)">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => pickGalleryFiles(event.target.files)}
              className="mt-2 block w-full text-sm text-romance-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-romance-100 file:text-romance-700 hover:file:bg-romance-200 file:cursor-pointer file:transition"
            />
          </Field>

          {/* Pré-visualização da galeria */}
          {galleryPreviews.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar snap-x">
              {galleryPreviews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  className="h-16 w-16 object-cover rounded-xl shadow-sm border border-romance-200 snap-center"
                  alt={`Extra ${idx}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cápsula do Tempo (Embutido no estilo do projeto) */}
        <div className="mt-4 p-4 rounded-2xl bg-romance-50/50 border border-romance-100">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-romance-700 font-medium">
            <input
              type="checkbox"
              checked={isTimeCapsule}
              onChange={(e) => setIsTimeCapsule(e.target.checked)}
              className="h-4 w-4 accent-romance-600 cursor-pointer"
            />
            Transformar em Cápsula do Tempo? ⏳
          </label>

          {isTimeCapsule && (
            <div className="mt-4">
              <Field label="Quando esta memória deve ser revelada?">
                <input
                  type="datetime-local"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  required
                  className={inputClass}
                />
              </Field>
            </div>
          )}
        </div>

        <div className="mt-5">
          <Field label="A anotação">
            <textarea
              value={form.note}
              onChange={update("note")}
              rows={3}
              placeholder="o que você quer lembrar sobre esse dia..."
              className="w-full resize-none rounded-2xl bg-white/80 px-4 py-3 font-hand text-2xl leading-8 text-romance-800 ring-1 ring-romance-200 outline-none placeholder:text-romance-300 focus:ring-2 focus:ring-romance-400"
            />
          </Field>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-romance-100 px-4 py-2 text-sm text-romance-700">
            {error}
          </p>
        )}

        {/* Botões de Ação */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full px-5 py-3 text-sm text-romance-400 transition hover:text-romance-700"
          >
            cancelar
          </button>
          <button
            type="submit"
            disabled={saving || optimizing}
            className="flex-1 cursor-pointer rounded-full bg-romance-600 px-6 py-3 font-medium text-cream shadow-lg shadow-romance-300/60 transition hover:bg-romance-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "guardando..."
              : optimizing
                ? "otimizando..."
                : "guardar na nossa timeline 💗"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const inputClass =
  "w-full rounded-xl bg-white/80 px-4 py-3 text-base text-romance-800 ring-1 ring-romance-200 outline-none placeholder:text-romance-300 focus:ring-2 focus:ring-romance-400 sm:py-2.5 sm:text-sm";

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] tracking-[0.2em] text-romance-400 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
