import { useMemo, type CSSProperties } from 'react';

/* ---------- Particles ---------- */
function Particles({ count, spread, colors, dur = 0.8, size = 14 }: { count: number; spread: number; colors: string[]; dur?: number; size?: number }) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        const dist = spread * (0.5 + Math.random() * 0.7);
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          color: colors[i % colors.length],
          s: size * (0.5 + Math.random()),
          d: dur * (0.7 + Math.random() * 0.6),
        };
      }),
    [count, spread, colors, dur, size],
  );
  return (
    <>
      {parts.map((p, i) => (
        <span
          key={i}
          className="anim-particle absolute left-1/2 top-1/2 rounded-full"
          style={
            {
              width: p.s,
              height: p.s,
              marginLeft: -p.s / 2,
              marginTop: -p.s / 2,
              background: p.color,
              boxShadow: `0 0 10px ${p.color}`,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--dur': `${p.d}s`,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}

/* ---------- Smoke ---------- */
export function Smoke({ count = 6, delayStep = 0.15, dur = 1.8, dark = false, bottom = '40%' }: { count?: number; delayStep?: number; dur?: number; dark?: boolean; bottom?: string }) {
  const puffs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.random() - 0.5) * 60,
        sx: (Math.random() - 0.5) * 80,
        s: 40 + Math.random() * 50,
        delay: i * delayStep,
        d: dur * (0.8 + Math.random() * 0.5),
        shade: dark ? 40 + Math.random() * 40 : 120 + Math.random() * 80,
      })),
    [count, delayStep, dur, dark],
  );
  return (
    <>
      {puffs.map((p, i) => (
        <span
          key={i}
          className="anim-smoke pointer-events-none absolute left-1/2 rounded-full"
          style={
            {
              bottom,
              width: p.s,
              height: p.s,
              marginLeft: -p.s / 2 + p.x,
              background: `radial-gradient(circle at 40% 40%, rgb(${p.shade + 50},${p.shade + 50},${p.shade + 50}) 0%, rgb(${p.shade},${p.shade},${p.shade}) 60%, transparent 75%)`,
              filter: 'blur(3px)',
              animationDelay: `${p.delay}s`,
              '--dur': `${p.d}s`,
              '--sx': `${p.sx}px`,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}

const PARTICLE_COLORS = ['#ffd63a', '#ff8a1f', '#ff4d2e', '#ffffff'];
const BIG_PARTICLE_COLORS = ['#ffd63a', '#ff8a1f', '#ff4d2e', '#ffffff', '#444'];

/* ---------- Small explosion (hit). Fills its (square) parent. ---------- */
export function Explosion() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="anim-explode absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, #ffffff 0%, #fff29a 20%, #ffb02e 45%, #ff5a1f 65%, rgba(255,60,20,0) 72%)' }}
      />
      <div className="anim-ring absolute inset-[14%] rounded-full border-solid border-amber-200" />
      <Particles count={14} spread={110} colors={PARTICLE_COLORS} />
      <Smoke count={6} delayStep={0.12} dur={1.7} bottom="30%" />
    </div>
  );
}

/* ---------- Big final explosion. Fills its (square) parent. ---------- */
export function BigExplosion() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="anim-big-boom absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, #ffffff 0%, #fff6b0 15%, #ffc23a 35%, #ff6a1f 55%, #c42a0a 68%, rgba(120,20,0,0) 74%)' }}
      />
      <div
        className="anim-big-boom absolute inset-[12%] rounded-full"
        style={{ animationDelay: '0.25s', background: 'radial-gradient(circle, #ffffff 0%, #ffe28a 25%, #ff8a1f 55%, rgba(255,60,20,0) 72%)' }}
      />
      <div className="anim-ring absolute inset-[10%] rounded-full border-solid border-orange-200" style={{ animationDuration: '1s' }} />
      <div className="anim-ring absolute inset-[10%] rounded-full border-solid border-yellow-100" style={{ animationDuration: '1.2s', animationDelay: '0.2s' }} />
      <Particles count={26} spread={220} colors={BIG_PARTICLE_COLORS} dur={1.3} size={20} />
      <Smoke count={14} delayStep={0.22} dur={2.6} dark bottom="30%" />
    </div>
  );
}

/* ---------- Lightning / electric shock. Fills its parent. ---------- */
function boltPath(x: number, h: number, seed: number) {
  let d = `M ${x} 0`;
  let cx = x;
  const steps = 7;
  for (let i = 1; i <= steps; i++) {
    cx += Math.sin(seed * 13 + i * 7) * 22;
    d += ` L ${cx} ${(h / steps) * i}`;
  }
  return d;
}

export function Lightning() {
  const bolts = useMemo(() => [0.3, 0.5, 0.7].map((f, i) => ({ x: f * 200, seed: Math.random() * 10 + i })), []);
  const sparks = useMemo(
    () =>
      Array.from({ length: 12 }, () => ({
        left: 15 + Math.random() * 70,
        top: 10 + Math.random() * 80,
        dur: 0.25 + Math.random() * 0.3,
        delay: Math.random() * 0.5,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      <svg className="anim-bolt absolute inset-0 h-full w-full" viewBox="0 0 200 300" preserveAspectRatio="none">
        {bolts.map((b, i) => (
          <g key={i}>
            <path d={boltPath(b.x, 300, b.seed)} fill="none" stroke="#9df1ff" strokeWidth={10} strokeLinejoin="round" opacity={0.6} />
            <path d={boltPath(b.x, 300, b.seed)} fill="none" stroke="#ffffff" strokeWidth={4} strokeLinejoin="round" />
          </g>
        ))}
      </svg>
      {sparks.map((s, i) => (
        <span
          key={i}
          className="anim-spark absolute text-xl"
          style={{ left: `${s.left}%`, top: `${s.top}%`, '--dur': `${s.dur}s`, '--delay': `${s.delay}s`, filter: 'drop-shadow(0 0 6px #9df1ff)' } as CSSProperties}
        >
          ⚡
        </span>
      ))}
    </div>
  );
}

/* ---------- Laser beam: from the gun muzzle (x1,y1) to the target's chest (x2,y2) ---------- */
export interface Shot {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  big?: boolean;
  id: number;
}

export function LaserBeam({ shot }: { shot: Shot }) {
  const { x1, y1, x2, y2, color, big } = shot;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const thick = big ? 22 : 11;
  const dur = big ? 1.1 : 0.7;
  const flash = thick * 3.4;
  const impact = thick * 5;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-visible">
      {/* beam (rotated wrapper anchored at the muzzle) */}
      <div className="absolute" style={{ left: x1, top: y1, width: len, height: 0, transform: `rotate(${angle}deg)`, transformOrigin: '0 0' }}>
        <div
          className="anim-laser absolute left-0 rounded-full"
          style={{
            top: -thick / 2,
            height: thick,
            width: '100%',
            transformOrigin: 'left center',
            animationDuration: `${dur}s`,
            background: `linear-gradient(90deg, #ffffff, ${color} 6%, ${color} 94%, #ffffff)`,
            boxShadow: `0 0 ${thick}px ${thick / 2.5}px ${color}, 0 0 ${thick * 3}px ${thick}px ${color}99`,
          }}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full bg-white" style={{ height: Math.max(3, thick * 0.38) }} />
        </div>
      </div>
      {/* muzzle flash exactly at the gun tip */}
      <div
        className="anim-muzzle absolute rounded-full"
        style={{ left: x1, top: y1, width: flash, height: flash, background: `radial-gradient(circle, #ffffff 0%, #ffffff 18%, ${color} 45%, transparent 70%)` }}
      />
      {/* impact flash at the target */}
      <div
        className="anim-impact absolute rounded-full"
        style={{ left: x2, top: y2, width: impact, height: impact, '--dur': `${dur}s`, background: `radial-gradient(circle, #ffffff 0%, ${color} 40%, transparent 70%)` } as CSSProperties}
      />
    </div>
  );
}

/* ---------- Confetti ---------- */
export function Confetti({ count = 40 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 3,
        dur: 2.5 + Math.random() * 2.5,
        color: ['#ffd63a', '#ff8a1f', '#4cc22e', '#2d6cf0', '#ec3f9a', '#ffffff'][Math.floor(Math.random() * 6)],
        w: 6 + Math.random() * 8,
        h: 10 + Math.random() * 10,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="anim-confetti absolute top-0 rounded-sm"
          style={{ left: `${p.left}%`, width: p.w, height: p.h, background: p.color, '--dur': `${p.dur}s`, '--delay': `${p.delay}s` } as CSSProperties}
        />
      ))}
    </div>
  );
}
