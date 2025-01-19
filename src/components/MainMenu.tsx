import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Notebook, User, Users, Gamepad2 } from 'lucide-react';

const MainMenu: React.FC = () => {
  const { setGameMode, setPlayerCharacter, playerCharacter } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl transform hover:scale-105 transition-transform">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="w-16 h-16 text-purple-600 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 animate-pulse">Block Adventure</h1>
          <p className="text-gray-600">Created by Aiden</p>
          <p className="text-sm text-gray-500">Viola Desmond School, Maple Ontario</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setGameMode('single')}
              className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl flex flex-col items-center gap-2 transform hover:scale-105 transition-all shadow-lg"
            >
              <User className="w-8 h-8" />
              <span>Single Player</span>
            </button>
            <button
              onClick={() => setGameMode('multi')}
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl flex flex-col items-center gap-2 transform hover:scale-105 transition-all shadow-lg"
            >
              <Users className="w-8 h-8" />
              <span>Multiplayer</span>
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded-xl shadow-inner">
            <h2 className="text-xl font-semibold mb-4 text-center">Choose Your Character</h2>
            <div className="grid grid-cols-3 gap-4">
              {['steve', 'alex', 'robot'].map((char) => (
                <button
                  key={char}
                  onClick={() => setPlayerCharacter(char as any)}
                  className={`${
                    playerCharacter === char ? 'ring-2 ring-purple-500 bg-purple-50' : 'bg-white'
                  } hover:bg-gray-50 p-3 rounded-lg flex flex-col items-center gap-2 transform hover:scale-105 transition-all shadow-md`}
                >
                  {char === 'robot' ? (
                    <Notebook className="w-8 h-8 text-purple-500" />
                  ) : (
                    <User className={`w-8 h-8 ${char === 'steve' ? 'text-blue-500' : 'text-pink-500'}`} />
                  )}
                  <span className="capitalize">{char}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 bg-gray-100 p-4 rounded-xl">
          <h3 className="font-semibold mb-2">Controls</h3>
          <p>WASD or Arrow Keys to move</p>
          <p>Mouse to look around</p>
          <p>Click to interact</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;