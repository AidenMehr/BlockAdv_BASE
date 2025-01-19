import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Menu, X } from 'lucide-react';
import Inventory from './Inventory';

const HUD: React.FC = () => {
  const { health, maxHealth, energy, maxEnergy, level, experience, maxExperience, currency, gameMode } = useGameStore();
  const [showControls, setShowControls] = useState(true);

  return (
    <>
      <div className="fixed top-0 left-0 p-4 w-full pointer-events-none">
        <div className="flex flex-col gap-2 max-w-xs">
          {/* Hide/Show Button */}
          <button 
            onClick={() => setShowControls(!showControls)}
            className="pointer-events-auto bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-md w-24 flex items-center gap-2 shadow-lg"
          >
            {showControls ? <X size={20} /> : <Menu size={20} />}
            {showControls ? 'Hide' : 'Menu'}
          </button>

          {/* Controls Info */}
          {showControls && (
            <div className="bg-black/70 text-white p-4 rounded-lg space-y-2 pointer-events-auto backdrop-blur-sm">
              <div className="text-2xl font-bold">Block Adventure</div>
              <div className="text-gray-300">{gameMode === 'single' ? 'Single Player' : 'Multiplayer'} Mode</div>
              <div className="text-sm space-y-1 text-gray-200">
                <div>WASD or Arrow Keys to move</div>
                <div>Space to jump</div>
                <div>Left-click to mine blocks</div>
                <div>Right-click to place blocks</div>
                <div>Watch out for mobs!</div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="space-y-2 mt-2">
            {/* Currency */}
            <div className="text-green-400 text-3xl font-bold drop-shadow-lg">
              ${currency}
            </div>

            {/* Level */}
            <div className="text-white text-lg">
              Lv. {level}
              <div className="w-full bg-gray-800/80 h-2 rounded-full">
                <div 
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${(experience / maxExperience) * 100}%` }}
                />
              </div>
            </div>

            {/* Health Bar */}
            <div className="w-full bg-red-900/80 h-6 rounded-md border border-red-700">
              <div 
                className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-sm transition-all duration-300"
                style={{ width: `${(health / maxHealth) * 100}%` }}
              >
                <span className="px-2 text-white text-shadow">Health {health}/{maxHealth}</span>
              </div>
            </div>

            {/* Energy Bar */}
            <div className="w-full bg-blue-900/80 h-6 rounded-md border border-blue-700">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-500 h-full rounded-sm transition-all duration-300"
                style={{ width: `${(energy / maxEnergy) * 100}%` }}
              >
                <span className="px-2 text-white text-shadow">Energy {energy}/{maxEnergy}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Inventory />
    </>
  );
};

export default HUD; 