/**
 * Comprime a foto no navegador ANTES de enviar pro backend.
 *
 * Por que isso existe: funções serverless (Vercel, entre outras) recusam
 * requisições com corpo acima de ~4,5MB — e foto de celular passa disso
 * fácil. Aqui a imagem vira um WEBP de ~200KB antes de sair da máquina dela,
 * então o upload cabe no limite e ainda voa no 4G.
 *
 * O backend continua comprimindo de novo do lado dele: isto é conveniência,
 * não é a validação.
 */

// vai tentando mais forte até caber no limite
const ATTEMPTS = [
  { maxSide: 1600, quality: 0.82 },
  { maxSide: 1400, quality: 0.72 },
  { maxSide: 1200, quality: 0.6 },
];

const DEFAULT_MAX_BYTES = 3.5 * 1024 * 1024; // folga confortável sob os 4,5MB

/** Carrega o arquivo respeitando a rotação gravada pela câmera (EXIF). */
async function loadImage(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // alguns navegadores não aceitam a opção — tenta sem ela
      try {
        return await createImageBitmap(file);
      } catch {
        /* cai no <img> abaixo */
      }
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("não consegui abrir a imagem"));
    };
    image.src = url;
  });
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    if (typeof canvas.toBlob !== "function") return resolve(null);
    canvas.toBlob(resolve, type, quality);
  });
}

async function render(source, { maxSide, quality }) {
  const width = source.width || source.naturalWidth;
  const height = source.height || source.naturalHeight;
  if (!width || !height) return null;

  const scale = Math.min(1, maxSide / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(source, 0, 0, canvas.width, canvas.height);

  // WEBP é bem menor; se o navegador for antigo demais, JPEG resolve
  let blob = await toBlob(canvas, "image/webp", quality);
  let type = "image/webp";
  if (!blob) {
    blob = await toBlob(canvas, "image/jpeg", quality);
    type = "image/jpeg";
  }
  return blob ? { blob, type } : null;
}

function rename(file, type) {
  const base = file.name.replace(/\.[^.]+$/, "") || "foto";
  return `${base}.${type === "image/webp" ? "webp" : "jpg"}`;
}

/**
 * Devolve sempre um File utilizável — se qualquer coisa der errado no meio
 * do caminho, volta o arquivo original em vez de quebrar o upload.
 */
export async function compressImage(file, { maxBytes = DEFAULT_MAX_BYTES } = {}) {
  if (!file || !file.type?.startsWith("image/")) return file;
  if (typeof document === "undefined") return file;

  let source;
  try {
    source = await loadImage(file);
  } catch {
    return file;
  }

  let best = file;
  try {
    for (const attempt of ATTEMPTS) {
      const result = await render(source, attempt);
      if (!result) break;

      if (result.blob.size < best.size) {
        best = new File([result.blob], rename(file, result.type), {
          type: result.type,
          lastModified: Date.now(),
        });
      }
      if (best.size <= maxBytes) break;
    }
  } catch {
    return file;
  } finally {
    source?.close?.();
  }

  return best;
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
