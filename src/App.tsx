import type React from 'react';
import { useState } from 'react';
import { findLetter } from './content/letters';
import { findSyllableGroup } from './content/syllables';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { HomeScreen } from './components/screens/HomeScreen';
import { ListenGameScreen } from './components/screens/ListenGameScreen';
import { SyllablesScreen } from './components/screens/SyllablesScreen';
import { TraceScreen } from './components/screens/TraceScreen';
import {
  completionsByLetter,
  getLevel,
  setLevel,
  type Level,
} from './services/progress';
import { unlockAudio } from './services/sounds';
import './styles/app.css';

type ScreenState =
  | { name: 'home' }
  | { name: 'trace'; letterId: string }
  | { name: 'syllables'; groupId: string }
  | { name: 'game'; groupId: string };

async function enterFullscreen(): Promise<void> {
  try {
    if (!document.fullscreenElement)
      await document.documentElement.requestFullscreen();
    // En Android solo se puede bloquear la orientación en pantalla completa.
    const o = screen.orientation as ScreenOrientation & {
      lock?: (o: string) => Promise<void>;
    };
    await o.lock?.('landscape');
  } catch {
    // No disponible (iPhone, escritorio): se ignora.
  }
}

export const App: React.FC = () => {
  const [screenState, setScreenState] = useState<ScreenState>({ name: 'home' });
  const [level, setLevelState] = useState<Level>(() => getLevel());
  const [completions, setCompletions] = useState(() => completionsByLetter());

  const goHome = () => {
    setCompletions(completionsByLetter());
    setScreenState({ name: 'home' });
  };

  const go = (next: ScreenState) => {
    unlockAudio();
    setScreenState(next);
  };

  const renderScreen = () => {
    if (screenState.name === 'trace') {
      const letter = findLetter(screenState.letterId);
      if (letter) {
        return (
          <TraceScreen
            key={letter.id}
            letter={letter}
            level={level}
            onHome={goHome}
            onChangeLetter={(id) => go({ name: 'trace', letterId: id })}
          />
        );
      }
    }
    if (screenState.name === 'syllables' || screenState.name === 'game') {
      const group = findSyllableGroup(screenState.groupId);
      if (group && screenState.name === 'syllables') {
        return (
          <SyllablesScreen
            group={group}
            onHome={goHome}
            onPlayGame={() => go({ name: 'game', groupId: group.id })}
          />
        );
      }
      if (group) {
        return (
          <ListenGameScreen
            group={group}
            onHome={goHome}
            onBack={() => go({ name: 'syllables', groupId: group.id })}
          />
        );
      }
    }
    return (
      <HomeScreen
        level={level}
        completions={completions}
        onSelectLetter={(id) => go({ name: 'trace', letterId: id })}
        onSelectSyllables={(id) => go({ name: 'syllables', groupId: id })}
        onPlayGame={(id) => go({ name: 'game', groupId: id })}
        onChangeLevel={(lv) => {
          setLevel(lv);
          setLevelState(lv);
        }}
        onFullscreen={() => {
          unlockAudio();
          void enterFullscreen();
        }}
      />
    );
  };

  return (
    <ErrorBoundary>
      <main className="app">{renderScreen()}</main>
    </ErrorBoundary>
  );
};

export default App;
