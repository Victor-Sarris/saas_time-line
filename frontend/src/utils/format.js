const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** "2025-03-14" -> Date local (sem susto de fuso horário). */
export function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatLongDate(value) {
  const date = parseDate(value);
  if (!date) return "";
  return `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

export function formatShortDate(value) {
  const date = parseDate(value);
  if (!date) return "";
  return `${String(date.getDate()).padStart(2, "0")}.${String(
    date.getMonth() + 1
  ).padStart(2, "0")}.${date.getFullYear()}`;
}

export function monthLabel(value) {
  const date = parseDate(value);
  if (!date) return "";
  return `${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

export const AUTHOR_LABELS = {
  ele: "Ele",
  ela: "Ela",
  nos: "Nós dois",
};

/** Agrupa as memórias por ano, mantendo a ordem cronológica. */
export function groupByYear(memories) {
  const groups = [];
  for (const memory of memories) {
    const year = parseDate(memory.happened_on)?.getFullYear() ?? "—";
    const last = groups.at(-1);
    if (last && last.year === year) last.items.push(memory);
    else groups.push({ year, items: [memory] });
  }
  return groups;
}
