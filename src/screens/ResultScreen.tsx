import type { CSSProperties } from 'react';
import type { Robot } from '../data/robots';
import { LEVELS } from '../data/questions';
import { Confetti, Smoke } from '../components/Effects';
import { Credit, GameFrame, LevelPills } from '../components/GameFrame';
import type { LevelResult } from './BattleScreen';
import { cn } from '../utils/cn';
import { sfx } from '../utils/sound';

interface Props {
  mode: 1 | 2;
  robots: [Robot, Robot];
  result: LevelResult;
  totalStars: [number, number];
  levelWins: [number, number];
  onNext: () => void;
  onRetry: () => void;
  onHome: () => void;
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-end justify-center gap-1 text-4xl sm:text-6xl">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn('anim-star inline-block drop-shadow-[0_4px_0_#1a4ba8]', i === 1 && 'scale-125', i >= n && 'opacity-40 grayscale')}
          style={{ animationDelay: `${0.2 + i * 0.2}s` }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

function RobotShow({ robot, state, flip }: { robot: Robot; state: 'win' | 'lose' | 'idle'; flip?: boolean }) {
  return (
    <div className="result-robot relative flex w-[26%] items-end justify-center">
      <div className="absolute bottom-0 left-1/2 h-5 w-[70%] -translate-x-1/2 rounded-[100%] opacity-60 blur-md" style={{ background: state === 'lose' ? '#333' : robot.color }} />
      <img
        src={robot.img}
        alt={robot.name}
        draggable={false}
        className={cn(
          'relative h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_10px_14px_rgba(0,30,90,0.5)]',
          state === 'win' && 'anim-wiggle',
          state === 'idle' && 'anim-float',
          state === 'lose' && 'opacity-80 brightness-[0.25] contrast-125 grayscale',
          flip && 'scale-x-[-1]',
        )}
      />
      {state === 'lose' && <Smoke count={8} delayStep={0.5} dur={3} dark bottom="25%" />}
      {state === 'lose' && <span className="absolute top-2 text-3xl sm:text-4xl">💨</span>}
    </div>
  );
}

export default function ResultScreen({ mode, robots, result, totalStars, levelWins, onNext, onRetry, onHome }: Props) {
  const level = LEVELS[result.levelIndex];
  const isLast = result.levelIndex === LEVELS.length - 1;
  const isDraw = result.winner === 'draw';
  const playerLost = mode === 1 && result.winner === 1;
  const starsRating = (c: number) => (c >= 9 ? 3 : c >= 7 ? 2 : c >= 5 ? 1 : 0);

  const click = (fn: () => void) => () => {
    sfx.click();
    fn();
  };

  const headline =
    mode === 1
      ? isDraw
        ? ['SERI!', 'KAMU LOLOS!']
        : playerLost
          ? ['YAH...', 'MISI GAGAL!']
          : ['HEBAT!', 'MISI BERHASIL!']
      : isDraw
        ? ['SERI!', 'KALIAN HEBAT!']
        : [`PEMAIN ${(result.winner as number) + 1}`, 'MENANG!'];

  const celebrate = !playerLost;
  const robotState = (side: 0 | 1): 'win' | 'lose' | 'idle' => (isDraw ? 'idle' : result.winner === side ? 'win' : 'lose');

  return (
    <GameFrame>
      {celebrate && <Confetti />}
      <div className="flex flex-1 flex-col items-center px-3 py-3 sm:px-6">
        {/* Headline */}
        <div className="anim-pop flex flex-col items-center">
          <Stars n={mode === 1 ? (playerLost ? 0 : Math.max(1, starsRating(result.correct[0]))) : 3} />
          <div className="panel-blue mt-1 flex flex-col items-center rounded-3xl px-6 py-2 sm:px-12 sm:py-3">
            <span className={cn('font-title text-4xl leading-none sm:text-6xl', celebrate ? 'title-gold' : 'title-red')}>{headline[0]}</span>
            <span className="font-title title-white mt-1 text-xl leading-none sm:text-3xl">{headline[1]}</span>
          </div>
          <Credit className="mt-2" />
        </div>

        {/* Robots + stats */}
        <div className="mt-2 flex w-full max-w-5xl flex-1 items-center justify-center gap-2 sm:gap-6">
          <RobotShow robot={robots[0]} state={robotState(0)} />

          <div className="panel-glass anim-slide-up flex w-full max-w-md flex-col gap-2.5 rounded-3xl p-3 sm:p-5" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between gap-2">
              <span className="panel-blue font-title text-outline rounded-xl px-3 py-1 text-sm text-white sm:text-base">LEVEL {level.id}</span>
              <span className="text-right text-xs font-extrabold text-blue-900 sm:text-sm">{level.subtitle}</span>
            </div>

            {mode === 1 ? (
              <>
                {[0, 1].map((p) => (
                  <div key={p} className="flex items-center gap-2">
                    <span className="w-24 shrink-0 text-xs font-extrabold text-blue-900 sm:w-28 sm:text-sm">
                      {p === 0 ? '🧒 Kamu' : '🤖 Lawan'} {result.correct[p]}/10
                    </span>
                    <div className="h-3.5 flex-1 overflow-hidden rounded-full border-2 border-blue-300 bg-blue-950/20">
                      <div className={cn('hp-bar h-full rounded-full', p === 1 && 'critical')} style={{ width: `${result.correct[p] * 10}%` }} />
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-1.5 text-sm font-extrabold text-blue-900">
                  <span>Bintang level ini: ⭐ {playerLost ? 0 : result.correct[0] * 10}</span>
                  <span className="font-title text-lg text-orange-500">Total ⭐ {totalStars[0]}</span>
                </div>
                <p className="text-center text-xs font-bold text-blue-800 sm:text-sm">
                  {playerLost
                    ? 'Robotmu hancur. Jangan menyerah, coba lagi ya! 💪'
                    : isDraw
                      ? 'Skor kalian sama! Kamu tetap boleh lanjut. 👍'
                      : 'Robotmu berhasil mengalahkan robot lawan! 🎉'}
                </p>
              </>
            ) : (
              <>
                {[0, 1].map((p) => (
                  <div
                    key={p}
                    className={cn('flex items-center gap-2 rounded-2xl border-2 px-3 py-1.5', result.winner === p ? 'border-yellow-400 bg-yellow-100/80' : 'border-white bg-white/70')}
                  >
                    <span className="h-4 w-4 shrink-0 rounded-full border-2 border-white" style={{ background: robots[p].color }} />
                    <span className="flex-1 text-sm font-extrabold text-blue-900">
                      Pemain {p + 1} {result.winner === p && '👑'}
                    </span>
                    <span className="text-xs font-bold text-blue-800">Benar {result.correct[p]}/5</span>
                    <span className="font-title text-base text-orange-500">⭐ {totalStars[p]}</span>
                  </div>
                ))}
                <div className="flex items-center justify-center gap-4 text-xs font-extrabold text-blue-900 sm:text-sm">
                  <span>Menang level — P1: {levelWins[0]}</span>
                  <span>|</span>
                  <span>P2: {levelWins[1]}</span>
                </div>
              </>
            )}

            <div className="mt-1 flex flex-col gap-2">
              {playerLost ? (
                <button onClick={click(onRetry)} className="btn-3d btn-orange rounded-2xl px-6 py-2.5 text-xl sm:text-2xl">
                  ULANGI LEVEL 🔄
                </button>
              ) : (
                <button onClick={click(onNext)} className="btn-3d btn-orange rounded-2xl px-6 py-2.5 text-xl sm:text-2xl">
                  {isLast ? 'LIHAT HASIL 🏆' : 'LANJUT ▶'}
                </button>
              )}
              <button onClick={click(onHome)} className="btn-3d btn-blue rounded-2xl px-6 py-1.5 text-base sm:text-lg" style={{ '--btn-depth': '4px' } as CSSProperties}>
                🏠 MENU UTAMA
              </button>
            </div>
          </div>

          <RobotShow robot={robots[1]} state={robotState(1)} flip />
        </div>

        <div className="mt-2">
          <LevelPills current={result.levelIndex} unlocked={playerLost ? result.levelIndex : result.levelIndex + 1} />
        </div>
      </div>
    </GameFrame>
  );
}
