
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

export default function SelectRobotScreen({
  mode,
  timeLimit,
  onTimeChange,
  onBack,
  onDone,
}: Props) {
  const [step, setStep] = useState<0 | 1>(0);
  const [picks, setPicks] = useState<(string | null)[]>([null, null]);

  const selected = picks[step];

  // Memilih robot dengan mencegah kedua pemain memakai robot yang sama.
  const choose = (id: string) => {
    if (mode === 2 && step === 1 && picks[0] === id) {
      return;
    }

    sfx.click();

    setPicks((previous) => {
      const nextPicks = [...previous];

      if (step === 0) {
        nextPicks[0] = id;

        // Jika robot P1 berubah menjadi robot yang sebelumnya dipilih P2,
        // pilihan P2 dihapus agar tidak terjadi robot kembar.
        if (nextPicks[1] === id) {
          nextPicks[1] = null;
        }
      } else {
        nextPicks[1] = id;
      }

      return nextPicks;
    });
  };

  const next = () => {
    if (!selected) return;

    sfx.click();

    // Mode dua pemain: P1 memilih terlebih dahulu, kemudian P2.
    if (mode === 2) {
      if (step === 0) {
        setStep(1);
        return;
      }

      const player1 = picks[0];
      const player2 = picks[1];

      // Validasi akhir: kedua pemain harus memilih robot berbeda.
      if (!player1 || !player2 || player1 === player2) {
        return;
      }

      onDone([player1, player2]);
      return;
    }

    // Mode satu pemain: robot lawan dipilih secara acak,
    // tetapi tidak boleh sama dengan robot pemain.
    const player1 = picks[0];

    if (!player1) return;

    const opponents = ROBOTS.filter((robot) => robot.id !== player1);

    if (opponents.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * opponents.length);
    const opponent = opponents[randomIndex].id;

    onDone([player1, opponent]);
  };

  const headerText =
    mode === 1
      ? 'Pilih salah satu robot untuk memulai petualangan!'
      : step === 0
        ? 'Pemain 1, pilih robotmu!'
        : 'Pemain 2, pilih robotmu!';

  return (
    <GameFrame>
      {/* Header */}
      <div className="flex items-start justify-between p-2 sm:p-3">
        <IconButton
          onClick={() => {
            if (step === 1) {
              setStep(0);
            } else {
              onBack();
            }
          }}
          title="Kembali"
        >
          ◀
        </IconButton>

        <div className="anim-pop flex flex-col items-center gap-1">
          <div className="panel-blue rounded-2xl px-5 py-1.5 sm:px-10 sm:py-2">
            <h1 className="font-title text-outline text-2xl text-white sm:text-4xl">
              PILIH ROBOTMU
            </h1>
          </div>
          <Credit />
        </div>

        <div className="w-10 sm:w-11" />
      </div>

      {/* Instruksi pemilihan */}
      <p className="text-outline px-4 text-center text-sm font-extrabold text-white sm:text-lg">
        {mode === 2 && (
          <span
            className={cn(
              'mr-2 inline-block rounded-full border-2 border-white px-2 py-0.5 text-xs',
              step === 0 ? 'bg-orange-500' : 'bg-blue-600',
            )}
          >
            {step === 0 ? 'P1' : 'P2'}
          </span>
        )}
        {headerText}
      </p>

      {/* Kartu robot */}
      <div className="flex flex-1 items-center justify-center px-2 py-2 sm:px-4">
        <div className="grid w-full max-w-5xl grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
          {ROBOTS.map((robot, index) => {
            // Robot hanya dikunci pada giliran P2 jika sudah dipilih P1.
            const taken =
              mode === 2 && step === 1 && picks[0] === robot.id;

            const isSelected = selected === robot.id;

            return (
              <button
                key={robot.id}
                type="button"
                disabled={taken}
                aria-pressed={isSelected}
                aria-label={`${robot.name}${taken ? ', sudah dipilih Pemain 1' : ''}`}
                onClick={() => choose(robot.id)}
                className={cn(
                  'anim-pop group relative flex flex-col items-center overflow-hidden rounded-2xl border-[3px] border-white bg-gradient-to-b p-1.5 pb-0 transition-transform duration-150 sm:p-2 sm:pb-0',
                  robot.gradient,

                  isSelected
                    ? 'scale-105 shadow-[0_0_0_4px_#ffd63a,0_0_30px_8px_rgba(255,214,58,0.7)]'
                    : 'shadow-[0_0_0_3px_rgba(27,87,201,0.8),0_8px_20px_rgba(0,40,120,0.4)]',

                  // Robot terkunci tetap berwarna.
                  // Hanya tampilkan penanda visual dan larang interaksi.
                  taken &&
                    'cursor-not-allowed ring-4 ring-white/80',

                  // Efek hover tidak dijalankan pada robot terkunci.
                  !taken && !isSelected && 'hover:scale-[1.03]',

                  index === 4 && 'col-start-2 sm:col-start-auto',
                )}
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                {/* Ikon status robot */}
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg border-2 border-white/80 text-sm sm:h-8 sm:w-8 sm:text-base',
                    taken ? 'bg-black/60' : 'bg-white/30',
                  )}
                >
                  {taken ? '🔒' : isSelected ? '✅' : '🤖'}
                </div>

                {/* Gambar robot: tidak menggunakan grayscale atau opacity */}
                <div className="select-robot-img relative mt-1 flex w-full items-end justify-center">
                  <div className="absolute bottom-0 left-1/2 h-4 w-[70%] -translate-x-1/2 rounded-[100%] bg-white/70 blur-md" />

                  <img
                    src={robot.img}
                    alt={robot.name}
                    draggable={false}
                    className={cn(
                      'relative h-full w-auto object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.35)]',
                      isSelected && 'anim-float',
                    )}
                  />
                </div>

                {/* Nama robot */}
                <div
                  className="mt-1 w-[110%] rounded-t-xl border-2 border-b-0 border-white/90 px-2 py-1 text-center sm:py-1.5"
                  style={{ background: robot.dark }}
                >
                  <span className="font-title text-outline text-sm text-white sm:text-lg">
                    {robot.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pengaturan waktu per soal */}
      <div className="flex flex-col items-center gap-1.5 px-3">
        <div className="panel-glass flex flex-wrap items-center justify-center gap-1.5 rounded-2xl px-3 py-2 sm:gap-2">
          <span className="mr-1 text-sm font-extrabold text-blue-900 sm:text-base">
            ⏱️ Waktu per soal:
          </span>

          {TIME_OPTIONS.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => {
                sfx.click();
                onTimeChange(time);
              }}
              className={cn(
                'btn-3d rounded-xl px-2.5 py-0.5 text-sm sm:px-3 sm:text-base',
                time === timeLimit
                  ? 'btn-orange scale-110'
                  : 'btn-blue opacity-80',
              )}
              style={{ '--btn-depth': '3px' } as CSSProperties}
            >
              {time} detik
            </button>
          ))}
        </div>

        {mode === 1 && (
          <p className="credit rounded-full px-3 py-1 text-center text-[11px] font-extrabold text-white sm:text-xs">
            🤖 Robot lawan ikut menjawab dalam{' '}
            <span className="text-[#ffe14d]">1–{timeLimit} detik</span> dan bisa
            menembakmu!
          </p>
        )}
      </div>

      {/* Tombol bawah */}
      <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-3">
        <button
          type="button"
          onClick={next}
          disabled={!selected}
          className={cn(
            'btn-3d btn-orange rounded-2xl px-8 py-2.5 text-xl sm:px-10 sm:text-3xl',
            !selected && 'opacity-60',
          )}
        >
          {mode === 2 && step === 0
            ? 'LANJUT ▶'
            : 'MULAI PETUALANGAN 🚀'}
        </button>

        <div className="panel-blue flex items-center gap-2 rounded-2xl px-4 py-1.5 text-center text-xs font-bold text-white sm:text-sm">
          <span className="text-lg">🤖</span>
          Setiap robot memiliki kekuatan yang sama, pilih yang paling kamu suka!
        </div>
      </div>
    </GameFrame>
  );
}
