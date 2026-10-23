import { useState } from 'react';
import { getRobot, type Robot } from './data/robots';
import { LEVELS } from './data/questions';
import HomeScreen from './screens/HomeScreen';
import SelectRobotScreen from './screens/SelectRobotScreen';
import BattleScreen, { type LevelResult } from './screens/BattleScreen';
import ResultScreen from './screens/ResultScreen';
import FinalScreen from './screens/FinalScreen';

type Screen = 'home' | 'select' | 'battle' | 'result' | 'final';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [mode, setMode] = useState<1 | 2>(1);
  const [robots, setRobots] = useState<[Robot, Robot]>([getRobot('pink'), getRobot('blue')]);
  const [levelIndex, setLevelIndex] = useState(0);
  const [totalStars, setTotalStars] = useState<[number, number]>([0, 0]);
  const [levelWins, setLevelWins] = useState<[number, number]>([0, 0]);
  const [lastResult, setLastResult] = useState<LevelResult | null>(null);
  const [battleKey, setBattleKey] = useState(0);
  const [timeLimit, setTimeLimit] = useState(30);

  const resetProgress = () => {
    setLevelIndex(0);
    setTotalStars([0, 0]);
    setLevelWins([0, 0]);
    setLastResult(null);
  };

  const goHome = () => {
    resetProgress();
    setScreen('home');
  };

  const startBattle = () => {
    setBattleKey((k) => k + 1);
    setScreen('battle');
  };

  const handleFinish = (r: LevelResult) => {
    setLastResult(r);
    const playerLost = mode === 1 && r.winner === 1;
    if (!playerLost) {
      setTotalStars((s) => [s[0] + r.correct[0] * 10, s[1] + r.correct[1] * 10]);
    }
    if (r.winner !== 'draw') {
      setLevelWins((w) => {
        const n: [number, number] = [...w] as [number, number];
        n[r.winner as 0 | 1] += 1;
        return n;
      });
    }
    setScreen('result');
  };

  const handleNext = () => {
    if (levelIndex + 1 >= LEVELS.length) {
      setScreen('final');
      return;
    }
    setLevelIndex((i) => i + 1);
    startBattle();
  };

  const handleRetry = () => {
    // retry same level (stars from this failed level were not added)
    if (lastResult && lastResult.winner !== 'draw') {
      setLevelWins((w) => {
        const n: [number, number] = [...w] as [number, number];
        n[lastResult.winner as 0 | 1] = Math.max(0, n[lastResult.winner as 0 | 1] - 1);
        return n;
      });
    }
    startBattle();
  };

  switch (screen) {
    case 'home':
      return (
        <HomeScreen
          onSelectMode={(m) => {
            setMode(m);
            resetProgress();
            setScreen('select');
          }}
        />
      );
    case 'select':
      return (
        <SelectRobotScreen
          mode={mode}
          timeLimit={timeLimit}
          onTimeChange={setTimeLimit}
          onBack={() => setScreen('home')}
          onDone={(ids) => {
            setRobots([getRobot(ids[0]), getRobot(ids[1])]);
            resetProgress();
            startBattle();
          }}
        />
      );
    case 'battle':
      return (
        <BattleScreen
          key={battleKey}
          mode={mode}
          robots={robots}
          levelIndex={levelIndex}
          timeLimit={timeLimit}
          carriedStars={totalStars}
          onFinish={handleFinish}
          onHome={goHome}
        />
      );
    case 'result':
      return lastResult ? (
        <ResultScreen
          mode={mode}
          robots={robots}
          result={lastResult}
          totalStars={totalStars}
          levelWins={levelWins}
          onNext={handleNext}
          onRetry={handleRetry}
          onHome={goHome}
        />
      ) : null;
    case 'final':
      return (
        <FinalScreen
          mode={mode}
          robots={robots}
          totalStars={totalStars}
          levelWins={levelWins}
          onHome={goHome}
          onReplay={() => {
            resetProgress();
            setScreen('select');
          }}
        />
      );
  }
}
