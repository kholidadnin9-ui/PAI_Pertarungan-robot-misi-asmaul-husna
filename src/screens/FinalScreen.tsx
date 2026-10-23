import type { Robot } from '../data/robots';
import { Confetti } from '../components/Effects';
import { Credit, GameFrame, LevelPills } from '../components/GameFrame';
import { cn } from '../utils/cn';
import { sfx } from '../utils/sound';

interface Props {
  mode: 1 | 2;
  robots: [Robot, Robot];
  totalStars: [number, number];
  levelWins: [number, number];
  onHome: () => void;
  onReplay: () => void;
}

export default function FinalScreen({ mode, robots, totalStars, levelWins, onHome, onReplay }: Props) {
  const maxStars = 500;
  let champion: 0 | 1 | 'draw' = 'draw';
  if (mode === 2) {
    if (totalStars[0] !== totalStars[1]) champion = totalStars[0] > totalStars[1] ? 0 : 1;
    else if (levelWins[0] !== levelWins[1]) champion = levelWins[0] > levelWins[1] ? 0 : 1;
  } else champion = 0;

  const pct = Math.round((totalStars[0] / maxStars) * 100);
  const rating = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
  const title = mode === 1 ? 'JUARA!' : champion === 'draw' ? 'SERI!' : `PEMAIN ${(champion as number) + 1} JUARA!`;

  return (
    <GameFrame>
      <Confetti count={60} />
      <div className="flex flex-1 flex-col items-center justify-center px-3 py-4 sm:px-6">
        <div className="anim-pop flex flex-col items-center">
          <div className="flex items-end gap-1 text-5xl sm:text-7xl">
            {[0, 1, 2].map((i) => (
              <span key={i} className={cn('anim-star inline-block', i === 1 && 'scale-125', mode === 1 && i >= rating && 'grayscale opacity-40')} style={{ animationDelay: `${0.2 + i * 0.2}s` }}>
                🏆
              </span>
            ))}
          </div>
          <div className="panel-blue mt-1 flex flex-col items-center rounded-3xl px-8 py-3 sm:px-14 sm:py-4">
            <span className="font-title title-gold text-5xl leading-none sm:text-7xl">{title}</span>
            <span className="font-title title-white mt-1 text-xl leading-none sm:text-3xl">SEMUA LEVEL SELESAI!</span>
          </div>
          <Credit className="mt-2" />
        </div>

        <div className="mt-4 flex w-full max-w-5xl items-center justify-center gap-2 sm:gap-6">
          <div className="result-robot relative flex w-[26%] items-end justify-center">
            <div className="absolute bottom-0 left-1/2 h-5 w-[70%] -translate-x-1/2 rounded-[100%] opacity-60 blur-md" style={{ background: robots[0].color }} />
            <img src={robots[0].img} alt={robots[0].name} draggable={false} className={cn('relative h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_10px_14px_rgba(0,30,90,0.5)]', champion === 0 ? 'anim-wiggle' : 'anim-float')} />
            {champion === 0 && <span className="absolute -top-4 text-4xl sm:text-5xl">👑</span>}
          </div>

          <div className="panel-glass anim-slide-up flex w-full max-w-md flex-col gap-3 rounded-3xl p-4 sm:p-6">
            {mode === 1 ? (
              <>
                <div className="text-center text-sm font-extrabold text-blue-900">Total Bintang</div>
                <div className="font-title text-center text-5xl text-orange-500">⭐ {totalStars[0]}</div>
                <div className="text-center text-xs font-bold text-blue-800">dari {maxStars} bintang ({pct}%)</div>
                <div className="h-5 w-full overflow-hidden rounded-full border-2 border-blue-300 bg-blue-950/20">
                  <div className="hp-bar h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-center text-sm font-extrabold text-blue-900">
                  {pct >= 90 ? 'Luar biasa! Kamu hafal Asmaul Husna! 🌟' : pct >= 70 ? 'Hebat! Terus belajar Asmaul Husna ya! 👍' : 'Bagus! Ayo main lagi supaya makin pintar! 💪'}
                </p>
              </>
            ) : (
              <>
                {[0, 1].map((p) => (
                  <div key={p} className={cn('flex items-center gap-2 rounded-2xl border-2 px-3 py-2', champion === p ? 'border-yellow-400 bg-yellow-100/80' : 'border-white bg-white/70')}>
                    <span className="h-4 w-4 rounded-full border-2 border-white" style={{ background: robots[p].color }} />
                    <span className="flex-1 text-sm font-extrabold text-blue-900">
                      Pemain {p + 1} · {robots[p].name} {champion === p && '👑'}
                    </span>
                    <span className="text-xs font-bold text-blue-800">Menang {levelWins[p]} level</span>
                    <span className="font-title text-lg text-orange-500">⭐ {totalStars[p]}</span>
                  </div>
                ))}
                <p className="text-center text-sm font-extrabold text-blue-900">
                  {champion === 'draw' ? 'Kalian sama-sama hebat! 🤝' : `Selamat Pemain ${(champion as number) + 1}! Kamu juara Asmaul Husna! 🌟`}
                </p>
              </>
            )}
            <button onClick={() => { sfx.click(); onReplay(); }} className="btn-3d btn-orange rounded-2xl px-6 py-3 text-2xl">
              MAIN LAGI 🔄
            </button>
            <button onClick={() => { sfx.click(); onHome(); }} className="btn-3d btn-blue rounded-2xl px-6 py-2 text-lg" style={{ '--btn-depth': '4px' } as React.CSSProperties}>
              🏠 MENU UTAMA
            </button>
          </div>

          <div className="result-robot relative flex w-[26%] items-end justify-center">
            <div className="absolute bottom-0 left-1/2 h-5 w-[70%] -translate-x-1/2 rounded-[100%] opacity-60 blur-md" style={{ background: robots[1].color }} />
            <img src={robots[1].img} alt={robots[1].name} draggable={false} className={cn('relative h-full w-auto max-w-full scale-x-[-1] object-contain object-bottom drop-shadow-[0_10px_14px_rgba(0,30,90,0.5)]', champion === 1 ? 'anim-wiggle' : 'anim-float')} />
            {champion === 1 && <span className="absolute -top-4 text-4xl sm:text-5xl">👑</span>}
          </div>
        </div>

        <div className="mt-4">
          <LevelPills unlocked={4} />
        </div>
      </div>
    </GameFrame>
  );
}
