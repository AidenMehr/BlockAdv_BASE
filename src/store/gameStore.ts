import { create } from 'zustand';

interface InventoryItem {
  type: 'dirt' | 'grass' | 'wood' | 'stone';
  count: number;
  color: string;
}

interface GameState {
  gameMode: 'single' | 'multi' | null;
  playerCharacter: 'steve' | 'alex' | 'robot';
  inventory: InventoryItem[];
  score: number;
  blocks: Array<{ position: [number, number, number]; type: string; color: string }>;
  playerPos: [number, number, number];
  setGameMode: (mode: 'single' | 'multi' | null) => void;
  setPlayerCharacter: (character: 'steve' | 'alex' | 'robot') => void;
  addToInventory: (type: InventoryItem['type'], color: string) => void;
  addScore: (points: number) => void;
  setBlocks: (blocks: Array<{ position: [number, number, number]; type: string; color: string }>) => void;
  setPlayerPos: (position: [number, number, number]) => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameMode: null,
  playerCharacter: 'steve',
  inventory: [],
  score: 0,
  blocks: [],
  playerPos: [0, 0, 0],
  setGameMode: (mode) => set({ gameMode: mode }),
  setPlayerCharacter: (character) => set({ playerCharacter: character }),
  addToInventory: (type, color) => set((state) => {
    const inventory = [...state.inventory];
    const existingItem = inventory.find(item => item.type === type);
    if (existingItem) {
      existingItem.count++;
    } else {
      inventory.push({ type, count: 1, color });
    }
    return { inventory };
  }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  setBlocks: (blocks) => set({ blocks }),
  setPlayerPos: (position) => set({ playerPos: position }),
}));