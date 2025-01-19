import React from 'react';
import { useGameStore } from '../store/gameStore';

const InventorySlot: React.FC<{
  item?: {
    id: string;
    name: string;
    quantity: number;
    color?: string;
  };
  selected?: boolean;
  onClick: () => void;
}> = ({ item, selected, onClick }) => (
  <div 
    onClick={onClick}
    className={`w-16 h-16 bg-gray-800/80 border-2 ${
      selected ? 'border-yellow-400' : 'border-gray-600'
    } rounded-lg flex items-center justify-center relative cursor-pointer hover:border-gray-400 transition-colors`}
  >
    {item && (
      <>
        <div 
          className="w-12 h-12 rounded"
          style={{ backgroundColor: item.color || '#8B4513' }}
        />
        <span className="absolute bottom-1 right-1 text-white text-sm font-bold">
          {item.quantity}
        </span>
      </>
    )}
  </div>
);

const Inventory: React.FC = () => {
  const { inventory, selectedSlot, setSelectedSlot } = useGameStore();

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
      <div className="flex gap-2 p-2 bg-black/50 backdrop-blur-sm rounded-lg">
        {[...Array(9)].map((_, index) => (
          <InventorySlot
            key={index}
            item={inventory[index]}
            selected={selectedSlot === index}
            onClick={() => setSelectedSlot(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Inventory; 