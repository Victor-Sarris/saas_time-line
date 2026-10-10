import { useState } from "react";
import html2pdf from "html2pdf.js";
import MemoryBookPdf from "./MemoryBookPdf.jsx";
import { motion } from "framer-motion";
import { FaBookOpen, FaSpinner } from "react-icons/fa";

export default function ExportBookButton({ memories, config }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const availableCount = memories.filter((m) => !m.is_locked).length;

  const handleDownloadPDF = () => {
    if (memories.length === 0) return;
    setIsGenerating(true);

    const element = document.getElementById("memory-book-container");
    if (!element) {
      setIsGenerating(false);
      return;
    }
    element.style.display = "block";

    const options = {
      margin: 0,
      filename: `nosso-livro-${config?.her_name || "memorias"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .from(element)
      .set(options)
      .save()
      .then(() => {
        element.style.display = "none";
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error("Erro ao gerar PDF:", err);
        element.style.display = "none";
        setIsGenerating(false);
      });
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={handleDownloadPDF}
        disabled={isGenerating || memories.length === 0}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className="group relative flex w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-linear-to-r from-romance-600 to-romance-700 px-5 py-3.5 font-medium text-cream shadow-lg shadow-romance-400/40 transition-shadow hover:shadow-xl hover:shadow-romance-400/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
        />

        {isGenerating ? (
          <>
            <FaSpinner className="animate-spin text-base" />
            <span>Gerando nosso livrinho...</span>
          </>
        ) : (
          <>
            <FaBookOpen className="text-base" />
            <span>Baixar Livro de Memórias</span>
            <span className="rounded-full bg-cream/20 px-2 py-0.5 text-[11px] font-normal">
              {availableCount} {availableCount === 1 ? "momento" : "momentos"}
            </span>
          </>
        )}
      </motion.button>
      <MemoryBookPdf memories={memories} config={config} />
    </>
  );
}
