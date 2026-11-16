import type React from 'react';
import { useState } from 'react';
import { findLetter } from './content/letters';
import { findModule, moduleOfLetter, type GameKind } from './content/modules';
import { findSyllableGroup } from './content/syllables';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { ChoiceGameScreen } from './components/screens/ChoiceGameScreen';
import { ConsonantScreen } from './components/screens/ConsonantScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { ParentScreen } from './components/screens/ParentScreen';
import { SyllablesScreen } from './components/screens/SyllablesScreen';
import { TraceScreen } from './components/screens/TraceScreen';
import {
  completionsByLetter,
  getLevel,
  setLevel,
  type Level,
} from './services/progress';
import { firstLetterGame, rPairsGame, syllableGame } from './games/catalog';
import { unlockAudio } from './services/sounds';
import './styles/app.css';

type ScreenState =
  | { name: 'home' }
  | { name: 'trace'; letterId: string }
  | { name: 'module'; moduleId: string }
  | { name: 'parents' }
  | { name: 'syllables'; groupId: string }
  | { name: 'game'; moduleId: string | null; kind: GameKind };

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

  const goModule = (moduleId: string) => {
    setCompletions(completionsByLetter());
    go({ name: 'module', moduleId });
  };

  const renderScreen = () => {
    if (screenState.name === 'trace') {
      const letter = findLetter(screenState.letterId);
      const mod = moduleOfLetter(screenState.letterId);
      if (letter) {
        return (
          <TraceScreen
            key={letter.id}
            letter={letter}
            level={level}
            onHome={mod ? () => goModule(mod.id) : goHome}
            exitIcon={mod ? '⬅️' : '🏠'}
            exitLabel={mod ? 'Regresar' : 'Inicio'}
            onChangeLetter={(id) => go({ name: 'trace', letterId: id })}
          />
        );
      }
    }
    if (screenState.name === 'module') {
      const mod = findModule(screenState.moduleId);
      if (mod) {
        return (
          <ConsonantScreen
            module={mod}
            completions={completions}
            onHome={goHome}
            onTrace={(id) => go({ name: 'trace', letterId: id })}
            onSyllables={(id) => go({ name: 'syllables', groupId: id })}
            onGame={(kind) => go({ name: 'game', moduleId: mod.id, kind })}
          />
        );
      }
    }
    if (screenState.name === 'syllables') {
      const group = findSyllableGroup(screenState.groupId);
      if (group) {
        return (
          <SyllablesScreen
            group={group}
            onExit={() => goModule(group.id)}
            onPlayGame={() =>
              go({ name: 'game', moduleId: group.id, kind: 'syllables' })
            }
          />
        );
      }
    }
    if (screenState.name === 'game') {
      const { moduleId, kind } = screenState;
      const group = moduleId ? findSyllableGroup(moduleId) : undefined;
      const def =
        kind === 'first-letter'
          ? firstLetterGame()
          : kind === 'r-pairs'
            ? rPairsGame()
            : group
              ? syllableGame(group)
              : null;
      if (def) {
        return (
          <ChoiceGameScreen
            key={`${moduleId ?? 'inicio'}-${kind}`}
            activityId={def.id}
            intro={def.intro}
            showEmoji={def.showEmoji}
            showTargetEmoji={def.showTargetEmoji}
            makeRounds={def.makeRounds}
            onExit={moduleId ? () => goModule(moduleId) : goHome}
            exitIcon={moduleId ? '⬅️' : '🏠'}
            exitLabel={moduleId ? 'Regresar' : 'Inicio'}
          />
        );
      }
    }
    if (screenState.name === 'parents') {
      return (
        <ParentScreen
          level={level}
          onChangeLevel={(lv) => {
            setLevel(lv);
            setLevelState(lv);
          }}
          onExit={goHome}
        />
      );
    }
    return (
      <HomeScreen
        completions={completions}
        onSelectLetter={(id) => go({ name: 'trace', letterId: id })}
        onSelectModule={(id) => go({ name: 'module', moduleId: id })}
        onFirstLetterGame={() =>
          go({ name: 'game', moduleId: null, kind: 'first-letter' })
        }
        onOpenParents={() => go({ name: 'parents' })}
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
