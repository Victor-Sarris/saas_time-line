import { useEffect, useRef } from "react";

// -------------------------------------------------------------
// Configuração de cada clima
// -------------------------------------------------------------
const EFFECTS = {
  hearts: {
    colors: [
      "rgba(251, 113, 153, 0.55)",
      "rgba(254, 205, 216, 0.75)",
      "rgba(220, 174, 99, 0.45)",
      "rgba(222, 36, 100, 0.4)",
    ],
    size: [10, 22],
    speed: [0.25, 0.7],
    drift: [-0.25, 0.25],
    spin: [-0.015, 0.015],
    swayAmp: 0.7,
    swayFreq: 110,
    densityMul: 0.85,
    rotate: true,
  },

  petals: {
    colors: [
      "rgba(255, 183, 178, 0.75)",
      "rgba(255, 218, 193, 0.75)",
      "rgba(253, 164, 187, 0.7)",
      "rgba(251, 113, 153, 0.6)",
    ],
    size: [7, 15],
    speed: [0.35, 0.9],
    drift: [-0.5, 0.5],
    spin: [-0.03, 0.03],
    swayAmp: 0.95,
    swayFreq: 90,
    densityMul: 1,
    rotate: true,
  },

  snow: {
    colors: [
      "rgba(255, 255, 255, 0.95)",
      "rgba(230, 244, 255, 0.9)",
      "rgba(214, 236, 255, 0.8)",
    ],
    size: [1.5, 4.5],
    speed: [0.3, 0.9],
    drift: [-0.3, 0.3],
    spin: [-0.005, 0.005],
    swayAmp: 0.55,
    swayFreq: 140,
    densityMul: 1.15,
    rotate: false,
    glow: true,
    glowBlur: 5,
    glowColor: "rgba(220, 240, 255, 0.9)",
    twinkle: true,
    twinkleAmp: 0.25,
    twinkleSpeed: 0.003,
  },

  stars: {
    colors: [
      "rgba(255, 215, 0, 0.95)",
      "rgba(255, 240, 150, 1)",
      "rgba(255, 250, 205, 0.9)",
      "rgba(255, 190, 110, 0.85)",
    ],
    size: [3, 9],
    speed: [0.1, 0.35],
    drift: [-0.2, 0.2],
    spin: [-0.01, 0.01],
    swayAmp: 0.4,
    swayFreq: 160,
    densityMul: 0.65,
    rotate: true,
    glow: true,
    glowBlur: 12,
    glowColor: "rgba(255, 215, 0, 0.75)",
    twinkle: true,
    twinkleAmp: 0.55,
    twinkleSpeed: 0.005,
  },

  confetti: {
    colors: [
      "rgba(46, 204, 113, 0.9)",
      "rgba(52, 152, 219, 0.9)",
      "rgba(155, 89, 182, 0.9)",
      "rgba(241, 196, 15, 0.9)",
      "rgba(231, 76, 60, 0.9)",
      "rgba(255, 130, 180, 0.9)",
    ],
    size: [5, 12],
    speed: [0.9, 2],
    drift: [-0.9, 0.9],
    spin: [-0.18, 0.18],
    swayAmp: 0.6,
    swayFreq: 70,
    densityMul: 1,
    rotate: true,
    tumble: true,
  },

  nordestino: {
    // paleta terrosa de lampâda âmbar / terracota / mostarda / palha
    colors: [
      "rgba(233, 162, 59, 0.95)", // âmbar/dourado quente
      "rgba(217, 122, 42, 0.95)", // terracota
      "rgba(245, 190, 90, 0.9)", // mostarda clara
      "rgba(196, 95, 31, 0.9)", // âmbar queimado
      "rgba(240, 210, 150, 0.85)", // palha/areia quente
      "rgba(180, 75, 25, 0.85)", // marrom-avermelhado
    ],
    size: [7, 16],
    speed: [0.18, 0.5],
    drift: [-0.4, 0.4],
    spin: [-0.008, 0.008],
    swayAmp: 0.7,
    swayFreq: 105,
    densityMul: 0.85,
    rotate: true,
    glow: true,
    glowBlur: 8,
    // brilho mais "luz de lampião" que "sol do meio-dia"
    glowColor: "rgba(230, 140, 60, 0.7)",
    twinkle: true,
    twinkleAmp: 0.22,
    twinkleSpeed: 0.003,
  },
};

const DEFAULT_EFFECT = "hearts";
const getConfig = (type) => EFFECTS[type] || EFFECTS[DEFAULT_EFFECT];

// -------------------------------------------------------------
// Formas (desenhadas centradas em 0,0)
// -------------------------------------------------------------
function drawHeart(ctx, size) {
  ctx.beginPath();
  ctx.moveTo(0, size * 0.3);
  ctx.bezierCurveTo(0, -size * 0.15, -size, -size * 0.1, -size, size * 0.35);
  ctx.bezierCurveTo(-size, size * 0.85, -size * 0.1, size * 1.1, 0, size * 1.4);
  ctx.bezierCurveTo(
    size * 0.1,
    size * 1.1,
    size,
    size * 0.85,
    size,
    size * 0.35,
  );
  ctx.bezierCurveTo(size, -size * 0.1, 0, -size * 0.15, 0, size * 0.3);
  ctx.closePath();
  ctx.fill();
}

