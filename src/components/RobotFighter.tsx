import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../utils/cn';
import type { Point, Robot } from '../data/robots';
import { BigExplosion, Explosion, Lightning, Smoke } from './Effects';

export type FighterState = 'idle' | 'shoot' | 'hit' | 'zapped' | 'destroyed' | 'victory';

interface Props {
  robot: Robot;
  side: 'left' | 'right';
  label: string;
  hp: number;
  maxHp: number;
  state: FighterState;
  active?: boolean;
  status?: ReactNode;
  /** ref to the (unanimated) image box — used to compute the exact muzzle position */
  boxRef?: (el: HTMLDivElement | null) => void;
}

const at = (p: Point): CSSProperties => ({ left: `${p.x * 100}%`, top: `${p.y * 100}%` });

export default function RobotFighter({ robot, side, label, hp, maxHp, state, active, status, boxRef }: Props) {
  const pct = Math.max(0, (hp / maxHp) * 100);
  const hpClass = pct <= 30 ? 'critical' : pct <= 60 ? 'low' : '';
  const flip = side === 'right';

  return (
    <div className={cn('flex min-h-0 w-[47%] flex-col self-stretch sm:w-[36%] lg:w-[32%]', flip ? 'items-end' : 'items-start')}>
      {/* Name + HP */}
      <div className={cn('flex w-full shrink-0 flex-col gap-1', flip && 'items-end')}>
        <div
          className={cn(
            'badge inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide sm:px-3 sm:py-1 sm:text-xs',
            active && 'anim-pulse-glow',
          )}
        >
          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-white sm:h-3 sm:w-3" style={{ background: robot.color }} />
          <span className="truncate">{label}</span>
          <span className="truncate opacity-70">· {robot.name}</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full border-2 border-white bg-slate-800/70 shadow-[0_0_0_2px_#1b57c9] sm:h-4">
          <div className={cn('hp-bar h-full rounded-full', hpClass)} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Robot stage (size container) */}
      <div className="robot-stage relative mt-1 min-h-0 w-full flex-1">
        <div
          className="absolute bottom-0 left-1/2 h-5 w-[60%] -translate-x-1/2 rounded-[100%] opacity-70 blur-md"
          style={{ background: active ? '#ffd63a' : state === 'destroyed' ? '#333' : robot.color }}
        />

        {/* Image box: exact image proportions, not animated → stable coordinates */}
        <div
          ref={boxRef}
          className={cn(
            'robot-box absolute bottom-0 left-1/2 -translate-x-1/2',
            flip && 'scale-x-[-1]',
            state === 'hit' && 'anim-shake',
            state === 'shoot' && 'anim-recoil',
          )}
          style={{ '--ar': robot.aspect } as CSSProperties}
        >
          <img
            src={robot.img}
            alt={robot.name}
            draggable={false}
            className={cn(
              'absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_12px_rgba(0,30,90,0.45)]',
              state === 'idle' && 'anim-float',
              state === 'zapped' && 'anim-electrified',
              state === 'destroyed' && 'anim-burn',
              state === 'victory' && 'anim-wiggle',
            )}
          />

          {state === 'hit' && (
            <div className="absolute aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2" style={at(robot.hit)}>
              <Explosion />
            </div>
          )}
          {state === 'zapped' && <Lightning />}
          {state === 'destroyed' && (
            <>
              <div className="absolute aspect-square w-[170%] -translate-x-1/2 -translate-y-1/2" style={at(robot.hit)}>
                <BigExplosion />
              </div>
              <Smoke count={16} delayStep={0.25} dur={2.8} dark bottom="35%" />
            </>
          )}
        </div>

        {state === 'victory' && (
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-2xl sm:text-4xl">
            <span className="anim-star inline-block">⭐</span>
            <span className="anim-star inline-block" style={{ animationDelay: '0.15s' }}>⭐</span>
            <span className="anim-star inline-block" style={{ animationDelay: '0.3s' }}>⭐</span>
          </div>
        )}

        {status && <div className={cn('pointer-events-none absolute top-0 z-20', flip ? 'right-0' : 'left-0')}>{status}</div>}
      </div>
    </div>
  );
}
