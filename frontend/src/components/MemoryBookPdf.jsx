import { formatLongDate } from "../utils/format.js";

const COLORS = {
  cream: "#fffaf7",
  paper: "#fffdfb",
  rose50: "#fff5f7",
  rose100: "#ffe4ea",
  rose200: "#fecdd8",
  rose300: "#fda4bb",
  rose400: "#fb7199",
  rose500: "#ef4b85",
  rose600: "#de2464",
  rose700: "#9c1648",
  rose800: "#851742",
  rose900: "#4b0620",
  ink: "#46212f",
  gold: "#dcae63",
};

function toRoman(num) {
  if (num <= 0 || num > 3999) return String(num);
  const map = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let n = num;
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

function Ornament({ small = false }) {
  const lineW = small ? "30px" : "60px";
  const fontSize = small ? "10px" : "12px";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <span style={{ width: lineW, height: "1px", background: COLORS.gold }} />
      <span
        style={{
          fontSize,
          color: COLORS.rose600,
          letterSpacing: "2px",
          lineHeight: 1,
        }}
      >
        ✦
      </span>
      <span style={{ width: lineW, height: "1px", background: COLORS.gold }} />
    </div>
  );
}

function Cover({ title, coupleNames, total, subtitle }) {
  return (
    <div
      style={{
        height: "296mm",
        padding: "15mm",
        boxSizing: "border-box",
        pageBreakAfter: "always",
        background: `radial-gradient(circle at 50% 35%, ${COLORS.paper} 0%, ${COLORS.cream} 45%, ${COLORS.rose100} 100%)`,
      }}
    >
      <div
        style={{
          height: "100%",
          border: `1.5px solid ${COLORS.gold}`,
          padding: "5mm",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            height: "100%",
            border: `2px solid ${COLORS.rose600}`,
            padding: "18mm 14mm",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "center",
            background: COLORS.paper,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "26px",
                color: COLORS.gold,
                letterSpacing: "8px",
                lineHeight: 1,
              }}
            >
              ❦
            </div>
            <div
              style={{
                marginTop: "20px",
                fontSize: "11px",
                letterSpacing: "8px",
                color: COLORS.rose600,
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              Álbum de Momentos
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              padding: "0 6mm",
            }}
          >
            <Ornament />
            <h1
              style={{
                fontSize: "54px",
                lineHeight: 1.12,
                color: COLORS.rose800,
                fontWeight: "normal",
                margin: 0,
                fontStyle: "italic",
                letterSpacing: "-0.5px",
              }}
            >
              {title}
            </h1>
            <Ornament />
            <p
              style={{
                fontSize: "20px",
                fontStyle: "italic",
                color: COLORS.rose700,
                margin: 0,
                letterSpacing: "0.5px",
              }}
            >
              {coupleNames}
            </p>
            {subtitle && (
              <p
                style={{
                  fontSize: "13px",
                  color: COLORS.rose400,
                  margin: 0,
                  maxWidth: "120mm",
                  lineHeight: 1.7,
                  letterSpacing: "0.3px",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <div>
            <Ornament />
            <p
              style={{
                marginTop: "14px",
                fontSize: "11px",
                letterSpacing: "5px",
                color: COLORS.rose400,
                textTransform: "uppercase",
              }}
            >
              {total} {total === 1 ? "momento guardado" : "momentos guardados"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemoryPage({ memory, index, authors, pageNumber }) {
  const hasImage = memory.image_url || memory.thumb_url;
  const gallery = Array.isArray(memory.gallery) ? memory.gallery : [];
  const annotations = Array.isArray(memory.annotations)
    ? memory.annotations
    : [];
  const authorName =
    authors[memory.author] || memory.author_display || "Nós dois";

  return (
    <div
      style={{
        minHeight: "296mm",
        padding: "18mm 20mm",
        boxSizing: "border-box",
        pageBreakAfter: "always",
        backgroundColor: COLORS.paper,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10mm",
          right: "10mm",
          bottom: "10mm",
          left: "10mm",
          border: `1px solid ${COLORS.rose100}`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minHeight: "260mm",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "10mm" }}>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "8px",
              color: COLORS.rose600,
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
          >
            Capítulo {toRoman(index + 1)}
          </div>
          <div
            style={{
              marginTop: "8px",
              fontSize: "12px",
              color: COLORS.gold,
              letterSpacing: "3px",
              fontStyle: "italic",
            }}
          >
            {formatLongDate(memory.happened_on)}
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "10mm" }}>
          <h2
            style={{
              fontSize: "34px",
              lineHeight: 1.2,
              color: COLORS.rose800,
              fontWeight: "normal",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            {memory.title}
          </h2>

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Ornament small />
          </div>

          <div
            style={{
              marginTop: "14px",
              display: "inline-block",
              padding: "5px 16px",
              border: `1px solid ${COLORS.rose200}`,
              borderRadius: "999px",
              fontSize: "10px",
              letterSpacing: "3px",
              color: COLORS.rose600,
              textTransform: "uppercase",
              background: COLORS.rose50,
            }}
          >
            {memory.is_favorite ? "❤  ·  " : ""}
            guardado por {authorName}
          </div>
        </div>

        {hasImage && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "10mm",
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "8px 8px 28px",
                border: `1px solid ${COLORS.rose100}`,
                boxShadow: "0 6px 24px -8px rgba(75, 6, 32, 0.25)",
                transform: "rotate(-1deg)",
                maxWidth: "150mm",
              }}
            >
              <img
                src={memory.image_url || memory.thumb_url}
                alt={memory.title}
                crossOrigin="anonymous"
                style={{
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "110mm",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        )}

        {memory.note && (
          <div
            style={{
              textAlign: "center",
              marginBottom: "6mm",
              padding: "0 8mm",
            }}
          >
            <p
              style={{
                fontSize: "17px",
                lineHeight: 1.85,
                color: COLORS.ink,
                fontStyle: "italic",
                whiteSpace: "pre-line",
                margin: 0,
              }}
            >
              &ldquo;{memory.note}&rdquo;
            </p>
          </div>
        )}

        {memory.location && (
          <div style={{ textAlign: "center", marginBottom: "6mm" }}>
            <span
              style={{
                fontSize: "12px",
                color: COLORS.rose500,
                letterSpacing: "2px",
                fontStyle: "italic",
              }}
            >
              ✦ {memory.location} ✦
            </span>
          </div>
        )}

        {gallery.length > 0 && (
          <div style={{ marginTop: "4mm", marginBottom: "6mm" }}>
            <div
              style={{
                textAlign: "center",
                fontSize: "10px",
                letterSpacing: "5px",
                color: COLORS.rose400,
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Mais fotos desse dia
            </div>
            <div
              style={{
                display: "flex",
                gap: "6px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {gallery.slice(0, 6).map((foto, i) => (
                <img
                  key={foto.id || i}
                  src={foto.thumb_url || foto.image_url}
                  alt=""
                  crossOrigin="anonymous"
                  style={{
                    width: "30mm",
                    height: "30mm",
                    objectFit: "cover",
                    border: "3px solid #fff",
                    boxShadow: "0 3px 12px -5px rgba(75, 6, 32, 0.25)",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {annotations.length > 0 && (
          <div style={{ marginTop: "4mm" }}>
            <div
              style={{
                textAlign: "center",
                fontSize: "10px",
                letterSpacing: "5px",
                color: COLORS.rose400,
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Recadinhos
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {annotations.map((a, i) => (
                <div
                  key={a.id || i}
                  style={{
                    background: COLORS.rose50,
                    borderLeft: `3px solid ${COLORS.rose300}`,
                    padding: "8px 12px",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: COLORS.rose500,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      marginBottom: "3px",
                    }}
                  >
                    {authors[a.author] || a.author_display || "Nós dois"}
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontStyle: "italic",
                      color: COLORS.ink,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {a.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: "auto",
            paddingTop: "10mm",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Ornament small />
          <div
            style={{
              marginTop: "10px",
              fontSize: "10px",
              letterSpacing: "4px",
              color: COLORS.rose300,
              textTransform: "uppercase",
            }}
          >
            Página {pageNumber}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MemoryBookPdf({ memories, config }) {
  const availableMemories = memories.filter((m) => !m.is_locked);

  const herName = config?.her_name || "Ela";
  const hisName = config?.his_name || "Ele";
  const coupleNames = `${herName} & ${hisName}`;
  const total = availableMemories.length;

  const authors = {
    ele: hisName,
    ela: herName,
    nos: "Nós dois",
  };

  return (
    <div
      id="memory-book-container"
      style={{
        display: "none",
        width: "210mm",
        background: COLORS.cream,
        color: COLORS.rose900,
        fontFamily: "Georgia, 'Times New Roman', serif",
        boxSizing: "border-box",
      }}
    >
      <Cover
        title={config?.hero_title || "A nossa história"}
        coupleNames={coupleNames}
        total={total}
        subtitle={config?.hero_subtitle}
      />

      {availableMemories.map((memory, index) => (
        <MemoryPage
          key={memory.id || index}
          memory={memory}
          index={index}
          authors={authors}
          pageNumber={index + 2}
        />
      ))}
    </div>
  );
}
