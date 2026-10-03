import { formatLongDate } from "../utils/format.js";

export default function MemoryBookPdf({ memories, config }) {
  // Filtra as memórias trancadas (Cápsulas do tempo) para não dar spoiler no PDF!
  const availableMemories = memories.filter((m) => !m.is_locked);
  const coupleNames = `${config?.her_name || "Ela"} & ${config?.his_name || "Ele"}`;

  return (
    <div
      id="memory-book-container"
      style={{
        display: "none", // Fica oculto na interface web
        width: "210mm",
        background: "#fffaf7", // Sua cor --color-cream
        color: "#4b0620", // Sua cor --color-romance-950
        fontFamily: "Georgia, serif",
        padding: "20mm",
        boxSizing: "border-box",
      }}
    >
      {/* CAPA DO LIVRO */}
      <div
        style={{
          height: "257mm",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          pageBreakAfter: "always",
          border: "4px double #dcae63", // Sua cor --color-gold
          padding: "40px",
          backgroundColor: "#fff",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            letterSpacing: "4px",
            color: "#de2464",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          Álbum de Momentos
        </span>
        <h1
          style={{
            fontSize: "54px",
            color: "#851742",
            marginBottom: "20px",
            fontWeight: "normal",
          }}
        >
          {config?.hero_title || "A nossa história"}
        </h1>
        <div
          style={{
            width: "60px",
            height: "2px",
            background: "#dcae63",
            margin: "20px 0",
          }}
        ></div>
        <p
          style={{
            fontSize: "20px",
            fontStyle: "italic",
            color: "#9c1648",
            maxWidth: "500px",
            lineHeight: "1.6",
          }}
        >
          {coupleNames}
        </p>
      </div>

      {/* PÁGINAS DE MEMÓRIAS */}
      {availableMemories.map((memory, index) => (
        <div
          key={memory.id || index}
          style={{
            minHeight: "250mm",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            pageBreakAfter: "always",
            padding: "10mm 15mm",
            boxSizing: "border-box",
            backgroundColor: "#fff",
          }}
        >
          {/* Cabeçalho da página */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #fecdd8", // romance-200
              paddingBottom: "15px",
              marginBottom: "30px",
              fontSize: "14px",
              color: "#de2464", // romance-600
              letterSpacing: "1px",
            }}
          >
            <span>Capítulo {index + 1}</span>
            <span style={{ textTransform: "uppercase" }}>
              {formatLongDate(memory.happened_on)}
            </span>
          </div>

          <h2
            style={{
              fontSize: "28px",
              color: "#4b0620",
              marginBottom: "25px",
              fontWeight: "normal",
            }}
          >
            {memory.title}
          </h2>

          {(memory.image_url || memory.thumb_url) && (
            <div
              style={{
                textAlign: "center",
                marginBottom: "30px",
                padding: "10px",
                background: "#fff5f7",
                borderRadius: "12px",
              }}
            >
              <img
                src={memory.image_url || memory.thumb_url}
                alt={memory.title}
                crossOrigin="anonymous" /* MUITO IMPORTANTE para não dar erro de CORS ao gerar o PDF */
                style={{
                  maxWidth: "100%",
                  maxHeight: "120mm",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}

          {memory.note && (
            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.8",
                color: "#46212f",
                textAlign: "justify",
                whiteSpace: "pre-line",
              }}
            >
              "{memory.note}"
            </p>
          )}

          {memory.location && (
            <p
              style={{
                marginTop: "20px",
                fontSize: "14px",
                color: "#fb7199",
                fontStyle: "italic",
              }}
            >
              📍 {memory.location}
            </p>
          )}

          {/* Rodapé da página */}
          <div
            style={{
              marginTop: "auto",
              textAlign: "center",
              fontSize: "12px",
              color: "#fda4bb",
              borderTop: "1px solid #ffe4ea",
              paddingTop: "15px",
            }}
          >
            Nossa Linha do Tempo • Página {index + 2}
          </div>
        </div>
      ))}
    </div>
  );
}
