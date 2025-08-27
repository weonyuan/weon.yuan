"use client";
import { useEffect, useRef } from "react";

/**
 * Flock of equilateral triangles:
 * - Off-screen spawn (left), swims in.
 * - Cursor-follow when moving; auto leader otherwise.
 * - Inverted-funnel formation: sparse front, denser/wider tail.
 * - Boids flocking + per-boid "slot" following behind leader.
 * - Non-overlapping (separation + light collision relaxation).
 * - Theme-aware color via --triangle-color; respects reduced motion.
 */

type Boid = { x: number; y: number; vx: number; vy: number; depth: number };

function getTriangleColor(): string {
  const styles = getComputedStyle(document.documentElement);
  const c = styles.getPropertyValue("--triangle-color").trim();
  return c || "#0a0a0a";
}

// Small PRNG for stable slot jitter without Math.random() each frame
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function BackgroundFlock({
  // Flock size/shape
  count = 38,
  side = 14,                // equilateral side length
  neighborRadius = 100,
  separationRadius = 46,
  collisionIters = 2,

  // Kinematics
  maxSpeed = 1.25,
  minSpeed = 0.28,
  maxForce = 0.035,
  alignWeight = 0.8,
  cohereWeight = 0.6,
  separateWeight = 1.3,

  // Leader + behavior
  drift = 0.16,            // light rightward drift
  leaderWeight = 0.8,      // how strongly to seek the leader
  leaderSpeed = 0.65,      // auto-leader path speed
  leaderAmplitude = 0.30,  // auto-leader vertical sway (fraction of H)
  leaderWaves = 1.2,       // waves across width
  cursorIdleMs = 1400,     // if no mouse move for this long, use auto leader

  // Formation: inverted funnel
  baseGap = 24,            // distance behind leader for the first (frontmost) slot
  gapStep = 12,            // additional gap per depth
  lateralSpread = 10,      // base lateral spread per depth unit
  funnelCurve = 1.08,      // >1 widens faster toward the tail
  slotFollow = 0.65,       // blend toward slot vs. classic flock forces

  // Spawn + warm-up
  spawnInset = 80,         // off-screen spawn offset (negative x)
  spawnSpread = 80,        // circular spread at spawn area
  warmupFrames = 240,      // ramp-in for cohesion/alignment/leader

  strokeWidth = 1.2,
}: {
  count?: number;
  side?: number;
  neighborRadius?: number;
  separationRadius?: number;
  collisionIters?: number;
  maxSpeed?: number;
  minSpeed?: number;
  maxForce?: number;
  alignWeight?: number;
  cohereWeight?: number;
  separateWeight?: number;
  drift?: number;
  leaderWeight?: number;
  leaderSpeed?: number;
  leaderAmplitude?: number;
  leaderWaves?: number;
  cursorIdleMs?: number;
  baseGap?: number;
  gapStep?: number;
  lateralSpread?: number;
  funnelCurve?: number;
  slotFollow?: number;
  spawnInset?: number;
  spawnSpread?: number;
  warmupFrames?: number;
  strokeWidth?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boidsRef = useRef<Boid[]>([]);
  const colorRef = useRef("#0a0a0a");
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(0);

  // Mouse leader state (cursor-follow)
  const lastMoveTsRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  const limit = (x: number, max: number) =>
    Math.abs(x) > max ? (x > 0 ? max : -max) : x;
  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let width = 0;
    let height = 0;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      const arr: Boid[] = [];
      // Depth assignment: 0 = front (nearest leader), higher = tail.
      // We'll distribute more boids to deeper (tail) depths.
      // Simple scheme: triangular distribution via cumulative buckets.
      const depths: number[] = [];
      const tiers = Math.max(6, Math.ceil(Math.sqrt(count) + 2));
      let total = 0;
      for (let d = 0; d < tiers; d++) {
        const weight = Math.max(1, Math.floor(Math.pow(funnelCurve, d)));
        total += weight;
        depths.push(weight);
      }
      // Normalize to count by proportional allocation
      const allocated: number[] = [];
      let sumAlloc = 0;
      for (let d = 0; d < depths.length; d++) {
        const n = Math.max(1, Math.round((depths[d] / total) * count));
        allocated.push(n);
        sumAlloc += n;
      }
      // Adjust if off due to rounding
      while (sumAlloc > count) {
        for (let d = allocated.length - 1; d >= 0 && sumAlloc > count; d--) {
          if (allocated[d] > 1) {
            allocated[d]--;
            sumAlloc--;
          }
        }
      }
      while (sumAlloc < count) {
        allocated[allocated.length - 1]++;
        sumAlloc++;
      }

      // Spawn off-screen left with small spread; assign depths
      const prng = mulberry32(1337);
      for (let d = 0, idx = 0; d < allocated.length; d++) {
        for (let k = 0; k < allocated[d]; k++, idx++) {
          const ang = prng() * Math.PI * 2;
          const r = prng() * spawnSpread;
          const sx = -spawnInset + Math.cos(ang) * r; // off-screen negative x
          const sy = height * 0.5 + Math.sin(ang) * r;
          const initAng = (prng() - 0.5) * 0.2;
          const spd = 0.25 + prng() * 0.25;
          arr.push({
            x: sx,
            y: sy,
            vx: Math.cos(initAng) * spd + drift * 0.7,
            vy: Math.sin(initAng) * spd,
            depth: d, // store tier depth
          });
        }
      }

      boidsRef.current = arr;
      frameRef.current = 0;
    }

    function autoLeader(t: number) {
      // Smooth sine path from left to right; re-enters from off-screen
      const x = ((t * leaderSpeed) % (width + 240)) - 120;
      const amp = height * leaderAmplitude;
      const k = (2 * Math.PI * leaderWaves) / Math.max(width, 1);
      const y = height * 0.5 + Math.sin(k * x) * amp;
      return { x, y };
    }

    function currentLeader(t: number) {
      const now = performance.now();
      const idle = now - lastMoveTsRef.current > cursorIdleMs;
      if (!idle) {
        // Cursor leader
        return { x: mouseRef.current.x, y: mouseRef.current.y };
      }
      // Auto leader
      return autoLeader(t);
    }

    function steerBoids(leader: { x: number; y: number }) {
      const boids = boidsRef.current;

      // Precompute leader direction for slot positions
      // Approximate leader forward direction by finite difference of auto path
      const ahead = autoLeader(frameRef.current + 8);
      const dirX0 = ahead.x - leader.x;
      const dirY0 = ahead.y - leader.y;
      let dirLen = Math.hypot(dirX0, dirY0) || 1;
      // If following cursor and it's mostly stationary, push forward along +x
      let dirX = dirX0 / dirLen || 1;
      let dirY = dirY0 / dirLen || 0;
      if (Math.abs(dirX) + Math.abs(dirY) < 0.2) {
        dirX = 1; dirY = 0; dirLen = 1;
      }
      const perpX = -dirY;
      const perpY = dirX;

      for (let i = 0; i < boids.length; i++) {
        const b = boids[i];

        // Classic neighborhood forces
        let countN = 0;
        let alignX = 0, alignY = 0;
        let cohereX = 0, cohereY = 0;
        let separateX = 0, separateY = 0;

        for (let j = 0; j < boids.length; j++) {
          if (i === j) continue;
          const o = boids[j];
          const dx = o.x - b.x;
          const dy = o.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < neighborRadius * neighborRadius) {
            countN++;
            alignX += o.vx; alignY += o.vy;
            cohereX += o.x; cohereY += o.y;
            if (d2 < separationRadius * separationRadius) {
              const d = Math.sqrt(d2) || 1;
              separateX -= dx / d;
              separateY -= dy / d;
            }
          }
        }

        // Alignment/Cohesion/Separation
        let steerAX = 0, steerAY = 0;
        let steerCX = 0, steerCY = 0;
        let steerSX = 0, steerSY = 0;

        if (countN > 0) {
          // Alignment
          alignX /= countN; alignY /= countN;
          const alLen = Math.hypot(alignX, alignY) || 1;
          alignX = (alignX / alLen) * maxSpeed - b.vx;
          alignY = (alignY / alLen) * maxSpeed - b.vy;
          steerAX = limit(alignX, maxForce);
          steerAY = limit(alignY, maxForce);

          // Cohesion
          cohereX = cohereX / countN - b.x;
          cohereY = cohereY / countN - b.y;
          const coLen = Math.hypot(cohereX, cohereY) || 1;
          cohereX = (cohereX / coLen) * maxSpeed - b.vx;
          cohereY = (cohereY / coLen) * maxSpeed - b.vy;
          steerCX = limit(cohereX, maxForce);
          steerCY = limit(cohereY, maxForce);

          // Separation
          const seLen = Math.hypot(separateX, separateY) || 1;
          separateX = (separateX / seLen) * maxSpeed - b.vx;
          separateY = (separateY / seLen) * maxSpeed - b.vy;
          steerSX = limit(separateX, maxForce);
          steerSY = limit(separateY, maxForce);
        }

        // Leader seek (toward leader)
        let seekX = leader.x - b.x;
        let seekY = leader.y - b.y;
        const seekLen = Math.hypot(seekX, seekY) || 1;
        seekX = (seekX / seekLen) * maxSpeed - b.vx;
        seekY = (seekY / seekLen) * maxSpeed - b.vy;
        const steerLX = limit(seekX, maxForce);
        const steerLY = limit(seekY, maxForce);

        // Slot follow (inverted funnel)
        // Slot position behind leader, farther back for deeper boids,
        // with lateral width that grows by depth (funnel).
        const depth = boids[i].depth;
        const longitudinal = baseGap + gapStep * depth;
        const spread = lateralSpread * Math.pow(funnelCurve, depth);

        // Deterministic jitter per boid for left/right assignment
        const rnd = mulberry32(1000 + depth * 409 + i)() - 0.5; // [-0.5..0.5)
        const lateral = rnd * spread;

        const slotX = leader.x - dirX * longitudinal + perpX * lateral;
        const slotY = leader.y - dirY * longitudinal + perpY * lateral;

        let slotVX = slotX - b.x;
        let slotVY = slotY - b.y;
        const slotLen = Math.hypot(slotVX, slotVY) || 1;
        slotVX = (slotVX / slotLen) * maxSpeed - b.vx;
        slotVY = (slotVY / slotLen) * maxSpeed - b.vy;
        const steerSlotX = limit(slotVX, maxForce);
        const steerSlotY = limit(slotVY, maxForce);

        // Drift (keeps motion forward)
        const driftVX = drift;
        const driftVY = 0;
        const driftFX = limit(driftVX - b.vx, maxForce * 0.5);
        const driftFY = limit(driftVY - b.vy, maxForce * 0.5);

        // Warm-up ramp for flocking & leader, slot is always blended (but scaled)
        const w = clamp01(frameRef.current / warmupFrames);
        const flockW = w;
        const leadW = w;

        // Combine forces
        b.vx +=
          steerAX * alignWeight * flockW +
          steerCX * cohereWeight * flockW +
          steerSX * separateWeight +
          steerLX * leaderWeight * leadW +
          steerSlotX * slotFollow +
          driftFX;

        b.vy +=
          steerAY * alignWeight * flockW +
          steerCY * cohereWeight * flockW +
          steerSY * separateWeight +
          steerLY * leaderWeight * leadW +
          steerSlotY * slotFollow +
          driftFY;

        // Clamp speeds
        let sp = Math.hypot(b.vx, b.vy);
        if (sp < minSpeed) {
          const f = (minSpeed + 1e-6) / (sp + 1e-6);
          b.vx *= f; b.vy *= f; sp = minSpeed;
        } else if (sp > maxSpeed) {
          b.vx = (b.vx / sp) * maxSpeed;
          b.vy = (b.vy / sp) * maxSpeed;
        }
      }
    }

    function resolveCollisions() {
      const boids = boidsRef.current;
      const minDist = separationRadius * 0.95;

      for (let iter = 0; iter < collisionIters; iter++) {
        for (let i = 0; i < boids.length; i++) {
          for (let j = i + 1; j < boids.length; j++) {
            const a = boids[i], b = boids[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > 0 && d2 < minDist * minDist) {
              const d = Math.sqrt(d2) || 1;
              const overlap = (minDist - d) * 0.5;
              const nx = dx / d, ny = dy / d;
              a.x -= nx * overlap; a.y -= ny * overlap;
              b.x += nx * overlap; b.y += ny * overlap;
              a.vx *= 0.985; a.vy *= 0.985;
              b.vx *= 0.985; b.vy *= 0.985;
            }
          }
        }
      }
    }

    function step() {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      colorRef.current = getTriangleColor();
      if (!reduce) frameRef.current += 1;

      const leader = currentLeader(frameRef.current);

      if (!reduce) steerBoids(leader);

      // Integrate & bounce
      const margin = 8;
      const boids = boidsRef.current;

      for (const b of boids) {
        if (!reduce) {
          b.x += b.vx;
          b.y += b.vy;
        }
        if (b.x < -spawnInset) { // allow some off-screen space on left
          b.x = -spawnInset; b.vx = Math.abs(b.vx) * (1 + 0.04);
        } else if (b.x > width - margin) {
          b.x = width - margin; b.vx = -Math.abs(b.vx) * (1 + 0.04);
        }
        if (b.y < margin) {
          b.y = margin; b.vy = Math.abs(b.vy) * (1 + 0.04);
        } else if (b.y > height - margin) {
          b.y = height - margin; b.vy = -Math.abs(b.vy) * (1 + 0.04);
        }
      }

      resolveCollisions();

      // Draw
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = colorRef.current + "80";
      ctx.fillStyle = colorRef.current + "14";

      for (const b of boids) {
        const theta = Math.atan2(b.vy, b.vx) || 0;
        const R = side / Math.sqrt(3); // equilateral circumradius

        const a1 = theta;
        const a2 = theta + (2 * Math.PI) / 3;
        const a3 = theta - (2 * Math.PI) / 3;

        const v1x = b.x + Math.cos(a1) * R;
        const v1y = b.y + Math.sin(a1) * R;
        const v2x = b.x + Math.cos(a2) * R;
        const v2y = b.y + Math.sin(a2) * R;
        const v3x = b.x + Math.cos(a3) * R;
        const v3y = b.y + Math.sin(a3) * R;

        ctx.beginPath();
        ctx.moveTo(v1x, v1y);
        ctx.lineTo(v2x, v2y);
        ctx.lineTo(v3x, v3y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(step);
    }

    // Init
    resize();
    init();
    rafRef.current = requestAnimationFrame(step);

    // Theme watcher
    const mo = new MutationObserver(() => {
      colorRef.current = getTriangleColor();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Resize handling
    const onResize = () => {
      resize();
      for (const b of boidsRef.current) {
        b.x = Math.max(-spawnInset, Math.min(width, b.x));
        b.y = Math.max(0, Math.min(height, b.y));
      }
    };
    window.addEventListener("resize", onResize);

    // Mouse leader tracking
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      lastMoveTsRef.current = performance.now();
    };
    window.addEventListener("mousemove", onMove);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      mo.disconnect();
    };
  }, [
    count, side, neighborRadius, separationRadius, collisionIters,
    maxSpeed, minSpeed, maxForce, alignWeight, cohereWeight, separateWeight,
    drift, leaderWeight, leaderSpeed, leaderAmplitude, leaderWaves, cursorIdleMs,
    baseGap, gapStep, lateralSpread, funnelCurve, slotFollow,
    spawnInset, spawnSpread, warmupFrames, strokeWidth,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}