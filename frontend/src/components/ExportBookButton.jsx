import { useState } from "react";
import html2pdf from "html2pdf.js";
import MemoryBookPdf from "./MemoryBookPdf.jsx";
import { motion } from "framer-motion";
import { FaBookOpen, FaSpinner } from "react-icons/fa"; // Se não tiver react-icons, pode usar emojis

export default function ExportBookButton({ memories, config }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = () => {
    if (memories.length === 0) return;
    setIsGenerating(true);

    const element = document.getElementById("memory-book-container");
    element.style.display = "block"; // Mostra temporariamente

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
        element.style.display = "none"; // Esconde de novo
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.9 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 flex cursor-pointer items-center gap-2 rounded-full bg-romance-600 px-6 py-3 font-medium text-cream shadow-lg shadow-romance-300/60 transition hover:bg-romance-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <FaSpinner className="animate-spin" />{" "}
            {/* Substitua por ⏳ se não tiver react-icons */}
            <span>Gerando Livro...</span>
          </>
        ) : (
          <>
            <FaBookOpen /> {/* Substitua por 📖 se não tiver react-icons */}
            <span>Baixar Livro de Memórias (PDF)</span>
          </>
        )}
      </motion.button>

      <MemoryBookPdf memories={memories} config={config} />
    </>
  );
}
