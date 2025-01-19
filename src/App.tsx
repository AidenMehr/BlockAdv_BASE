import React from 'react';
import { useGameStore } from './store/gameStore';
import MainMenu from './components/MainMenu';
import Game from './components/Game';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { gameMode } = useGameStore();

  return (
    <ErrorBoundary>
      <div className="w-full h-screen">
        {gameMode === null ? <MainMenu /> : <Game />}
      </div>
    </ErrorBoundary>
  );
}

export default App;