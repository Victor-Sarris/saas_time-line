import { useEffect, useRef } from "react";

const getColorsForEffect = (type) => {
  switch (type) {
    case "snow":
      return ["rgba(255, 255, 255, 0.8)", "rgba(220, 240, 255, 0.6)"];
    case "stars":
      return [
        "rgba(255, 215, 0, 0.7)",
        "rgba(255, 223, 0, 0.9)",
        "rgba(255, 250, 205, 0.6)",
      ];
    case "confetti":
      return [
        "rgba(46, 204, 113, 0.7)",
        "rgba(52, 152, 219, 0.7)",
        "rgba(155, 89, 182, 0.7)",
        "rgba(241, 196, 15, 0.7)",
        "rgba(231, 76, 60, 0.7)",
      ];
    case "petals":
      return [
        "rgba(255, 183, 178, 0.7)",
        "rgba(255, 218, 193, 0.7)",
        "rgba(253, 164, 187, 0.6)",
      ];
    case "hearts":
    default:
      return [
        "rgba(251, 113, 153, 0.55)",
        "rgba(254, 205, 216, 0.7)",
        "rgba(220, 174, 99, 0.45)",
        "rgba(222, 36, 100, 0.35)",
      ];
  }
};

// Funções de desenho para o Canvas
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
  ctx.ellipse(0, 0, size * 0.6, size * 1.2, 0, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

function drawSnow(ctx, size) {
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawStar(ctx, size) {
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size / 2;
  let rot = (Math.PI / 2) * 3;
  let x = 0,
    y = 0,
    step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(0, 0 - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = Math.cos(rot) * outerRadius;
    y = Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = Math.cos(rot) * innerRadius;
    y = Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(0, 0 - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function drawConfetti(ctx, size) {
  ctx.beginPath();
  ctx.rect(-size / 2, -size, size, size * 2);
  ctx.closePath();
  ctx.fill();
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
      drawConfetti(ctx, particle.size);
      break;
    case "petals":
      drawPetal(ctx, particle.size);
      break;
    case "hearts":
    default:
      drawHeart(ctx, particle.size);
      break;
  }
}

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
    const ctx = canvas.getContext("2d");
    const colors = getColorsForEffect(effectType);

    let frame;
    let width = 0;
    let height = 0;
    let pausado = false;

    const spawn = () => ({
      x: Math.random() * width,
      y: Math.random() * -height,
      size: (effectType === "snow" ? 2 : 4) + Math.random() * 9,
      speed: 0.25 + Math.random() * 0.75,
      drift: (Math.random() - 0.5) * 0.6,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * (effectType === "snow" ? 0.01 : 0.05),
      color: colors[Math.floor(Math.random() * colors.length)],
    });

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

      const quantidade = isMobile ? Math.round(density * 0.45) : density;
      particles = Array.from({ length: quantidade }, spawn);
    };

    const tick = () => {
      if (pausado) return;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y += p.speed;
        p.x += p.drift + Math.sin(p.y / 90) * 0.35;
        p.angle += p.spin;

        if (p.y > height + 40) Object.assign(p, spawn(), { y: -30 });
        if (p.x < -40) p.x = width + 30;
        if (p.x > width + 40) p.x = -30;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
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
  }, [density, effectType]); // Recarrega sempre que o efeito mudar

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000"
    />
  );
}
