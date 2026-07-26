const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);

  if (!response.ok) {
    let detail = `Erro ${response.status}`;
    try {
      const body = await response.json();
      const firstField = Object.entries(body)[0];
      if (firstField) {
        const [, value] = firstField;
        detail = Array.isArray(value) ? value[0] : String(value);
      }
    } catch {
      /* resposta sem json — mantém a mensagem padrão */
    }
    throw new Error(detail);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  getSiteConfig: () => request("/site-config/"),

  getSummary: () => request("/memories/summary/"),

  listMemories: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null)
    ).toString();
    return request(`/memories/${query ? `?${query}` : ""}`);
  },

  createMemory: (formData) =>
    request("/memories/", { method: "POST", body: formData }),

  deleteMemory: (id) => request(`/memories/${id}/`, { method: "DELETE" }),

  toggleFavorite: (id) =>
    request(`/memories/${id}/favorite/`, { method: "POST" }),

  addAnnotation: (id, payload) =>
    request(`/memories/${id}/annotations/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  deleteAnnotation: (id) =>
    request(`/annotations/${id}/`, { method: "DELETE" }),
};

export { API_URL };
