import { useEffect, useRef } from 'react';

interface ElectricLightningFrameProps {
  children?: React.ReactNode;
  className?: string;
  glowColor?: string; // e.g. '#00f0ff' (cyan), '#fbbf24' (gold), '#c084fc' (purple)
  coreColor?: string; // e.g. '#ffffff'
  intensity?: number; // 0.5 to 2.0
  borderRadius?: number; // corner radius in px
  enableSparks?: boolean;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface MicroArc {
  points: { x: number; y: number }[];
  life: number;
  maxLife: number;
  color: string;
}

/**
 * Procedural Realtime Electric Lightning Canvas Frame
 * Renders dynamic fractal lightning bolts, atmospheric aura glow, and electrical sparks
 * entirely using HTML5 Canvas & GPU acceleration without external video files.
 */
export function ElectricLightningFrame({
  children,
  className = '',
  glowColor = '#00f0ff',
  coreColor = '#ffffff',
  intensity = 1.0,
  borderRadius = 24,
  enableSparks = true,
}: ElectricLightningFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    const sparks: Spark[] = [];
    const microArcs: MicroArc[] = [];
    let lastTime = performance.now();

    // Resize handling with high DPR
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      // Add padding for outer lightning arc overhangs
      const padding = 40;
      const width = Math.max(rect.width + padding * 2, 100);
      const height = Math.max(rect.height + padding * 2, 100);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.transform = `translate(${-padding}px, ${-padding}px)`;
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    // Subdivide a straight line with recursive midpoint displacement (fractal lightning)
    const generateLightningSegment = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      maxDisplacement: number,
      iterations: number
    ): { x: number; y: number }[] => {
      let points = [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ];

      let displacement = maxDisplacement;

      for (let i = 0; i < iterations; i++) {
        const newPoints: { x: number; y: number }[] = [];
        for (let j = 0; j < points.length - 1; j++) {
          const p1 = points[j];
          const p2 = points[j + 1];

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          // Normal vector perpendicular to segment
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;

          // Jitter offset
          const offset = (Math.random() - 0.5) * 2 * displacement;
          newPoints.push(p1);
          newPoints.push({
            x: midX + nx * offset,
            y: midY + ny * offset,
          });
        }
        newPoints.push(points[points.length - 1]);
        points = newPoints;
        displacement *= 0.52; // fractal decay
      }

      return points;
    };

    // Render loop
    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const padding = 40;
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const r = Math.min(borderRadius, w / 2, h / 2);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Offset context by padding
      ctx.translate(padding, padding);

      const segments = [
        // Top edge
        { x1: r, y1: 0, x2: w - r, y2: 0, nx: 0, ny: -1 },
        // Top-Right corner approximation
        { x1: w - r, y1: 0, x2: w, y2: r, nx: 0.7, ny: -0.7 },
        // Right edge
        { x1: w, y1: r, x2: w, y2: h - r, nx: 1, ny: 0 },
        // Bottom-Right corner
        { x1: w, y1: h - r, x2: w - r, y2: h, nx: 0.7, ny: 0.7 },
        // Bottom edge
        { x1: w - r, y1: h, x2: r, y2: h, nx: 0, ny: 1 },
        // Bottom-Left corner
        { x1: r, y1: h, x2: 0, y2: h - r, nx: -0.7, ny: 0.7 },
        // Left edge
        { x1: 0, y1: h - r, x2: 0, y2: r, nx: -1, ny: 0 },
        // Top-Left corner
        { x1: 0, y1: r, x2: r, y2: 0, nx: -0.7, ny: -0.7 },
      ];

      // Occasional voltage flicker surge
      const surge = Math.random() > 0.88 ? 1.35 : 1.0;
      const baseJitter = 9 * intensity * surge;

      // Spawn random sparks along perimeter
      if (enableSparks && Math.random() < 0.35 * intensity) {
        const seg = segments[Math.floor(Math.random() * segments.length)];
        const t = Math.random();
        const sx = seg.x1 + (seg.x2 - seg.x1) * t;
        const sy = seg.y1 + (seg.y2 - seg.y1) * t;
        const speed = (Math.random() * 70 + 30) * intensity;
        const angle = Math.atan2(seg.ny, seg.nx) + (Math.random() - 0.5) * 1.2;

        sparks.push({
          x: sx,
          y: sy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: Math.random() * 0.35 + 0.15,
          size: Math.random() * 2.5 + 1.2,
          color: Math.random() > 0.3 ? glowColor : '#ffffff',
        });
      }

