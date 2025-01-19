import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Box, Text, PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';
import { Pickaxe, Map, Backpack, Trophy } from 'lucide-react';

const WORLD_SIZE = 60;
const CHUNK_SIZE = 16;

const Player = ({ position }: { position: [number, number, number] }) => {
  const { playerCharacter } = useGameStore();
  const color = playerCharacter === 'steve' ? '#4a9eff' : 
                playerCharacter === 'alex' ? '#ff7f50' : '#9c27b0';
  
  return (
    <group position={position}>
      <Box args={[1, 1.5, 0.5]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[0.8, 0.8, 0.8]} position={[0, 1.8, 0]}>
        <meshStandardMaterial color="#ffb347" />
      </Box>
      <Box args={[0.4, 1.2, 0.4]} position={[-0.7, 0.75, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[0.4, 1.2, 0.4]} position={[0.7, 0.75, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[0.4, 1.2, 0.4]} position={[-0.3, -0.3, 0]}>
        <meshStandardMaterial color="#1a237e" />
      </Box>
      <Box args={[0.4, 1.2, 0.4]} position={[0.3, -0.3, 0]}>
        <meshStandardMaterial color="#1a237e" />
      </Box>
    </group>
  );
};

const Block = ({ 
  position, 
  type = 'dirt',
  color = '#8B4513', 
  onMine, 
  onPlace,
  health: initialHealth = 100 
}: { 
  position: [number, number, number],
  type?: string,
  color?: string,
  onMine?: (type: string, color: string) => void,
  onPlace?: () => void,
  health?: number
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const healthRef = useRef(initialHealth);
  const [displayHealth, setDisplayHealth] = useState(initialHealth);

  const handleClick = useCallback((event: React.MouseEvent | THREE.Event) => {
    if ('stopPropagation' in event) {
      event.stopPropagation();
    }
    
    const button = 'button' in event ? event.button : 0;
    
    if (button === 2) { // Right click
      onPlace?.();
    } else if (onMine) {
      healthRef.current -= 25;
      setDisplayHealth(healthRef.current);
      if (healthRef.current <= 0) {
        onMine(type, color);
      }
    }
  }, [onMine, onPlace, type, color]);

  return (
    <Box 
      args={[1, 1, 1]} 
      position={position}
      onClick={handleClick}
      onContextMenu={handleClick}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <meshStandardMaterial 
        color={color} 
        emissive={isHovered ? '#ffffff' : '#000000'}
        emissiveIntensity={isHovered ? 0.2 : 0}
      />
      {isHovered && displayHealth < 100 && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {displayHealth}%
        </Text>
      )}
    </Box>
  );
};

const GameWorld = () => {
  const { addToInventory, addScore, setBlocks, blocks, setPlayerPos } = useGameStore();
  const playerPos = useRef<[number, number, number]>([0, 0, 0]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const mouseDown = useRef(false);

  // Add back keyboard controls
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const speed = 0.5;
      const newPos = [...playerPos.current] as [number, number, number];
      
      switch(e.key.toLowerCase()) {
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
            newPos[1] = 2;
            setTimeout(() => {
              playerPos.current = [newPos[0], 0, newPos[2]];
              setPlayerPos(playerPos.current);
            }, 500);
          }
          break;
      }
      
      playerPos.current = newPos;
      setPlayerPos(newPos);
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [setPlayerPos]);

  // Add back mouse controls for camera rotation
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click only
        mouseDown.current = true;
      }
    };

    const handleMouseUp = () => {
      mouseDown.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseDown.current && cameraRef.current) {
        const rotationSpeed = 0.005;
        cameraRef.current.rotation.y -= e.movementX * rotationSpeed;
        // Limit vertical rotation to prevent camera flipping
        const newRotationX = cameraRef.current.rotation.x - e.movementY * rotationSpeed;
        cameraRef.current.rotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, newRotationX));
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Add block selection from inventory
  const handleInventorySelect = useCallback((type: string) => {
    setSelectedBlock(type);
  }, []);

  // Generate and set initial blocks
  useEffect(() => {
    const initialBlocks = [];
    // Generate a larger, flatter terrain
    for (let x = -WORLD_SIZE/2; x < WORLD_SIZE/2; x++) {
      for (let z = -WORLD_SIZE/2; z < WORLD_SIZE/2; z++) {
        // Basic terrain height calculation
        const height = Math.floor(
          Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2 + 4
        );
        
        // Add blocks from bottom to top
        for (let y = 0; y < height; y++) {
          const blockType = y === height - 1 ? 'grass' : 
                           y > height - 4 ? 'dirt' : 'stone';
          
          initialBlocks.push({
            position: [x, y, z] as [number, number, number],
            type: blockType,
            color: blockType === 'grass' ? '#4CAF50' : 
                   blockType === 'dirt' ? '#8B4513' : 
                   '#808080'
          });
        }
      }
    }
    setBlocks(initialBlocks);
  }, [setBlocks]);

  // Handle block mining
  const handleBlockMine = useCallback((type: string, color: string) => {
    addToInventory(type as any, color);
    addScore(10);
  }, [addToInventory, addScore]);

  // Handle block placement
  const handleBlockPlace = useCallback((position: [number, number, number]) => {
    if (selectedBlock) {
      const newBlock = {
        position,
        type: selectedBlock,
        color: selectedBlock === 'grass' ? '#4CAF50' : 
               selectedBlock === 'dirt' ? '#8B4513' : 
               '#808080'
      };
      setBlocks([...blocks, newBlock]);
    }
  }, [selectedBlock, blocks, setBlocks]);

  // Update player position in store
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setPlayerPos(playerPos.current);
    }, 50);
    return () => clearInterval(updateInterval);
  }, [setPlayerPos]);

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 10, 10]} />
      <OrbitControls 
        enableDamping={false}
        enablePan={false}
        enableZoom={true}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minDistance={5}
        maxDistance={20}
      />
      
      <Player position={playerPos.current} />
      
      {blocks.map((block, index) => (
        <Block
          key={`block-${index}`}
          position={block.position}
          type={block.type}
          color={block.color}
          onMine={handleBlockMine}
          onPlace={() => handleBlockPlace(block.position)}
        />
      ))}

      {/* Add ground plane for reference */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[WORLD_SIZE * 2, WORLD_SIZE * 2]} />
        <meshStandardMaterial color="#8B5E3C" opacity={0.8} transparent />
      </mesh>
    </>
  );
};

