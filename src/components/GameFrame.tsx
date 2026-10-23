import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../utils/cn';
import bgImg from '../assets/bg';

export function GameFrame({ children, className, fit }: { children: ReactNode; className?: string; fit?: boolean }) {
  return (
    <div
      className={cn('relative w-full overflow-hidden bg-sky-300 bg-cover bg-center', fit ? 'h-dvh' : 'min-h-dvh', className)}
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-200/10 via-transparent to-blue-900/25" />
      <div className={cn('relative z-10 flex w-full flex-col', fit ? 'h-full overflow-y-auto overflow-x-hidden' : 'min-h-dvh')}>{children}</div>
    </div>
  );
}

/** High-contrast credit label: white + yellow text on a dark navy pill with white border */
export function Credit({ className }: { className?: string }) {
  return (
    <p className={cn('credit inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-extrabold leading-none tracking-wide sm:text-[13px]', className)}>
      <span className="text-white">created by:</span>
      <span className="text-[#ffe14d]">widodo guru sd</span>
    </p>
  );
}

export function IconButton({ onClick, children, title }: { onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button onClick={onClick} title={title} className="btn-3d btn-blue flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg sm:h-11 sm:w-11 sm:rounded-2xl sm:text-xl">
      {children}
    </button>
  );
}

export function LevelPills({ current, unlocked }: { current?: number; unlocked?: number }) {
  const colors = ['btn-green', 'btn-blue', 'btn-orange', 'btn-purple', 'btn-pink'];
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      {colors.map((c, i) => {
        const locked = unlocked !== undefined && i > unlocked;
        return (
          <span
            key={i}
            className={cn(
              'btn-3d flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] sm:px-3 sm:text-xs',
              c,
              current === i && 'anim-pulse-glow scale-110',
              locked && 'opacity-50 grayscale',
            )}
            style={{ '--btn-depth': '3px' } as CSSProperties}
          >
            <span>{locked ? '🔒' : '⭐'}</span> LEVEL {i + 1}
          </span>
        );
      })}
    </div>
  );
}
