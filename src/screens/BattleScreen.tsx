import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LEVELS, type Question } from '../data/questions';
import type { Robot } from '../data/robots';
import { Credit, GameFrame, IconButton } from '../components/GameFrame';
import RobotFighter, { type FighterState } from '../components/RobotFighter';
import { LaserBeam, type Shot } from '../components/Effects';
import { cn } from '../utils/cn';
import { sfx } from '../utils/sound';

export interface LevelResult {
  levelIndex: number;
  correct: [number, number];
  hp: [number, number];
  maxHp: number;
  winner: 0 | 1 | 'draw';
}

interface Props {
  mode: 1 | 2;
  robots: [Robot, Robot];
  levelIndex: number;
  /** seconds per question */
  timeLimit: number;
  carriedStars: [number, number];
  onFinish: (r: LevelResult) => void;
  onHome: () => void;
}

type Pair<T> = [T, T];
type Side = 0 | 1;
type Phase = 'intro' | 'play' | 'finish';
type Action = { actor: Side; kind: 'correct' | 'wrong' | 'timeout' };
interface Msg {
  text: string;
  tone: 'good' | 'bad';
  id: number;
}

const OPTION_STYLES = ['btn-green', 'btn-blue', 'btn-purple'];
const LETTERS = ['A', 'B', 'C'];
/** Opponent robot (1-player mode): chance to answer correctly & thinking speed per level */
const CPU_ACCURACY = [0.55, 0.6, 0.65, 0.7, 0.75];
const CPU_SPEED = [1, 0.9, 0.82, 0.74, 0.66];
const ACTION_MS = 1750;
const INTRO_MS = 2400;

const other = (s: Side): Side => (s === 0 ? 1 : 0);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Bubble({ tone, children }: { tone: 'think' | 'turn' | 'done'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-white px-2 py-0.5 text-[10px] font-extrabold text-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] sm:text-xs',
        tone === 'think' ? 'bg-violet-600' : tone === 'turn' ? 'bg-orange-500' : 'bg-green-600',
      )}
    >
      {children}
    </span>
  );
}

function ThinkDots() {
  return (
    <span className="inline-flex">
      <span className="think-dot">.</span>
      <span className="think-dot">.</span>
      <span className="think-dot">.</span>
    </span>
  );
}

