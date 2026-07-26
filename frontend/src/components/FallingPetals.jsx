import { useEffect, useRef } from "react";

const COLORS = [
  "rgba(251, 113, 153, 0.55)",
  "rgba(254, 205, 216, 0.7)",
  "rgba(220, 174, 99, 0.45)",
  "rgba(222, 36, 100, 0.35)",
];

function drawHeart(ctx, size) {
  ctx.beginPath();
  ctx.moveTo(0, size * 0.3);
  ctx.bezierCurveTo(0, -size * 0.15, -size, -size * 0.1, -size, size * 0.35);
  ctx.bezierCurveTo(-size, size * 0.85, -size * 0.1, size * 1.1, 0, size * 1.4);
  ctx.bezierCurveTo(size * 0.1, size * 1.1, size, size * 0.85, size, size * 0.35);
  ctx.bezierCurveTo(size, -size * 0.1, 0, -size * 0.15, 0, size * 0.3);
  ctx.closePath();
  ctx.fill();
}

/** Chuvinha de corações/pétalas no fundo. Puramente decorativo. */
export default function FallingPetals({ density = 26 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame;
    let width = 0;
    let height = 0;

    const spawn = () => ({
      x: Math.random() * width,
      y: Math.random() * -height,
      size: 4 + Math.random() * 9,
      speed: 0.25 + Math.random() * 0.75,
      drift: (Math.random() - 0.5) * 0.6,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });

    let petals = [];

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      petals = Array.from({ length: density }, spawn);
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (const petal of petals) {
        petal.y += petal.speed;
        petal.x += petal.drift + Math.sin(petal.y / 90) * 0.35;
        petal.angle += petal.spin;

        if (petal.y > height + 40) Object.assign(petal, spawn(), { y: -30 });
        if (petal.x < -40) petal.x = width + 30;
        if (petal.x > width + 40) petal.x = -30;

        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.angle);
        ctx.fillStyle = petal.color;
        drawHeart(ctx, petal.size);
        ctx.restore();
      }
      frame = requestAnimationFrame(tick);
    };

    resize();
    tick();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