const MiniMap = ({ 
  blocks, 
  playerPosition, 
  mapSize = 48, 
  scale = 2 
}: { 
  blocks: Array<{ position: [number, number, number]; type: string; color: string }>;
  playerPosition: [number, number, number];
  mapSize?: number;
  scale?: number;
}) => {
  return (
    <div className="fixed top-4 right-4 bg-black/50 p-2 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Map className="w-6 h-6 text-white" />
        <span className="text-white font-bold">Map</span>
      </div>
      <div className="w-48 h-48 bg-gray-800/50 rounded-lg relative overflow-hidden">
        {/* Render blocks on minimap */}
        {blocks.map((block, index) => {
          const [x, y, z] = block.position;
          const mapX = (x + WORLD_SIZE/2) * scale;
          const mapZ = (z + WORLD_SIZE/2) * scale;
          
          return (
            <div
              key={`map-block-${index}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${mapX}px`,
                top: `${mapZ}px`,
                backgroundColor: block.color,
                opacity: 0.8
              }}
            />
          );
        })}
        
        {/* Player position indicator */}
        <div 
          className="absolute w-2 h-2 bg-blue-500 rounded-full z-10"
          style={{
            left: `${(playerPosition[0] + WORLD_SIZE/2) * scale}px`,
            top: `${(playerPosition[2] + WORLD_SIZE/2) * scale}px`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 4px #fff'
          }}
        />
      </div>
    </div>
  );
};

const Game: React.FC = () => {
  const { gameMode, inventory, score, blocks, playerPos } = useGameStore();

  const handleInventoryClick = (type: string) => {
    // Add inventory selection logic here
    console.log('Selected block:', type);
  };

  return (
    <div className="w-full h-screen">
      <Canvas shadows>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <GameWorld />
      </Canvas>

      {/* HUD */}
      <div className="fixed top-4 left-4 bg-black/50 text-white p-4 rounded-lg space-y-2">
        <div className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Score: {score}
        </div>
        <div>{gameMode === 'single' ? 'Single Player' : 'Multiplayer'} Mode</div>
        <div className="text-sm space-y-1">
          <div>WASD or Arrow Keys to move</div>
          <div>Space to jump</div>
          <div>Left click to mine</div>
          <div>Right click to place</div>
          <div>Hold mouse to rotate camera</div>
        </div>
      </div>

      {/* Inventory */}
      <div className="fixed bottom-4 left-4 bg-black/50 text-white p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Backpack className="w-6 h-6" />
          <span className="font-bold">Inventory</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {inventory.map((item, index) => (
            <button 
              key={index}
              onClick={() => handleInventoryClick(item.type)}
              className="bg-gray-800/50 p-2 rounded flex flex-col items-center hover:bg-gray-700/50 transition-colors"
              style={{ borderColor: item.color }}
            >
              <div 
                className="w-8 h-8 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm mt-1">{item.type}</span>
              <span className="text-xs">x{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      <MiniMap 
        blocks={blocks} 
        playerPosition={playerPos} 
        mapSize={48} 
        scale={2}
      />
    </div>
  );
};

export default Game;