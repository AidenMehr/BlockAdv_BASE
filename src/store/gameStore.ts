import { create } from 'zustand';

interface InventoryItem {
  id: string;
  type: 'block' | 'tool' | 'resource';
  name: string;
  quantity: number;
  color?: string;
}

interface GameState {
  gameMode: 'single' | 'multi' | null;
  playerCharacter: 'steve' | 'alex' | 'robot';
  setGameMode: (mode: 'single' | 'multi' | null) => void;
  setPlayerCharacter: (character: 'steve' | 'alex' | 'robot') => void;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  level: number;
  experience: number;
  maxExperience: number;
  currency: number;
  inventory: InventoryItem[];
  selectedSlot: number;
  updateHealth: (amount: number) => void;
  updateEnergy: (amount: number) => void;
  addExperience: (amount: number) => void;
  updateCurrency: (amount: number) => void;
  addToInventory: (item: Omit<InventoryItem, 'id'>) => void;
  removeFromInventory: (itemId: string, amount?: number) => void;
  setSelectedSlot: (slot: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameMode: null,
  playerCharacter: 'steve',
  setGameMode: (mode) => set({ gameMode: mode }),
  setPlayerCharacter: (character) => set({ playerCharacter: character }),
  health: 100,
  maxHealth: 100,
  energy: 100,
  maxEnergy: 100,
  level: 1,
  experience: 0,
  maxExperience: 250,
  currency: 0,
  inventory: [],
  selectedSlot: 0,
  updateHealth: (amount) => set((state) => ({
    health: Math.min(Math.max(state.health + amount, 0), state.maxHealth)
  })),
  updateEnergy: (amount) => set((state) => ({
    energy: Math.min(Math.max(state.energy + amount, 0), state.maxEnergy)
  })),
  addExperience: (amount) => set((state) => {
    const newExp = state.experience + amount;
    if (newExp >= state.maxExperience) {
      return {
        level: state.level + 1,
        experience: newExp - state.maxExperience,
        maxExperience: Math.floor(state.maxExperience * 1.5)
      };
    }
    return { experience: newExp };
  }),
  updateCurrency: (amount) => set((state) => ({
    currency: state.currency + amount
  })),
  addToInventory: (item) => set((state) => {
    const newInventory = [...state.inventory];
    const existingItem = newInventory.find(i => i.name === item.name && i.type === item.type);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
      return { inventory: newInventory };
    }

    newInventory.push({
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    });
    return { inventory: newInventory };
  }),
  removeFromInventory: (itemId, amount = 1) => set((state) => {
    const newInventory = [...state.inventory];
    const itemIndex = newInventory.findIndex(i => i.id === itemId);
    
    if (itemIndex > -1) {
      if (newInventory[itemIndex].quantity <= amount) {
        newInventory.splice(itemIndex, 1);
      } else {
        newInventory[itemIndex].quantity -= amount;
      }
    }
    return { inventory: newInventory };
  }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
}));