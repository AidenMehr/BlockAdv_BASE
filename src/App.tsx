import React from 'react';
import { useGameStore } from './store/gameStore';
import MainMenu from './components/MainMenu';
import Game from './components/Game';

function App() {
  const { gameMode } = useGameStore();

  return (
    <div className="w-full h-screen">
      {gameMode === null ? <MainMenu /> : <Game />}
    </div>
  );
}

export default App;