function drawPetal(ctx, size) {
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.85, -size * 0.5, size * 0.85, size * 0.5, 0, size);
  ctx.bezierCurveTo(
    -size * 0.85,
    size * 0.5,
    -size * 0.85,
    -size * 0.5,
    0,
    -size,
  );
  ctx.closePath();
  ctx.fill();
}

function drawSnow(ctx, size) {
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawStar(ctx, size) {
  const spikes = 5;
  const outer = size;
  const inner = size * 0.45;
  const step = Math.PI / spikes;
  let rot = -Math.PI / 2;

  ctx.beginPath();
  ctx.moveTo(0, -outer);
  for (let i = 0; i < spikes; i++) {
    rot += step;
    ctx.lineTo(Math.cos(rot) * inner, Math.sin(rot) * inner);
    rot += step;
    ctx.lineTo(Math.cos(rot) * outer, Math.sin(rot) * outer);
  }
  ctx.closePath();
  ctx.fill();
}

function drawConfetti(ctx, size, variant) {
  if (variant === 0) {
    ctx.beginPath();
    ctx.rect(-size * 0.35, -size, size * 0.7, size * 2);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

function drawSun(ctx, size) {
  const rays = 8;
  const innerR = size * 0.38;
  const outerR = size;
  const rayBase = size * 0.22;

  ctx.beginPath();
  ctx.arc(0, 0, innerR, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(innerR * 0.85, -rayBase * 0.5);
    ctx.lineTo(outerR, 0);
    ctx.lineTo(innerR * 0.85, rayBase * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawShape(ctx, particle, type) {
  switch (type) {
    case "snow":
      drawSnow(ctx, particle.size);
      break;
    case "stars":
      drawStar(ctx, particle.size);
      break;
    case "confetti":
      drawConfetti(ctx, particle.size, particle.variant);
      break;
    case "petals":
      drawPetal(ctx, particle.size);
      break;
    case "nordestino":
      drawSun(ctx, particle.size);
      break;
    case "hearts":
    default:
      drawHeart(ctx, particle.size);
      break;
  }
}

const rand = (min, max) => min + Math.random() * (max - min);

// -------------------------------------------------------------
// Componente
// -------------------------------------------------------------
export default function BackgroundEffects({
  effectType = "hearts",
  density = 26,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cfg = getConfig(effectType);

    let frame;
    let width = 0;
    let height = 0;
    let pausado = false;
    let time = 0;

    const spawn = (initial = false) => {
      const depth = rand(0.45, 1);
      const baseSize = rand(cfg.size[0], cfg.size[1]) * depth;
      const baseOpacity = 0.55 + depth * 0.45;

      return {
        x: rand(0, width),
        y: initial ? rand(-height, height) : rand(-height * 0.3, -20),
        size: baseSize,
        depth,
        opacity: baseOpacity,
        speed: rand(cfg.speed[0], cfg.speed[1]) * depth,
        drift: rand(cfg.drift[0], cfg.drift[1]) * depth,
        angle: rand(0, Math.PI * 2),
        spin: rand(cfg.spin[0], cfg.spin[1]),
        phase: rand(0, Math.PI * 2),
        twinkleOffset: rand(0, Math.PI * 2),
        variant: Math.random() < 0.5 ? 0 : 1,
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
      };
    };

    let particles = [];

    const resize = () => {
      const isMobile = window.innerWidth < 640;
      const ratio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const base = density * (cfg.densityMul ?? 1);
      const quantidade = Math.round(isMobile ? base * 0.5 : base);
      particles = Array.from({ length: quantidade }, () => spawn(true));
    };

    const tick = () => {
      if (pausado) return;
      time += 1;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y += p.speed;
        p.x +=
          p.drift +
          Math.sin(p.y / cfg.swayFreq + p.phase) * cfg.swayAmp * p.depth;
        p.angle += p.spin;

        if (p.y > height + 60) Object.assign(p, spawn(), { y: -30 });
        if (p.x < -60) p.x = width + 40;
        if (p.x > width + 60) p.x = -40;

        let alpha = 1;
        if (cfg.twinkle) {
          alpha =
            1 -
            cfg.twinkleAmp * 0.5 +
            Math.sin(time * cfg.twinkleSpeed + p.twinkleOffset) *
              cfg.twinkleAmp *
              0.5;
        }

        ctx.save();
        ctx.translate(p.x, p.y);

        if (cfg.tumble) {
          const tumble = Math.sin(time * 0.03 + p.phase) * 0.9;
          const scaleY =
            0.25 + Math.abs(Math.cos(time * 0.05 + p.phase)) * 0.75;
          ctx.rotate(p.angle + tumble);
          ctx.scale(1, scaleY);
        } else if (cfg.rotate) {
          ctx.rotate(p.angle);
        }

        if (cfg.glow) {
          ctx.shadowBlur = cfg.glowBlur ?? 8;
          ctx.shadowColor = cfg.glowColor ?? p.color;
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha * p.opacity));
        ctx.fillStyle = p.color;
        drawShape(ctx, p, effectType);
        ctx.restore();
      }

      frame = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      pausado = document.hidden;
      if (!pausado) {
        cancelAnimationFrame(frame);
        tick();
      }
    };

    resize();
    tick();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density, effectType]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000"
    />
  );
}
