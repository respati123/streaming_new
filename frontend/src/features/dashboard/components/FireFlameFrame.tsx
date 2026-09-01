import { useEffect, useRef } from 'react';

interface FireFlameFrameProps {
  children?: React.ReactNode;
  className?: string;
  primaryColor?: string; // e.g. '#ff4500' (Fiery Orange/Red)
  secondaryColor?: string; // e.g. '#ffd700' (Gold/Yellow)
  coreColor?: string; // e.g. '#ffffff' (White hot)
  intensity?: number; // 0.5 to 2.0
  borderRadius?: number; // corner radius in px
  enableEmbers?: boolean;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  wobbleSpeed: number;
  wobbleAmp: number;
}

interface FlameTongue {
  baseX: number;
  baseY: number;
  height: number;
  width: number;
  phase: number;
  speed: number;
}

/**
 * Procedural Realtime Inferno Flame Canvas Frame
 * Renders roaring fire tongues, buoyant burning embers, and radiant heat aura
 * entirely via GPU-accelerated HTML5 Canvas with 100% dynamic responsive sizing.
 */
export function FireFlameFrame({
  children,
  className = '',
  primaryColor = '#ff4500',
  secondaryColor = '#ffb700',
  coreColor = '#fff7cc',
  intensity = 1.0,
  borderRadius = 24,
  enableEmbers = true,
}: FireFlameFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    const embers: Ember[] = [];
    const flameTongues: FlameTongue[] = [];
    let lastTime = performance.now();
    let time = 0;

    // Responsive Canvas Resizing with high DPR
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Ample padding for upward rising flames & drifting embers
      const padX = 35;
      const padTop = 50;
      const padBottom = 25;
      const width = Math.max(rect.width + padX * 2, 100);
      const height = Math.max(rect.height + padTop + padBottom, 100);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.transform = `translate(${-padX}px, ${-padTop}px)`;

      // Initialize flame tongue emitters around the perimeter
      flameTongues.length = 0;
      const perimeter = (rect.width + rect.height) * 2;
      const tongueCount = Math.floor(perimeter / 18);

      for (let i = 0; i < tongueCount; i++) {
        flameTongues.push({
          baseX: (i / tongueCount) * rect.width,
          baseY: rect.height,
          height: (Math.random() * 28 + 16) * intensity,
          width: Math.random() * 16 + 10,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 3.5 + 2.0,
        });
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    // Render loop
    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      time += dt;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const padX = 35;
      const padTop = 50;
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const r = Math.min(borderRadius, w / 2, h / 2);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(padX, padTop);

      // ─── 1. SPAWN BURNING FLOATING EMBERS ───
      if (enableEmbers && Math.random() < 0.45 * intensity) {
        // Embers mostly spawn from bottom edge and sides
        const isBottom = Math.random() < 0.65;
        const ex = isBottom ? Math.random() * w : Math.random() > 0.5 ? 0 : w;
        const ey = isBottom ? h : Math.random() * h;

        const emberColorChoices = [
          '#ffffff',
          '#fff275',
          secondaryColor,
          primaryColor,
          '#ff2a00',
        ];

        embers.push({
          x: ex + (Math.random() - 0.5) * 10,
          y: ey + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 20,
          vy: -(Math.random() * 55 + 35) * intensity, // buoyant upward velocity
          size: Math.random() * 2.8 + 1.2,
          life: 0,
          maxLife: Math.random() * 0.9 + 0.4,
          color: emberColorChoices[Math.floor(Math.random() * emberColorChoices.length)],
          wobbleSpeed: Math.random() * 5 + 3,
          wobbleAmp: Math.random() * 1.5 + 0.8,
        });
      }

      ctx.globalCompositeOperation = 'lighter';

      // ─── 2. DRAW HEAT AURA / AMBIENT GLOW ON BORDER ───
      // Rounded rect path definition
      const createRoundedRectPath = (inset = 0) => {
        ctx.beginPath();
        ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, Math.max(r - inset, 0));
        ctx.closePath();
      };

      // Pulsing heat bloom
      const heatPulse = 1.0 + Math.sin(time * 6) * 0.15;

      // Outer Deep Crimson Glow
      ctx.lineWidth = 14 * intensity;
      ctx.strokeStyle = primaryColor;
      ctx.globalAlpha = 0.3 * heatPulse;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 36 * intensity;
      createRoundedRectPath(0);
      ctx.stroke();

      // Mid Searing Orange Line
      ctx.lineWidth = 5 * intensity;
      ctx.strokeStyle = secondaryColor;
      ctx.globalAlpha = 0.85;
      ctx.shadowColor = secondaryColor;
      ctx.shadowBlur = 18 * intensity;
      createRoundedRectPath(0);
      ctx.stroke();

      // Hot White-Yellow Core Line
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = coreColor;
      ctx.globalAlpha = 0.95;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 6;
      createRoundedRectPath(0);
      ctx.stroke();

      // ─── 3. DRAW DYNAMIC FLAME TONGUES (Lidah Api yang Menari) ───
      // Bottom edge flames (rising tallest)
      const bottomFlamesCount = Math.floor(w / 14);
      for (let i = 0; i < bottomFlamesCount; i++) {
        const fx = (i / (bottomFlamesCount - 1)) * w;
        const fy = h;
        const wave = Math.sin(time * 7 + i * 0.85) * 0.5 + 0.5;
        const flameHeight = (18 + wave * 24 + Math.cos(time * 11 + i) * 6) * intensity;
        const flameWidth = 14 + Math.sin(time * 5 + i) * 4;
        const windLean = Math.sin(time * 3 + i * 0.3) * 6;

        // Draw flame tip via bezier curve
        ctx.beginPath();
        ctx.moveTo(fx - flameWidth / 2, fy);
        ctx.quadraticCurveTo(
          fx - flameWidth / 4 + windLean,
          fy - flameHeight * 0.6,
          fx + windLean,
          fy - flameHeight
        );
        ctx.quadraticCurveTo(
          fx + flameWidth / 4 + windLean,
          fy - flameHeight * 0.6,
          fx + flameWidth / 2,
          fy
        );
        ctx.closePath();

        // Flame gradient: yellow hot core -> orange -> red tip
        const grad = ctx.createLinearGradient(fx, fy, fx + windLean, fy - flameHeight);
        grad.addColorStop(0, coreColor);
        grad.addColorStop(0.3, secondaryColor);
        grad.addColorStop(0.7, primaryColor);
        grad.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.7 + wave * 0.25;
        ctx.shadowColor = secondaryColor;
        ctx.shadowBlur = 12;
        ctx.fill();
      }

      // Side edges flames (left and right)
      const sideFlamesCount = Math.floor(h / 20);
      for (let i = 0; i < sideFlamesCount; i++) {
        const fy = (i / (sideFlamesCount - 1)) * h;
        const waveL = Math.sin(time * 8 + i * 1.1) * 0.5 + 0.5;
        const flameLenL = (10 + waveL * 16) * intensity;

        // Left flame
        ctx.beginPath();
        ctx.moveTo(0, fy - 6);
        ctx.quadraticCurveTo(-flameLenL * 0.6, fy - 4, -flameLenL, fy - 10);
        ctx.quadraticCurveTo(-flameLenL * 0.4, fy + 4, 0, fy + 6);
        ctx.fillStyle = secondaryColor;
        ctx.globalAlpha = 0.6;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 10;
        ctx.fill();

        // Right flame
        const waveR = Math.cos(time * 8 + i * 1.3) * 0.5 + 0.5;
        const flameLenR = (10 + waveR * 16) * intensity;
        ctx.beginPath();
        ctx.moveTo(w, fy - 6);
        ctx.quadraticCurveTo(w + flameLenR * 0.6, fy - 4, w + flameLenR, fy - 10);
        ctx.quadraticCurveTo(w + flameLenR * 0.4, fy + 4, w, fy + 6);
        ctx.fillStyle = secondaryColor;
        ctx.globalAlpha = 0.6;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 10;
        ctx.fill();
      }

      // Top edge ambient heat waves
      const topFlamesCount = Math.floor(w / 22);
      for (let i = 0; i < topFlamesCount; i++) {
        const fx = (i / (topFlamesCount - 1)) * w;
        const wave = Math.sin(time * 6 + i * 0.9) * 0.5 + 0.5;
        const flameHeight = (8 + wave * 12) * intensity;

        ctx.beginPath();
        ctx.arc(fx, 0 - flameHeight * 0.5, 6 * wave + 3, 0, Math.PI * 2);
        ctx.fillStyle = secondaryColor;
        ctx.globalAlpha = 0.4 * wave;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      // ─── 4. UPDATE & DRAW FLOATING EMBERS ───
      for (let i = embers.length - 1; i >= 0; i--) {
        const emb = embers[i];
        emb.life += dt;

        if (emb.life >= emb.maxLife) {
          embers.splice(i, 1);
          continue;
        }

        // Upward floating physics + sine wobble
        emb.y += emb.vy * dt;
        emb.x += emb.vx * dt + Math.sin(time * emb.wobbleSpeed + emb.life * 10) * emb.wobbleAmp;
        emb.vy *= 0.99; // slight air deceleration

        const progress = emb.life / emb.maxLife;
        const alpha = Math.sin(progress * Math.PI); // fade in then fade out smoothly
        const curSize = emb.size * (1 - progress * 0.4);

        ctx.beginPath();
        ctx.arc(emb.x, emb.y, Math.max(curSize, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = emb.color;
        ctx.globalAlpha = alpha * 0.95;
        ctx.shadowColor = emb.color;
        ctx.shadowBlur = 6;
        ctx.fill();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [primaryColor, secondaryColor, coreColor, intensity, borderRadius, enableEmbers]);

  return (
    <div ref={containerRef} className={`relative isolate ${className}`}>
      {/* Realtime GPU Canvas Inferno Fire Layer */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute left-0 top-0 z-20 overflow-visible"
      />
      {/* Content Container (Fully Dynamic & Responsive) */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