export default function BattleScreen({ mode, robots, levelIndex, timeLimit, carriedStars, onFinish, onHome }: Props) {
  const level = LEVELS[levelIndex];
  const questions = useMemo<Question[]>(() => shuffle(level.questions), [level]);
  // In both modes, the first correct answer wins each question.
  const maxHp = mode === 1 ? 20 : 10;

  /* ---------- render state ---------- */
  const [phase, setPhase] = useState<Phase>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [hp, setHp] = useState<Pair<number>>([maxHp, maxHp]);
  const [correct, setCorrect] = useState<Pair<number>>([0, 0]);
  const [fstate, setFstate] = useState<Pair<FighterState>>(['idle', 'idle']);
  const [shot, setShot] = useState<Shot | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [playerChoices, setPlayerChoices] = useState<Pair<number | null>>([null, null]);
  const [cpuChoice, setCpuChoice] = useState<number | null>(null);
  const [cpuDone, setCpuDone] = useState(false);
  const [winnerSide, setWinnerSide] = useState<Side | null>(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  /* ---------- mutable game state (safe inside timers) ---------- */
  const arenaRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<Pair<HTMLDivElement | null>>([null, null]);
  const timers = useRef<number[]>([]);
  const g = useRef({
    hp: [maxHp, maxHp] as Pair<number>,
    correct: [0, 0] as Pair<number>,
    q: 0,
    queue: [] as Action[],
    busy: false,
    roundActive: false,
    advancing: false,
    winnerLocked: false,
    winner: null as Side | null,
    roundResolved: false,
    cpuDone: false,
    timerOn: false,
    deadline: 0,
    lastTick: -1,
    cpuTimer: 0,
    cpuDue: 0,
    ended: false,
    msgId: 0,
  });

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };

  const label = (i: Side) => (mode === 1 ? (i === 0 ? 'KAMU' : 'LAWAN') : `PEMAIN ${i + 1}`);

  const setF = (i: Side, st: FighterState) =>
    setFstate((p) => {
      const n = [...p] as Pair<FighterState>;
      n[i] = st;
      return n;
    });

  const showMsg = (text: string, tone: Msg['tone']) => setMsg({ text, tone, id: ++g.current.msgId });

  const damage = (i: Side) => {
    const s = g.current;
    s.hp[i] = Math.max(0, s.hp[i] - 1);
    setHp([...s.hp] as Pair<number>);
  };

  /** Laser coordinates: attacker's gun muzzle → defender's chest (relative to the arena) */
  const measureShot = (atk: Side, big: boolean): Shot | null => {
    const def = other(atk);
    const arena = arenaRef.current?.getBoundingClientRect();
    const a = boxRefs.current[atk]?.getBoundingClientRect();
    const d = boxRefs.current[def]?.getBoundingClientRect();
    if (!arena || !a || !d || !a.width || !d.width) return null;
    const ra = robots[atk];
    const rd = robots[def];
    // robot on the right side is mirrored
    const x1 = atk === 0 ? a.left + ra.muzzle.x * a.width : a.right - ra.muzzle.x * a.width;
    const y1 = a.top + ra.muzzle.y * a.height;
    const x2 = def === 0 ? d.left + rd.hit.x * d.width : d.right - rd.hit.x * d.width;
    const y2 = d.top + rd.hit.y * d.height;
    return { x1: x1 - arena.left, y1: y1 - arena.top, x2: x2 - arena.left, y2: y2 - arena.top, color: ra.laser, big, id: Date.now() };
  };

  const roundDone = () => g.current.roundResolved;

  /* ---------- action queue: animations play one after another ---------- */
  const runNext = () => {
    const s = g.current;
    if (s.busy || s.ended) return;
    const a = s.queue.shift();
    if (!a) {
      if (roundDone() && !s.advancing) {
        s.advancing = true;
        s.roundActive = false;
        later(nextQuestion, 450);
      }
      return;
    }
    s.busy = true;
    const atk = a.actor;
    const def = other(atk);

    if (a.kind === 'correct') {
      s.correct[atk] += 1;
      setCorrect([...s.correct] as Pair<number>);
      const sh = measureShot(atk, false);
      if (sh) setShot(sh);
      setF(atk, 'shoot');
      sfx.laser();
      const goodForPlayer = mode === 2 || atk === 0;
      showMsg(mode === 1 ? (atk === 0 ? 'BENAR! +10 ⭐' : 'LAWAN BENAR! 🔫') : `${label(atk)} BENAR! 🔫`, goodForPlayer ? 'good' : 'bad');
      later(() => {
        sfx.explosion();
        setF(def, 'hit');
        damage(def);
        setFlash('#ffd27a');
      }, 280);
      later(() => setFlash(null), 700);
      later(() => setShot(null), 760);
    } else {
      sfx.zap();
      setF(atk, 'zapped');
      damage(atk);
      setFlash('#bfefff');
      later(() => setFlash(null), 450);
      const goodForPlayer = mode === 1 && atk === 1;
      const text =
        a.kind === 'timeout'
          ? mode === 1
            ? 'WAKTU HABIS! ⏰'
            : `WAKTU ${label(atk)} HABIS! ⏰`
          : mode === 1
            ? atk === 0
              ? 'SALAH! ⚡ KESETRUM!'
              : 'LAWAN SALAH! ⚡'
            : `${label(atk)} SALAH! ⚡`;
      showMsg(text, goodForPlayer ? 'good' : 'bad');
    }

    later(() => {
      setFstate(['idle', 'idle']);
      setMsg(null);
      s.busy = false;
      runNext();
    }, ACTION_MS);
  };

  const enqueue = (a: Action) => {
    g.current.queue.push(a);
    runNext();
  };

  /* ---------- opponent robot (1-player) ---------- */
  const cpuAnswer = () => {
    const s = g.current;
    if (!s.roundActive || s.cpuDone || s.winnerLocked || s.ended) return;
    s.cpuDone = true;
    setCpuDone(true);
    const q = questions[s.q];
    const ok = Math.random() < CPU_ACCURACY[levelIndex];
    const wrongs = [0, 1, 2].filter((x) => x !== q.answer);
    const choice = ok ? q.answer : wrongs[Math.floor(Math.random() * wrongs.length)];
    setCpuChoice(choice);
    if (ok) {
      s.winnerLocked = true;
      s.winner = 1;
      s.roundResolved = true;
      s.roundActive = false;
      s.timerOn = false;
      setAnswerLocked(true);
      setWinnerSide(1);
    }
    enqueue({ actor: 1, kind: ok ? 'correct' : 'wrong' });
    if (!ok && s.deadline <= Date.now()) {
      s.roundResolved = true;
      s.roundActive = false;
      s.timerOn = false;
    }
  };

  const startRound = () => {
    const s = g.current;
    if (s.ended) return;
    s.queue = [];
    s.cpuDone = false;
    s.winnerLocked = false;
    s.winner = null;
    s.roundResolved = false;
    s.advancing = false;
    s.roundActive = true;
    s.lastTick = -1;
    setCpuDone(false);
    setPlayerChoices([null, null]);
    setCpuChoice(null);
    setWinnerSide(null);
    setAnswerLocked(false);
    s.deadline = Date.now() + timeLimit * 1000;
    s.timerOn = true;
    setTimeLeft(timeLimit);
    if (mode === 1) {
      // opponent answers at a random moment between 1 s and the time limit (faster on higher levels)
      const span = Math.max(0.5, timeLimit - 1.5) * CPU_SPEED[levelIndex];
      const delay = Math.round((1 + Math.random() * span) * 1000);
      s.cpuDue = Date.now() + delay;
      s.cpuTimer = later(cpuAnswer, delay);
    }
  };

  const nextQuestion = () => {
    const s = g.current;
    if (s.ended) return;
    if (s.q + 1 < questions.length) {
      s.q += 1;
      setQIndex(s.q);
      // Both human players race on the same question in 2-player mode.
      startRound();
    } else {
      finish();
    }
  };

  /* ---------- end of level: only after all 10 questions ---------- */
  const finish = () => {
    const s = g.current;
    s.timerOn = false;
    s.roundActive = false;
    setPhase('finish');
    const [h0, h1] = s.hp;
    const winner: 0 | 1 | 'draw' = h0 > h1 ? 0 : h1 > h0 ? 1 : 'draw';
    const result: LevelResult = { levelIndex, correct: [...s.correct] as Pair<number>, hp: [h0, h1], maxHp, winner };

    if (winner === 'draw') {
      setFstate(['victory', 'victory']);
      showMsg(mode === 1 ? 'SERI! KAMU LOLOS!' : 'SERI! KEDUANYA HEBAT!', 'good');
      sfx.win();
      later(() => onFinish(result), 2800);
      return;
    }

    const loser = other(winner);
    showMsg('SERANGAN PAMUNGKAS! 💥', mode === 1 && winner === 1 ? 'bad' : 'good');
    later(() => {
      const sh = measureShot(winner, true);
      if (sh) setShot(sh);
      setF(winner, 'shoot');
      sfx.laser();
    }, 800);
    later(() => {
      sfx.explosion(true);
      setMsg(null);
      setF(loser, 'destroyed'); // big explosion → charred → smoke → fades away
      s.hp[loser] = 0;
      setHp([...s.hp] as Pair<number>);
      setFlash('#fff1c0');
      setShake(true);
    }, 1200);
    later(() => setFlash(null), 1900);
    later(() => setShot(null), 2000);
    later(() => setShake(false), 2100);
    later(() => {
      setF(winner, 'victory');
      const playerLost = mode === 1 && winner === 1;
      if (playerLost) sfx.lose();
      else sfx.win();
      showMsg(mode === 1 ? (winner === 0 ? 'MISI BERHASIL!' : 'ROBOTMU KALAH!') : `PEMAIN ${winner + 1} MENANG!`, playerLost ? 'bad' : 'good');
    }, 3100);
    later(() => onFinish(result), 6600);
  };

  /* ---------- countdown timer ---------- */
  const tick = () => {
    const s = g.current;
    if (!s.timerOn || s.ended) return;
    const left = Math.max(0, (s.deadline - Date.now()) / 1000);
    setTimeLeft(left);
    const whole = Math.ceil(left);
    if (whole > 0 && whole <= 5 && whole !== s.lastTick) {
      s.lastTick = whole;
      sfx.tick();
    }
    if (left <= 0) {
      s.timerOn = false;
      if (mode === 1 && !s.cpuDone && !s.winnerLocked) {
        clearTimeout(s.cpuTimer);
        cpuAnswer();
      }
      // If neither side answered correctly before time expired, resolve the question.
      if (!s.winnerLocked) {
        s.roundResolved = true;
        s.roundActive = false;
        setAnswerLocked(true);
        enqueue({ actor: 0, kind: 'timeout' });
        if (mode === 2) enqueue({ actor: 1, kind: 'timeout' });
      }
    }
  };

  useEffect(() => {
    const s = g.current;
    s.ended = false;
    const list = timers.current;
    const start = window.setTimeout(() => {
      setPhase('play');
      startRound();
    }, INTRO_MS);
    const iv = window.setInterval(tick, 100);
    return () => {
      s.ended = true;
      clearTimeout(start);
      clearInterval(iv);
      list.forEach((id) => clearTimeout(id));
      list.length = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- first-correct-answer wins ---------- */
  const answer = (side: Side, optionIndex: number) => {
    const s = g.current;

    // Ref-based lock is synchronous: rapid/double clicks cannot claim the same question.
    if (!s.roundActive || s.winnerLocked || s.roundResolved || s.ended || !s.timerOn) return;

    const question = questions[s.q];
    setPlayerChoices((prev) => {
      const next = [...prev] as Pair<number | null>;
      next[side] = optionIndex;
      return next;
    });

    if (optionIndex !== question.answer) {
      // A wrong attempt does not lock the question; the same player can try again.
      enqueue({ actor: side, kind: 'wrong' });
      return;
    }

    s.winnerLocked = true;
    s.winner = side;
    s.roundResolved = true;
    s.roundActive = false;
    s.timerOn = false;
    s.cpuDone = true;
    clearTimeout(s.cpuTimer);

    setWinnerSide(side);
    setAnswerLocked(true);
    setCpuDone(true);
    enqueue({ actor: side, kind: 'correct' });
  };

  /* ---------- derived UI values ---------- */
  const q = questions[qIndex];
  const revealed = answerLocked;
  const roundComplete = answerLocked;
  const progress = phase === 'finish' ? 100 : ((qIndex + (roundComplete ? 1 : 0)) / questions.length) * 100;
  const stars: Pair<number> = [carriedStars[0] + correct[0] * 10, carriedStars[1] + correct[1] * 10];
  const labels = mode === 1 ? ['PEMAIN', 'LAWAN'] : ['PEMAIN 1', 'PEMAIN 2'];
  const secs = Math.ceil(timeLeft);
  const frac = Math.max(0, Math.min(1, timeLeft / timeLimit));
  const urgent = secs <= 5 && !answerLocked && phase === 'play';
  const timerColor = secs <= 5 ? 'bg-red-500' : secs <= 10 ? 'bg-orange-500' : 'bg-green-500';
  const playing = phase === 'play';

  const statusFor = (side: Side): ReactNode => {
    if (!playing) return null;
    if (mode === 1) {
      if (side === 0) return answerLocked && winnerSide === 0 ? <Bubble tone="done">🏆 Menang cepat!</Bubble> : <Bubble tone="turn">🎯 Ayo jawab!</Bubble>;
      return cpuDone ? (
        <Bubble tone="done">✔ Sudah jawab</Bubble>
      ) : (
        <Bubble tone="think">
          🤔 Berpikir
          <ThinkDots />
        </Bubble>
      );
    }
    return answerLocked && winnerSide === side ? <Bubble tone="done">🏆 Menang cepat!</Bubble> : <Bubble tone="turn">⚡ Jawab cepat!</Bubble>;
  };
  const activeFor = (side: Side) => playing && !answerLocked && (mode === 1 ? side === 0 || !cpuDone : true);

  return (
    <GameFrame fit>
      {flash && <div className="anim-flash pointer-events-none fixed inset-0 z-50" style={{ background: flash }} />}

      <div className={cn('flex h-full min-h-0 flex-col', shake && 'anim-shake')}>
        {/* ---------- HUD ---------- */}
        <div className="flex shrink-0 items-center gap-1.5 px-2 pb-1 pt-2 sm:gap-3 sm:px-4 short:pt-1">
          <IconButton
            onClick={() => {
              sfx.click();
              onHome();
            }}
            title="Menu"
          >
            🏠
          </IconButton>
          <div className="panel-blue shrink-0 rounded-xl px-2.5 py-1 sm:px-4 sm:py-1.5">
            <span className="font-title text-outline whitespace-nowrap text-sm text-white sm:text-xl">LEVEL {level.id}</span>
          </div>
          <div className="panel-blue flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2.5 py-1 sm:gap-3 sm:px-4 sm:py-1.5">
            <span className="font-title text-outline whitespace-nowrap text-xs text-white sm:text-base">
              SOAL {qIndex + 1}/{questions.length}
            </span>
            <div className="h-3 min-w-[24px] flex-1 overflow-hidden rounded-full border-2 border-white/80 bg-blue-950/60 sm:h-4">
              <div className="hp-bar h-full rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="panel-blue flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1 sm:gap-2 sm:px-4 sm:py-1.5">
            <span className="text-sm sm:text-xl">⭐</span>
            {mode === 1 ? (
              <span className="font-title text-outline text-sm text-white sm:text-xl">{stars[0]}</span>
            ) : (
              <span className="font-title text-outline whitespace-nowrap text-xs text-white sm:text-base">
                P1 {stars[0]} <span className="opacity-60">|</span> P2 {stars[1]}
              </span>
            )}
          </div>
        </div>

        {/* ---------- Arena (fills remaining height) ---------- */}
        <div ref={arenaRef} className="relative mx-auto flex min-h-[110px] w-full max-w-6xl flex-1 items-stretch justify-between px-2 pt-1 sm:px-6">
          <RobotFighter
            robot={robots[0]}
            side="left"
            label={labels[0]}
            hp={hp[0]}
            maxHp={maxHp}
            state={fstate[0]}
            active={activeFor(0)}
            status={statusFor(0)}
            boxRef={(el) => {
              boxRefs.current[0] = el;
            }}
          />

          <div className="pointer-events-none absolute inset-x-0 top-[14%] z-40 flex justify-center px-2">
            {msg ? (
              <div key={msg.id} className="anim-pop max-w-[80%] text-center">
                <span className={cn('font-title q-msg leading-tight', msg.tone === 'good' ? 'title-gold' : 'title-red')}>{msg.text}</span>
              </div>
            ) : playing ? (
              <span className="font-title title-white text-3xl sm:text-5xl">VS</span>
            ) : null}
          </div>

          {shot && <LaserBeam key={shot.id} shot={shot} />}

          <RobotFighter
            robot={robots[1]}
            side="right"
            label={labels[1]}
            hp={hp[1]}
            maxHp={maxHp}
            state={fstate[1]}
            active={activeFor(1)}
            status={statusFor(1)}
            boxRef={(el) => {
              boxRefs.current[1] = el;
            }}
          />
        </div>

        {/* ---------- Question card (compact, scales with screen height) ---------- */}
        <div className="shrink-0 px-2 pt-1 sm:px-4">
          <div key={qIndex} className="panel-glass q-card anim-slide-up mx-auto w-full max-w-3xl rounded-2xl sm:rounded-3xl">
            <div className="mb-[0.8vh] flex items-center gap-2">
              {mode === 2 ? (
                <span
                  className="text-outline shrink-0 whitespace-nowrap rounded-full border-2 border-white px-2.5 py-0.5 text-[10px] font-extrabold text-white sm:text-xs"
                  style={{ background: robots[0].color }}
                >
                  PEMAIN 1 VS PEMAIN 2
                </span>
              ) : (
                <span className="shrink-0 whitespace-nowrap text-[10px] font-extrabold text-blue-900 sm:text-xs">🤖 Lawan ikut menjawab!</span>
              )}
              <div className="h-2.5 min-w-[40px] flex-1 overflow-hidden rounded-full border border-blue-200 bg-blue-950/15 sm:h-3">
                <div className={cn('h-full rounded-full', timerColor)} style={{ width: `${frac * 100}%`, transition: 'width 0.1s linear' }} />
              </div>
              <span
                className={cn(
                  'font-title flex shrink-0 items-center gap-1 rounded-full border-2 border-white px-2 py-0.5 text-sm text-white shadow sm:text-base',
                  timerColor,
                  urgent && 'anim-timer',
                )}
              >
                ⏱️ {secs}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="q-icon flex shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-b from-sky-300 to-blue-600 shadow-md">🕌</div>
              <h2 className="q-text flex-1 font-extrabold text-blue-950">{q.q}</h2>
            </div>

            {mode === 1 ? (
              <div className="q-gap mt-[1vh] grid grid-cols-1 short:grid-cols-3">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.answer;
                  const isSel = playerChoices[0] === i;
                  const cpuPicked = revealed && cpuDone && cpuChoice === i;
                  return (
                    <button key={i} disabled={!playing || answerLocked} onClick={() => answer(0, i)}
                      className={cn('q-opt btn-3d relative flex w-full items-center gap-2 rounded-xl px-2.5 text-left sm:gap-3 sm:rounded-2xl sm:px-4',
                        revealed && isSel && !isCorrect ? 'btn-red anim-shake' : OPTION_STYLES[i],
                        revealed && isCorrect && 'anim-pulse-glow', revealed && !isCorrect && !isSel && 'opacity-55')}>
                      <span className="q-letter flex shrink-0 items-center justify-center rounded-full border-2 border-white/90 bg-white font-black text-blue-900">
                        {revealed && isCorrect ? '✓' : revealed && isSel ? '✗' : LETTERS[i]}
                      </span>
                      <span className="font-title text-outline leading-tight">{opt}</span>
                      {cpuPicked && <span className="absolute -top-2 right-2 rounded-full border-2 border-white bg-violet-600 px-1.5 text-[10px] font-extrabold leading-4 text-white shadow sm:text-xs">🤖 LAWAN</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="q-gap mt-[1vh] grid grid-cols-2 gap-2">
                {([0, 1] as Side[]).map((side) => (
                  <div key={side} className="min-w-0 rounded-xl border-2 border-white/70 bg-white/35 p-2">
                    <div className="mb-1 text-center text-xs font-extrabold text-blue-950">PEMAIN {side + 1}{winnerSide === side ? ' 🏆 TERCEPAT!' : ''}</div>
                    <div className="grid grid-cols-1 gap-1">
                      {q.options.map((opt, i) => {
                        const isCorrect = i === q.answer;
                        const isSel = playerChoices[side] === i;
                        return (
                          <button key={i} disabled={!playing || answerLocked} onClick={() => answer(side, i)}
                            className={cn('q-opt btn-3d relative flex w-full items-center gap-2 rounded-xl px-2 text-left sm:gap-2 sm:px-2',
                              revealed && isSel && !isCorrect ? 'btn-red anim-shake' : OPTION_STYLES[i],
                              revealed && isCorrect && 'anim-pulse-glow', revealed && !isCorrect && !isSel && 'opacity-55')}>
                            <span className="q-letter flex shrink-0 items-center justify-center rounded-full border-2 border-white/90 bg-white font-black text-blue-900">{revealed && isCorrect ? '✓' : revealed && isSel ? '✗' : LETTERS[i]}</span>
                            <span className="font-title text-outline leading-tight">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-center px-2 py-1.5 short:py-1">
          <Credit />
        </div>
      </div>

      {/* ---------- Level intro ---------- */}
      {phase === 'intro' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 px-4 backdrop-blur-sm">
          <div className="anim-pop flex flex-col items-center gap-2 text-center">
            <span className="font-title title-gold text-6xl sm:text-8xl">LEVEL {level.id}</span>
            <span className="font-title title-white text-2xl sm:text-4xl">{level.subtitle}</span>
            <div className="panel-blue mt-2 rounded-2xl px-5 py-2">
              <span className="font-title text-outline text-lg text-white sm:text-2xl">
                ROBOT {robots[0].name} vs ROBOT {robots[1].name}
              </span>
            </div>
            <div className="credit mt-1 rounded-full px-4 py-1.5 text-xs font-extrabold text-white sm:text-sm">
              ⏱️ {timeLimit} detik per soal · {mode === 1 ? 'Robot lawan juga ikut menjawab!' : 'Siapa paling cepat menjawab benar!'}
            </div>
          </div>
        </div>
      )}
    </GameFrame>
  );
}