      // Spawn occasional branching micro-arcs
      if (Math.random() < 0.25 * intensity) {
        const seg = segments[Math.floor(Math.random() * segments.length)];
        const t = Math.random();
        const startX = seg.x1 + (seg.x2 - seg.x1) * t;
        const startY = seg.y1 + (seg.y2 - seg.y1) * t;
        const arcLen = (Math.random() * 30 + 15) * intensity;
        const arcAngle = Math.atan2(seg.ny, seg.nx) + (Math.random() - 0.5) * 1.0;
        const targetX = startX + Math.cos(arcAngle) * arcLen;
        const targetY = startY + Math.sin(arcAngle) * arcLen;

        const arcPts = generateLightningSegment(startX, startY, targetX, targetY, 7 * intensity, 3);
        microArcs.push({
          points: arcPts,
          life: 0,
          maxLife: Math.random() * 0.12 + 0.05,
          color: Math.random() > 0.4 ? glowColor : '#ffffff',
        });
      }

      // ─── DRAW MAIN ELECTRIC LIGHTNING PERIMETER ───
      const boltPaths: { x: number; y: number }[][] = [];

      for (let boltIndex = 0; boltIndex < 2; boltIndex++) {
        const currentBolt: { x: number; y: number }[] = [];
        segments.forEach((seg) => {
          const pts = generateLightningSegment(
            seg.x1,
            seg.y1,
            seg.x2,
            seg.y2,
            baseJitter * (boltIndex === 0 ? 1 : 0.75),
            4
          );
          currentBolt.push(...pts);
        });
        boltPaths.push(currentBolt);
      }

      const drawPolyline = (pts: { x: number; y: number }[]) => {
        if (pts.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.closePath();
        ctx.stroke();
      };

      ctx.globalCompositeOperation = 'lighter';

      // ─── PASS 1: DEEP AURA ATMOSPHERIC BLOOM ───
      ctx.lineWidth = 14 * intensity;
      ctx.strokeStyle = glowColor;
      ctx.globalAlpha = 0.22 * surge;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 30 * intensity;
      drawPolyline(boltPaths[0]);

      // ─── PASS 2: VIVID NEON GLOW BEAM ───
      ctx.lineWidth = 4.5 * intensity;
      ctx.strokeStyle = glowColor;
      ctx.globalAlpha = 0.85;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 14 * intensity;
      drawPolyline(boltPaths[0]);
      drawPolyline(boltPaths[1]);

      // ─── PASS 3: HIGH-INTENSITY WHITE CORE BOLT ───
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = coreColor;
      ctx.globalAlpha = 0.95;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 5;
      drawPolyline(boltPaths[0]);
      drawPolyline(boltPaths[1]);

      // ─── PASS 4: MICRO-ARCS ───
      for (let i = microArcs.length - 1; i >= 0; i--) {
        const arc = microArcs[i];
        arc.life += dt;
        if (arc.life >= arc.maxLife) {
          microArcs.splice(i, 1);
          continue;
        }

        const alpha = 1 - arc.life / arc.maxLife;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = arc.color;
        ctx.globalAlpha = alpha * 0.9;
        ctx.shadowColor = arc.color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(arc.points[0].x, arc.points[0].y);
        for (let j = 1; j < arc.points.length; j++) {
          ctx.lineTo(arc.points[j].x, arc.points[j].y);
        }
        ctx.stroke();
      }

      // ─── PASS 5: ELECTRIC SPARKS ───
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.life += dt;
        if (sp.life >= sp.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        sp.vx *= 0.94;
        sp.vy *= 0.94;

        const alpha = 1 - sp.life / sp.maxLife;
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * alpha, 0, Math.PI * 2);
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
  }, [glowColor, coreColor, intensity, borderRadius, enableSparks]);

  return (
    <div ref={containerRef} className={`relative isolate ${className}`}>
      {/* Realtime GPU Canvas Lightning Layer */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute left-0 top-0 z-20 overflow-visible"
      />
      {/* Content Container (Fully Dynamic & Responsive) */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
