import { useState, type CSSProperties } from 'react';
import { ROBOTS } from '../data/robots';
import { Credit, GameFrame, IconButton } from '../components/GameFrame';
import { cn } from '../utils/cn';
import { sfx } from '../utils/sound';

export const TIME_OPTIONS = [10, 15, 20, 30];

interface Props {
  mode: 1 | 2;
  timeLimit: number;
  onTimeChange: (t: number) => void;
  onBack: () => void;
  onDone: (robots: [string, string]) => void;
}

export default function SelectRobotScreen({ mode, timeLimit, onTimeChange, onBack, onDone }: Props) {
  const [step, setStep] = useState<0 | 1>(0);
  const [picks, setPicks] = useState<(string | null)[]>([null, null]);
  const selected = picks[step];

  const choose = (id: string) => {
    if (step === 1 && picks[0] === id) return;
    sfx.click();
    setPicks((p) => {
      const n = [...p];
      n[step] = id;
      return n;
    });
  };

  const next = () => {
    if (!selected) return;
    sfx.click();
    if (mode === 2 && step === 0) {
      setStep(1);
      return;
    }
    let p2 = picks[1];
    if (mode === 1) {
      const others = ROBOTS.filter((r) => r.id !== picks[0]);
      p2 = others[Math.floor(Math.random() * others.length)].id;
    }
    onDone([picks[0] as string, p2 as string]);
  };

  const headerText = mode === 1 ? 'Pilih salah satu robot untuk memulai petualangan!' : step === 0 ? 'Pemain 1, pilih robotmu!' : 'Pemain 2, pilih robotmu!';

  return (
    <GameFrame>
      <div className="flex items-start justify-between p-2 sm:p-3">
        <IconButton onClick={() => (step === 1 ? setStep(0) : onBack())} title="Kembali">
          ◀
        </IconButton>
        <div className="anim-pop flex flex-col items-center gap-1">
          <div className="panel-blue rounded-2xl px-5 py-1.5 sm:px-10 sm:py-2">
            <h1 className="font-title text-outline text-2xl text-white sm:text-4xl">PILIH ROBOTMU</h1>
          </div>
          <Credit />
        </div>
        <div className="w-10 sm:w-11" />
      </div>

      <p className="text-outline px-4 text-center text-sm font-extrabold text-white sm:text-lg">
        {mode === 2 && (
          <span className={cn('mr-2 inline-block rounded-full border-2 border-white px-2 py-0.5 text-xs', step === 0 ? 'bg-orange-500' : 'bg-blue-600')}>
            {step === 0 ? 'P1' : 'P2'}
          </span>
        )}
        {headerText}
      </p>

      {/* Cards */}
      <div className="flex flex-1 items-center justify-center px-2 py-2 sm:px-4">
        <div className="grid w-full max-w-5xl grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
          {ROBOTS.map((r, i) => {
            const taken = step === 1 && picks[0] === r.id;
            const isSel = selected === r.id;
            return (
              <button
                key={r.id}
                disabled={taken}
                onClick={() => choose(r.id)}
                className={cn(
                  'anim-pop group relative flex flex-col items-center overflow-hidden rounded-2xl border-[3px] border-white bg-gradient-to-b p-1.5 pb-0 transition-transform duration-150 sm:p-2 sm:pb-0',
                  r.gradient,
                  isSel ? 'scale-105 shadow-[0_0_0_4px_#ffd63a,0_0_30px_8px_rgba(255,214,58,0.7)]' : 'shadow-[0_0_0_3px_rgba(27,87,201,0.8),0_8px_20px_rgba(0,40,120,0.4)] hover:scale-[1.03]',
                  taken && 'opacity-40 grayscale',
                  i === 4 && 'col-start-2 sm:col-start-auto',
                )}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-white/80 bg-white/30 text-sm sm:h-8 sm:w-8 sm:text-base">
                  {taken ? '🔒' : isSel ? '✅' : '🤖'}
                </div>
                <div className="select-robot-img relative mt-1 flex w-full items-end justify-center">
                  <div className="absolute bottom-0 left-1/2 h-4 w-[70%] -translate-x-1/2 rounded-[100%] bg-white/70 blur-md" />
                  <img
                    src={r.img}
                    alt={r.name}
                    draggable={false}
                    className={cn('relative h-full w-auto object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.35)]', isSel && 'anim-float')}
                  />
                </div>
                <div className="mt-1 w-[110%] rounded-t-xl border-2 border-b-0 border-white/90 px-2 py-1 text-center sm:py-1.5" style={{ background: r.dark }}>
                  <span className="font-title text-outline text-sm text-white sm:text-lg">{r.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time per question */}
      <div className="flex flex-col items-center gap-1.5 px-3">
        <div className="panel-glass flex flex-wrap items-center justify-center gap-1.5 rounded-2xl px-3 py-2 sm:gap-2">
          <span className="mr-1 text-sm font-extrabold text-blue-900 sm:text-base">⏱️ Waktu per soal:</span>
          {TIME_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => {
                sfx.click();
                onTimeChange(t);
              }}
              className={cn('btn-3d rounded-xl px-2.5 py-0.5 text-sm sm:px-3 sm:text-base', t === timeLimit ? 'btn-orange scale-110' : 'btn-blue opacity-80')}
              style={{ '--btn-depth': '3px' } as CSSProperties}
            >
              {t} detik
            </button>
          ))}
        </div>
        {mode === 1 && (
          <p className="credit rounded-full px-3 py-1 text-center text-[11px] font-extrabold text-white sm:text-xs">
            🤖 Robot lawan ikut menjawab dalam <span className="text-[#ffe14d]">1–{timeLimit} detik</span> dan bisa menembakmu!
          </p>
        )}
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-3">
        <button
          onClick={next}
          disabled={!selected}
          className={cn('btn-3d btn-orange rounded-2xl px-8 py-2.5 text-xl sm:px-10 sm:text-3xl', !selected && 'opacity-60')}
        >
          {mode === 2 && step === 0 ? 'LANJUT ▶' : 'MULAI PETUALANGAN 🚀'}
        </button>
        <div className="panel-blue flex items-center gap-2 rounded-2xl px-4 py-1.5 text-center text-xs font-bold text-white sm:text-sm">
          <span className="text-lg">🤖</span>
          Setiap robot memiliki kekuatan yang sama, pilih yang paling kamu suka!
        </div>
      </div>
    </GameFrame>
  );
}
