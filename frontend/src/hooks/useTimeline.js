import { useCallback, useEffect, useState } from "react";

import { api } from "../api/client.js";

const FALLBACK_CONFIG = {
  her_name: "Meu Amor",
  his_name: "Eu",
  couple_since: "",
  hero_title: "A nossa história",
  hero_subtitle: "Cada foto aqui é um pedacinho de tempo.",
  letter_title: "Uma última coisa...",
  letter_body: "",
  spotify_embed_url: "",
};

export function useTimeline(filters) {
  const [config, setConfig] = useState(FALLBACK_CONFIG);
  const [memories, setMemories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshSummary = useCallback(async () => {
    try {
      setSummary(await api.getSummary());
    } catch {
      /* o resumo é enfeite: se falhar, o site continua de pé */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [configData, memoriesData] = await Promise.all([
        api.getSiteConfig(),
        api.listMemories(filters),
      ]);
      setConfig({ ...FALLBACK_CONFIG, ...configData });
      setMemories(memoriesData);
      refreshSummary();
    } catch (err) {
      setError(
        `${err.message}. O backend do Django está rodando em http://127.0.0.1:8000?`
      );
    } finally {
      setLoading(false);
    }
  }, [filters, refreshSummary]);

  useEffect(() => {
    load();
  }, [load]);

  const createMemory = useCallback(
    async (formData) => {
      const created = await api.createMemory(formData);
      setMemories((current) =>
        [...current, created].sort((a, b) =>
          a.happened_on.localeCompare(b.happened_on)
        )
      );
      refreshSummary();
      return created;
    },
    [refreshSummary]
  );

  const deleteMemory = useCallback(
    async (id) => {
      await api.deleteMemory(id);
      setMemories((current) => current.filter((item) => item.id !== id));
      refreshSummary();
    },
    [refreshSummary]
  );

  const toggleFavorite = useCallback(async (id) => {
    const updated = await api.toggleFavorite(id);
    setMemories((current) =>
      current.map((item) => (item.id === id ? updated : item))
    );
    return updated;
  }, []);

  const addAnnotation = useCallback(async (id, payload) => {
    const annotation = await api.addAnnotation(id, payload);
    setMemories((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, annotations: [...item.annotations, annotation] }
          : item
      )
    );
    return annotation;
  }, []);

  return {
    config,
    memories,
    summary,
    loading,
    error,
    reload: load,
    createMemory,
    deleteMemory,
    toggleFavorite,
    addAnnotation,
  };
}
