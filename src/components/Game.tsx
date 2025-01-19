import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Box, Text } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';
import HUD from './HUD';
import { ThreeEvent } from '@react-three/fiber';

// Player component with improved visuals
const Player = ({ position }: { position: [number, number, number] }) => {
  const { playerCharacter } = useGameStore();
  const color =
    playerCharacter === 'steve'
      ? '#4a9eff'
      : playerCharacter === 'alex'
      ? '#ff7f50'
      : '#9c27b0';

  return (
    <group position={position}>
      {/* Body */}
      <Box args={[1, 1.5, 0.5]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      {/* Head */}
      <Box args={[0.8, 0.8, 0.8]} position={[0, 1.8, 0]}>
        <meshStandardMaterial color="#ffb347" />
      </Box>
      {/* Arms */}
      <Box args={[0.4, 1.2, 0.4]} position={[-0.7, 0.75, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[0.4, 1.2, 0.4]} position={[0.7, 0.75, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      {/* Legs */}
      <Box args={[0.4, 1.2, 0.4]} position={[-0.3, -0.3, 0]}>
        <meshStandardMaterial color="#1a237e" />
      </Box>
      <Box args={[0.4, 1.2, 0.4]} position={[0.3, -0.3, 0]}>
        <meshStandardMaterial color="#1a237e" />
      </Box>
    </group>
  );
};

// Mob component (enemies)
const Mob = ({
  position,
  type,
}: {
  position: [number, number, number];
  type: 'zombie' | 'skeleton' | 'creeper';
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [mobPos, setMobPos] = useState(position);

  useFrame(() => {
    if (meshRef.current) {
      // Random movement
      const randomMove = Math.random() * 0.02 - 0.01;
      setMobPos([mobPos[0] + randomMove, mobPos[1], mobPos[2] + randomMove]);
    }
  });

  const color =
    type === 'zombie' ? '#4CAF50' : type === 'skeleton' ? '#BDBDBD' : '#50C878'; // Creeper color

  return (
    <group ref={meshRef} position={mobPos}>
      {type === 'creeper' ? (
        // Creeper model
        <>
          {/* Body */}
          <Box args={[0.6, 1.2, 0.3]} position={[0, 0.6, 0]}>
            <meshStandardMaterial color={color} />
          </Box>
          {/* Head */}
          <Box args={[0.8, 0.8, 0.8]} position={[0, 1.6, 0]}>
            <meshStandardMaterial color={color} />
          </Box>
          {/* Legs */}
          <Box args={[0.3, 0.6, 0.3]} position={[-0.2, 0.3, 0]}>
            <meshStandardMaterial color={color} />
          </Box>
          <Box args={[0.3, 0.6, 0.3]} position={[0.2, 0.3, 0]}>
            <meshStandardMaterial color={color} />
          </Box>
        </>
      ) : (
        // Existing zombie/skeleton model
        <>
          <Box args={[0.8, 1.8, 0.5]} position={[0, 0.9, 0]}>
            <meshStandardMaterial color={color} />
          </Box>
          <Box args={[0.7, 0.7, 0.7]} position={[0, 1.8, 0]}>
            <meshStandardMaterial color={color} />
          </Box>
        </>
      )}
    </group>
  );
};

const Block = ({
  position,
  color = '#8B4513',
  onMine,
  onPlace,
}: {
  position: [number, number, number];
  color?: string;
  onMine?: () => void;
  onPlace?: (position: [number, number, number], color: string) => void;
}) => {
  const { addToInventory, inventory, selectedSlot } = useGameStore();
  const [isHovered, setIsHovered] = useState(false);
  const [health, setHealth] = useState(100);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    if (event.button === 2) {
      // Right click - Place block
      const selectedItem = inventory[selectedSlot];
      if (
        selectedItem?.type === 'block' &&
        selectedItem.quantity > 0 &&
        onPlace
      ) {
        // Calculate new block position based on clicked face
        const face = Math.floor(event.faceIndex / 2); // 0: x, 1: y, 2: z
        const direction = event.faceIndex % 2 === 0 ? -1 : 1;
        const newPosition: [number, number, number] = [...position];
        newPosition[face] += direction;

        onPlace(newPosition, color);
      }
    } else if (event.button === 0 && onMine) {
      // Left click - Mine
      setHealth((prev) => {
        const newHealth = prev - 25;
        if (newHealth <= 0) {
          addToInventory({
            type: 'block',
            name: color === '#4CAF50' ? 'Grass Block' : 'Dirt Block',
            quantity: 1,
            color,
          });
          onMine();
        }
        return newHealth;
      });
    }
  };

  return (
    <Box
      args={[1, 1, 1]}
      position={position}
      onClick={handleClick}
      onContextMenu={handleClick} // Add right-click handler
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <meshStandardMaterial
        color={color}
        emissive={isHovered ? '#ffffff' : '#000000'}
        emissiveIntensity={isHovered ? 0.2 : 0}
      />
      {isHovered && health < 100 && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {health}%
        </Text>
      )}
    </Box>
  );
};

const GameWorld = () => {
  const { playerCharacter } = useGameStore();
  const playerPos = useRef<[number, number, number]>([0, 0, 0]);
  const [blocks, setBlocks] = useState<
    Array<{ position: [number, number, number]; color: string }>
  >([]);
  const [mobs, setMobs] = useState<
    Array<{
      position: [number, number, number];
      type: 'zombie' | 'skeleton' | 'creeper';
    }>
  >([]);
  const { inventory, selectedSlot, removeFromInventory } = useGameStore();

  useEffect(() => {
    // Generate world with proper typing
    const newBlocks: Array<{
      position: [number, number, number];
      color: string;
    }> = [];
    for (let x = -30; x < 30; x += 2) {
      for (let z = -30; z < 30; z += 2) {
        const height =
          Math.floor(Math.sin(x / 10) * Math.cos(z / 10) * 3) +
          Math.floor(Math.random() * 3);

        for (let y = 0; y < height; y++) {
          newBlocks.push({
            position: [x, y, z],
            color: y === height - 1 ? '#4CAF50' : '#8B4513',
          });
        }
      }
    }
    setBlocks(newBlocks);

    // Generate mobs with proper typing
    const newMobs: Array<{
      position: [number, number, number];
      type: 'zombie' | 'skeleton' | 'creeper';
    }> = [];
    for (let i = 0; i < 15; i++) {
      newMobs.push({
        position: [Math.random() * 40 - 20, 0, Math.random() * 40 - 20],
        type:
          Math.random() < 0.33
            ? 'zombie'
            : Math.random() < 0.66
            ? 'skeleton'
            : 'creeper',
      });
    }
    setMobs(newMobs);
  }, []);

  useFrame((state) => {
    // Update camera to follow player
    state.camera.position.x = playerPos.current[0] + 8;
    state.camera.position.y = playerPos.current[1] + 8;
    state.camera.position.z = playerPos.current[2] + 8;
    state.camera.lookAt(
      playerPos.current[0],
      playerPos.current[1],
      playerPos.current[2]
    );
  });

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const speed = 0.5;
      const newPos = [...playerPos.current] as [number, number, number];

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          newPos[2] -= speed;
          break;
        case 's':
        case 'arrowdown':
          newPos[2] += speed;
          break;
        case 'a':
        case 'arrowleft':
          newPos[0] -= speed;
          break;
        case 'd':
        case 'arrowright':
          newPos[0] += speed;
          break;
        case ' ':
          if (newPos[1] === 0) {
            // Only jump if on ground
            newPos[1] = 2;
            setTimeout(() => {
              playerPos.current[1] = 0;
            }, 500);
          }
          break;
      }

      playerPos.current = newPos;
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  const handleBlockMine = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBlockPlace = (
    position: [number, number, number],
    color: string
  ) => {
    const selectedItem = inventory[selectedSlot];
    if (selectedItem?.type === 'block' && selectedItem.quantity > 0) {
      setBlocks((prev) => [
        ...prev,
        { position, color: selectedItem.color || color },
      ]);
      removeFromInventory(selectedItem.id, 1);
    }
  };

  return (
    <>
      <Player position={playerPos.current} />

      {blocks.map((block, index) => (
        <Block
          key={`block-${index}`}
          position={block.position}
          color={block.color}
          onMine={() => handleBlockMine(index)}
          onPlace={handleBlockPlace}
        />
      ))}

      {mobs.map((mob, index) => (
        <Mob key={`mob-${index}`} position={mob.position} type={mob.type} />
      ))}

      {/* Ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>

      {/* Trees */}
      {[...Array(20)].map((_, i) => {
        const x = Math.random() * 80 - 40;
        const z = Math.random() * 80 - 40;
        return (
          <group key={`tree-${i}`} position={[x, 0, z]}>
            <Box args={[0.6, 4, 0.6]} position={[0, 2, 0]}>
              <meshStandardMaterial color="#5D4037" />
            </Box>
            <Box args={[2, 2, 2]} position={[0, 4, 0]}>
              <meshStandardMaterial color="#2E7D32" />
            </Box>
          </group>
        );
      })}
    </>
  );
};

const Game: React.FC = () => {
  const { gameMode } = useGameStore();

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', preventDefault);
    return () => document.removeEventListener('contextmenu', preventDefault);
  }, []);

  return (
    <div className="w-full h-screen">
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 75 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />

        <GameWorld />
      </Canvas>

      <HUD />
    </div>
  );
};

export default Game;
