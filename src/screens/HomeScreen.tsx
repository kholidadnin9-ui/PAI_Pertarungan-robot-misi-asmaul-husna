import { ROBOTS } from '../data/robots';
import { Credit, GameFrame } from '../components/GameFrame';
import { sfx } from '../utils/sound';

interface Props {
  onSelectMode: (mode: 1 | 2) => void;
}

export default function HomeScreen({ onSelectMode }: Props) {
  const pick = (m: 1 | 2) => {
    sfx.click();
    onSelectMode(m);
  };

  return (
    <GameFrame>
      {/* Top badges */}
      <div className="flex items-start justify-between p-2 sm:p-3">
        <div className="badge anim-slide-up flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold sm:text-sm">
          <span>⭐</span> KELAS 2 SD
        </div>
        <div className="badge anim-slide-up flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-center text-[11px] font-extrabold leading-tight sm:text-sm">
          <span>⭐</span>
          <span>
            10 SOAL
            <br className="sm:hidden" /> PER LEVEL
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="anim-pop flex flex-col items-center px-4 text-center">
        <h1 className="font-title title-gold home-title-1 leading-[0.9]">PETUALANGAN</h1>
        <h1 className="font-title title-white home-title-2 -mt-1 leading-[0.95]">ROBOT</h1>
        <div className="panel-blue -mt-1 rounded-2xl px-5 py-1 sm:px-8 sm:py-1.5">
          <p className="font-title text-outline home-sub text-white">MISI ASMAUL HUSNA</p>
        </div>
        <Credit className="mt-2" />
      </div>

      {/* Robots lineup */}
      <div className="mt-1 flex flex-1 items-end justify-center px-2">
        <div className="flex w-full max-w-5xl items-end justify-center">
          {ROBOTS.map((r, i) => (
            <div
              key={r.id}
              className="anim-float relative -mx-2 flex flex-1 justify-center sm:-mx-1"
              style={{ animationDelay: `${i * 0.3}s`, zIndex: i === 2 ? 5 : 3 - Math.abs(i - 2) }}
            >
              <div className="absolute bottom-0 left-1/2 h-5 w-[70%] -translate-x-1/2 rounded-[100%] opacity-60 blur-md" style={{ background: r.color }} />
              <img
                src={r.img}
                alt={r.name}
                draggable={false}
                className="home-robot relative w-auto max-w-[130%] object-contain drop-shadow-[0_10px_14px_rgba(0,30,90,0.5)]"
                style={{ transform: i === 2 ? 'scale(1.12)' : i === 1 || i === 3 ? 'scale(1.04)' : 'none', transformOrigin: 'bottom' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-2.5 px-3 pb-3 pt-3 sm:gap-3">
        <div className="flex w-full max-w-xl flex-row gap-3 sm:gap-5">
          <button onClick={() => pick(1)} className="btn-3d btn-orange home-btn flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2.5 sm:py-3.5">
            <span>👤</span> 1 PEMAIN
          </button>
          <button onClick={() => pick(2)} className="btn-3d btn-blue home-btn flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2.5 sm:py-3.5">
            <span>👥</span> 2 PEMAIN
          </button>
        </div>

        <div className="flex w-full max-w-5xl flex-wrap items-center justify-center gap-2 sm:justify-between">
          <div className="panel-glass rounded-2xl px-3 py-1.5 text-center text-xs font-extrabold text-blue-900 sm:px-4 sm:text-left sm:text-sm">
            Ayo! Kenali Asmaul Husna
            <br />
            Bersama Robot!
          </div>
          <div className="panel-blue flex items-center gap-2 rounded-2xl px-3 py-1.5">
            <span className="font-title text-outline flex items-center gap-1 text-sm text-white sm:text-base">⭐ 5 LEVEL</span>
            <div className="flex gap-1">
              {['#4cc22e', '#2d6cf0', '#ff8a1f', '#8a4ff0', '#ec3f9a'].map((c, i) => (
                <span key={i} className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[10px] font-black text-white sm:h-6 sm:w-6 sm:text-xs" style={{ background: c }}>
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GameFrame>
  );
}
