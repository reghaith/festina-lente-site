'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Unit {
  id: string;
  type: keyof typeof UNIT_TYPES;
  health: number;
  maxHealth: number;
  attack: number;
  attackSpeed: number; // Time between attacks in ms
  speed: number; // Movement speed
  x: number; // Pixel position
  y: number; // Pixel position
  targetX?: number;
  targetY?: number;
  team: 'blue' | 'red';
  lastAttackTime: number;
  isAttacking: boolean;
}

interface GameState {
  phase: 'setup' | 'battle' | 'results';
  playerUnits: Unit[];
  enemyUnits: Unit[];
  playerGold: number;
  enemyGold: number;
  winner: 'player' | 'enemy' | 'draw' | null;
  battleLog: string[];
}

const UNIT_TYPES = {
  // Blue team units
  soldier: {
    health: 100,
    attack: 15,
    attackSpeed: 1000,
    speed: 2,
    name: 'Soldier',
    cost: 10,
    sprite: '/blue_soldier.png',
    icon: '/icon_sword.png'
  },
  archer: {
    health: 70,
    attack: 25,
    attackSpeed: 800,
    speed: 1.5,
    name: 'Archer',
    cost: 20,
    sprite: '/blue_soldier.png',
    icon: '/icon_sword.png'
  },
  healer: {
    health: 80,
    attack: 0, // Healers don't attack, they heal
    attackSpeed: 1200,
    speed: 1.2,
    name: 'Healer',
    cost: 25,
    sprite: '/blue_soldier.png',
    icon: '/icon_sword.png',
    healAmount: 20 // Custom property for healing
  },
  tank: {
    health: 150,
    attack: 10,
    attackSpeed: 1500,
    speed: 1,
    name: 'Tank',
    cost: 30,
    sprite: '/blue_soldier.png',
    icon: '/icon_sword.png'
  },
  // Red team units (same stats for AI)
  red_soldier: {
    health: 100,
    attack: 15,
    attackSpeed: 1000,
    speed: 2,
    name: 'Soldier',
    cost: 10,
    sprite: '/red_soldier.png',
    icon: '/icon_sword.png'
  },
  red_archer: {
    health: 70,
    attack: 25,
    attackSpeed: 800,
    speed: 1.5,
    name: 'Archer',
    cost: 20,
    sprite: '/red_soldier.png',
    icon: '/icon_sword.png'
  },
  red_healer: {
    health: 80,
    attack: 0,
    attackSpeed: 1200,
    speed: 1.2,
    name: 'Healer',
    cost: 25,
    sprite: '/red_soldier.png',
    icon: '/icon_sword.png',
    healAmount: 20
  },
  red_tank: {
    health: 150,
    attack: 10,
    attackSpeed: 1500,
    speed: 1,
    name: 'Tank',
    cost: 30,
    sprite: '/red_soldier.png',
    icon: '/icon_sword.png'
  }
};

const BATTLEFIELD_WIDTH = 800;
const BATTLEFIELD_HEIGHT = 500;
const UNIT_SIZE = 40;
const COLLISION_DISTANCE = 45;

export function BattleGame() {
  const { user } = useAuth();
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    phase: 'setup',
    playerUnits: [],
    enemyUnits: [],
    playerGold: 100,
    enemyGold: 100,
    winner: null,
    battleLog: []
  });

  const [selectedUnitType, setSelectedUnitType] = useState<keyof typeof UNIT_TYPES | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const battlefieldRef = useRef<HTMLDivElement>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);

  // Check if user entered through proper gateway
  useEffect(() => {
    const enteredViaGateway = sessionStorage.getItem('battleEnteredViaGateway');
    if (!enteredViaGateway) {
      // Redirect to normal site if accessed directly
      router.push('/dashboard');
      return;
    }

    // Initialize audio
    if (typeof window !== 'undefined') {
      musicRef.current = new Audio('/soundtrack.mp3');
      musicRef.current.loop = true;
      musicRef.current.volume = 0.3;
      
      sfxRef.current = new Audio('/sfx_hit.wav');
      sfxRef.current.volume = 0.5;
    }

    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, [router]);

  // Calculate distance between two points
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  // Find nearest enemy
  const findNearestEnemy = (unit: Unit, enemies: Unit[]) => {
    let nearest = null;
    let minDistance = Infinity;

    for (const enemy of enemies) {
      const distance = getDistance(unit.x, unit.y, enemy.x, enemy.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    }

    return nearest;
  };

  // Place unit on battlefield
  const placeUnit = (x: number, y: number) => {
    if (!selectedUnitType || selectedUnitType.startsWith('red_')) return;
    
    const unitType = UNIT_TYPES[selectedUnitType];
    
    // Check if player has enough gold
    if (gameState.playerGold < unitType.cost) return;
    
    // Check if click is on left side
    if (x > BATTLEFIELD_WIDTH / 2) return;

    const newUnit: Unit = {
      id: `blue_${Date.now()}_${Math.random()}`,
      type: selectedUnitType,
      health: unitType.health,
      maxHealth: unitType.health,
      attack: unitType.attack,
      attackSpeed: unitType.attackSpeed,
      speed: unitType.speed,
      x,
      y,
      team: 'blue',
      lastAttackTime: 0,
      isAttacking: false
    };

    setGameState(prev => ({
      ...prev,
      playerUnits: [...prev.playerUnits, newUnit],
      playerGold: prev.playerGold - unitType.cost
    }));
  };

  const removeUnit = (unitId: string) => {
    const unit = gameState.playerUnits.find(u => u.id === unitId);
    if (!unit) return;

    const unitType = UNIT_TYPES[unit.type];
    
    setGameState(prev => ({
      ...prev,
      playerUnits: prev.playerUnits.filter(u => u.id !== unitId),
      playerGold: prev.playerGold + unitType.cost
    }));
  };

  const generateEnemyUnits = () => {
    const enemyUnits: Unit[] = [];
    const enemyTypes: (keyof typeof UNIT_TYPES)[] = ['red_soldier', 'red_archer', 'red_healer', 'red_tank'];
    
    // Generate 3-5 random enemy units based on remaining gold
    let remainingGold = gameState.enemyGold;
    
    while (remainingGold >= 10 && enemyUnits.length < 8) {
      const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const unitType = UNIT_TYPES[randomType];
      
      if (unitType.cost <= remainingGold) {
        // Random position on right side
        const x = BATTLEFIELD_WIDTH / 2 + Math.random() * (BATTLEFIELD_WIDTH / 2 - UNIT_SIZE);
        const y = Math.random() * (BATTLEFIELD_HEIGHT - UNIT_SIZE);

        enemyUnits.push({
          id: `red_${Date.now()}_${Math.random()}`,
          type: randomType,
          health: unitType.health,
          maxHealth: unitType.health,
          attack: unitType.attack,
          attackSpeed: unitType.attackSpeed,
          speed: unitType.speed,
          x,
          y,
          team: 'red',
          lastAttackTime: 0,
          isAttacking: false
        });
        
        remainingGold -= unitType.cost;
      } else {
        break;
      }
    }

    return enemyUnits;
  };

  const startBattle = () => {
    if (gameState.playerUnits.length === 0) return;

    const enemyUnits = generateEnemyUnits();
    
    // Start background music
    if (musicRef.current) {
      musicRef.current.play().catch(() => {});
    }

    setGameState(prev => ({
      ...prev,
      phase: 'battle',
      enemyUnits,
      battleLog: ['⚔️ Battle begins!', `🔵 Blue Team: ${prev.playerUnits.length} units`, `🔴 Red Team: ${enemyUnits.length} units`]
    }));
  };

  const resetGame = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
    
    setGameState({
      phase: 'setup',
      playerUnits: [],
      enemyUnits: [],
      playerGold: 100,
      enemyGold: 100,
      winner: null,
      battleLog: []
    });
  };

  // Main game loop - runs during battle phase
  const gameLoop = useCallback(() => {
    setGameState(prev => {
      if (prev.phase !== 'battle') return prev;

      const currentTime = Date.now();
      let updatedPlayerUnits = [...prev.playerUnits];
      let updatedEnemyUnits = [...prev.enemyUnits];
      const newLog = [...prev.battleLog];

       // Update player units
       updatedPlayerUnits = updatedPlayerUnits.map(unit => {
         const unitType = UNIT_TYPES[unit.type];
         const isHealer = unit.type === 'healer';

         // Healers target allies, others target enemies
         const targetUnits = isHealer ? updatedPlayerUnits : updatedEnemyUnits;
         const nearestTarget = findNearestEnemy(unit, targetUnits);

         if (!nearestTarget) return unit;

         const distance = getDistance(unit.x, unit.y, nearestTarget.x, nearestTarget.y);

         // If close enough, perform action (attack or heal)
         if (distance <= COLLISION_DISTANCE) {
           if (currentTime - unit.lastAttackTime >= unit.attackSpeed) {
             if (isHealer) {
               // Heal the ally
               const healAmount = unitType.healAmount || 20;
               const oldHealth = nearestTarget.health;
               nearestTarget.health = Math.min(nearestTarget.health + healAmount, nearestTarget.maxHealth);
               const actualHeal = nearestTarget.health - oldHealth;

               if (actualHeal > 0) {
                 newLog.push(`💚 ${UNIT_TYPES[nearestTarget.type].name} healed for ${actualHeal} HP!`);
               }
             } else {
               // Attack the enemy
               nearestTarget.health -= unit.attack;

               // Play hit sound
               if (sfxRef.current) {
                 sfxRef.current.currentTime = 0;
                 sfxRef.current.play().catch(() => {});
               }

               if (nearestTarget.health <= 0) {
                 newLog.push(`💀 ${UNIT_TYPES[nearestTarget.type].name} defeated!`);
               }
             }

             return {
               ...unit,
               lastAttackTime: currentTime,
               isAttacking: true
             };
           }
           return { ...unit, isAttacking: false };
         }

         // Move towards target
         const dx = nearestTarget.x - unit.x;
         const dy = nearestTarget.y - unit.y;
         const angle = Math.atan2(dy, dx);

         return {
           ...unit,
           x: unit.x + Math.cos(angle) * unit.speed,
           y: unit.y + Math.sin(angle) * unit.speed,
           isAttacking: false
         };
       });

      // Update enemy units
       updatedEnemyUnits = updatedEnemyUnits.map(unit => {
         const unitType = UNIT_TYPES[unit.type];
         const isHealer = unit.type === 'red_healer';

         // Healers target allies, others target enemies
         const targetUnits = isHealer ? updatedEnemyUnits : updatedPlayerUnits;
         const nearestTarget = findNearestEnemy(unit, targetUnits);

         if (!nearestTarget) return unit;

         const distance = getDistance(unit.x, unit.y, nearestTarget.x, nearestTarget.y);

         // If close enough, perform action (attack or heal)
         if (distance <= COLLISION_DISTANCE) {
           if (currentTime - unit.lastAttackTime >= unit.attackSpeed) {
             if (isHealer) {
               // Heal the ally
               const healAmount = unitType.healAmount || 20;
               const oldHealth = nearestTarget.health;
               nearestTarget.health = Math.min(nearestTarget.health + healAmount, nearestTarget.maxHealth);
               const actualHeal = nearestTarget.health - oldHealth;

               if (actualHeal > 0) {
                 newLog.push(`💚 ${UNIT_TYPES[nearestTarget.type].name} healed for ${actualHeal} HP!`);
               }
             } else {
               // Attack the player unit
               nearestTarget.health -= unit.attack;

               // Play hit sound
               if (sfxRef.current) {
                 sfxRef.current.currentTime = 0;
                 sfxRef.current.play().catch(() => {});
               }

               if (nearestTarget.health <= 0) {
                 newLog.push(`💀 ${UNIT_TYPES[nearestTarget.type].name} defeated!`);
               }
             }

             return {
               ...unit,
               lastAttackTime: currentTime,
               isAttacking: true
             };
           }
           return { ...unit, isAttacking: false };
         }

         // Move towards target
         const dx = nearestTarget.x - unit.x;
         const dy = nearestTarget.y - unit.y;
         const angle = Math.atan2(dy, dx);

         return {
           ...unit,
           x: unit.x + Math.cos(angle) * unit.speed,
           y: unit.y + Math.sin(angle) * unit.speed,
           isAttacking: false
         };
       });

      // Remove dead units
      updatedPlayerUnits = updatedPlayerUnits.filter(u => u.health > 0);
      updatedEnemyUnits = updatedEnemyUnits.filter(u => u.health > 0);

      // Check for winner
      if (updatedPlayerUnits.length === 0 && updatedEnemyUnits.length === 0) {
        if (musicRef.current) musicRef.current.pause();
        return { ...prev, phase: 'results', winner: 'draw', battleLog: newLog, playerUnits: updatedPlayerUnits, enemyUnits: updatedEnemyUnits };
      }
      if (updatedPlayerUnits.length === 0) {
        if (musicRef.current) musicRef.current.pause();
        return { ...prev, phase: 'results', winner: 'enemy', battleLog: newLog, playerUnits: updatedPlayerUnits, enemyUnits: updatedEnemyUnits };
      }
      if (updatedEnemyUnits.length === 0) {
        if (musicRef.current) musicRef.current.pause();
        return { ...prev, phase: 'results', winner: 'player', battleLog: newLog, playerUnits: updatedPlayerUnits, enemyUnits: updatedEnemyUnits };
      }

      return {
        ...prev,
        playerUnits: updatedPlayerUnits,
        enemyUnits: updatedEnemyUnits,
        battleLog: newLog
      };
    });

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Start/stop game loop based on phase
  useEffect(() => {
    if (gameState.phase === 'battle') {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.phase, gameLoop]);

  if (gameState.phase === 'battle') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
        <style jsx>{`
          .pixel-font {
            font-family: 'Courier New', 'Press Start 2P', monospace;
            text-shadow: 2px 2px 0px rgba(0,0,0,1);
            image-rendering: pixelated;
            letter-spacing: 2px;
          }
          .grass-left {
            background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
          }
          .grass-right {
            background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
          }
          .pixel-sprite {
            border: 2px solid #000;
            box-shadow: 2px 2px 0px #000;
            image-rendering: pixelated;
          }
          .battle-shake {
            animation: battleShake 0.2s ease-in-out infinite alternate;
          }
          @keyframes battleShake {
            0% { transform: translate(0px, 0px); }
            100% { transform: translate(2px, -2px); }
          }
        `}</style>

        {/* Top HUD Bar */}
        <div className="h-16 bg-gray-900 border-b-4 border-gray-700 flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600/80 px-4 py-2 border-2 border-blue-400 pixel-font text-white text-xs">
              BLUE: {gameState.playerUnits.length}
            </div>
          </div>
          
          <div className="text-white pixel-font text-sm">
            BATTLE START
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-red-600/80 px-4 py-2 border-2 border-red-400 pixel-font text-white text-xs">
              RED: {gameState.enemyUnits.length}
            </div>
          </div>
        </div>

        {/* Battlefield */}
        <div 
          ref={battlefieldRef}
          className="relative mx-auto"
          style={{ 
            width: `${BATTLEFIELD_WIDTH}px`, 
            height: `${BATTLEFIELD_HEIGHT}px`,
            backgroundImage: 'url(/grass_field.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Center divider line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-600 transform -translate-x-1/2"></div>
          
          {/* Left side indicator */}
          <div className="absolute left-0 top-0 bottom-0 w-1/2 border-r-2 border-yellow-600/30"></div>
          
          {/* All units */}
          {[...gameState.playerUnits, ...gameState.enemyUnits].map((unit) => {
            const unitType = UNIT_TYPES[unit.type];
            const hpPercent = (unit.health / unit.maxHealth) * 100;
            
            return (
              <div
                key={unit.id}
                className={`absolute ${unit.isAttacking ? 'battle-shake' : ''}`}
                style={{
                  left: `${unit.x}px`,
                  top: `${unit.y}px`,
                  width: `${UNIT_SIZE}px`,
                  height: `${UNIT_SIZE}px`,
                  transition: 'all 0.1s linear'
                }}
              >
                {/* Unit sprite using actual image */}
                <img 
                  src={unitType.sprite}
                  alt={unitType.name}
                  className="w-full h-full pixel-sprite"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    // Fallback to colored square if image not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div 
                  className="hidden w-full h-full pixel-sprite flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: unit.team === 'blue' ? '#3b82f6' : '#ef4444' }}
                >
                  {unit.team === 'blue' ? '🔵' : '🔴'}
                </div>
                
                {/* HP bar above unit */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10">
                  <div className="h-1 bg-gray-800 border border-black">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: `${hpPercent}%`,
                        backgroundColor: hpPercent > 60 ? '#22c55e' : hpPercent > 30 ? '#eab308' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Battle Log */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[600px]">
          <div className="bg-black/90 border-4 border-gray-600 p-4 max-h-32 overflow-y-auto">
            <div className="space-y-1">
              {gameState.battleLog.slice(-5).map((log, i) => (
                <div key={i} className="text-green-400 pixel-font text-xs">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex items-center justify-center overflow-hidden">
        <style jsx>{`
          .pixel-font {
            font-family: 'Courier New', monospace;
            text-shadow: 3px 3px 0px rgba(0,0,0,1);
            image-rendering: pixelated;
          }
          .victory-glow {
            animation: victoryGlow 2s ease-in-out infinite alternate;
          }
          @keyframes victoryGlow {
            from { text-shadow: 3px 3px 0px rgba(0,0,0,1), 0 0 20px rgba(255,215,0,0.5); }
            to { text-shadow: 3px 3px 0px rgba(0,0,0,1), 0 0 30px rgba(255,215,0,1); }
          }
        `}</style>

        <div className="max-w-lg w-full mx-4 relative z-10">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-4 border-yellow-400 p-8 text-center shadow-2xl">
            <div className="mb-8">
              {gameState.winner === 'player' && (
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 victory-glow border-4 border-yellow-300">
                  <span className="text-5xl animate-bounce">🏆</span>
                </div>
              )}
              {gameState.winner === 'enemy' && (
                <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-400">
                  <span className="text-5xl">💀</span>
                </div>
              )}
              {gameState.winner === 'draw' && (
                <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-400">
                  <span className="text-5xl">🤝</span>
                </div>
              )}

              <h1 className={`text-4xl font-bold mb-4 pixel-font ${
                gameState.winner === 'player' ? 'text-yellow-300 victory-glow' :
                gameState.winner === 'enemy' ? 'text-red-400' : 'text-gray-300'
              }`}>
                {gameState.winner === 'player' && 'VICTORY!'}
                {gameState.winner === 'enemy' && 'DEFEAT!'}
                {gameState.winner === 'draw' && 'DRAW!'}
              </h1>

              <div className="bg-black/50 rounded border-2 border-gray-600 p-4 mb-4">
                <p className="text-blue-300 pixel-font text-sm">
                  Blue Team: {gameState.playerUnits.length} survivors
                </p>
                <p className="text-red-300 pixel-font text-sm">
                  Red Team: {gameState.enemyUnits.length} survivors
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  resetGame();
                }}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-4 px-8 rounded-lg border-2 border-green-400 font-bold pixel-font transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🗡️ PLAY AGAIN 🗡️
              </button>

              <button
                onClick={() => {
                  sessionStorage.removeItem('battleEnteredViaGateway');
                  router.push('/dashboard');
                }}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-lg border-2 border-gray-500 font-bold pixel-font transition-colors duration-200"
              >
                EXIT TO SITE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Setup Phase - Default view
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
      <style jsx>{`
        .pixel-font {
          font-family: 'Courier New', 'Press Start 2P', monospace;
          text-shadow: 2px 2px 0px rgba(0,0,0,1);
          image-rendering: pixelated;
          letter-spacing: 2px;
        }
        .grass-left {
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
        }
        .grass-right {
          background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
        }
        .grid-cell {
          border: 1px solid rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }
        .grid-cell:hover {
          background-color: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
        }
        .pixel-sprite {
          border: 2px solid #000;
          box-shadow: 2px 2px 0px #000;
          image-rendering: pixelated;
          cursor: pointer;
        }
        .unit-card {
          border: 3px solid #000;
          box-shadow: 3px 3px 0px #000;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .unit-card:hover {
          transform: scale(1.05);
        }
        .unit-card.selected {
          border-color: #fbbf24;
          box-shadow: 0 0 20px #fbbf24, 3px 3px 0px #000;
        }
      `}</style>

      {/* Top HUD Bar */}
      <div className="h-16 bg-gray-900 border-b-4 border-gray-700 flex items-center justify-between px-8">
        {/* Left - Blue Team Units */}
        <div className="flex items-center space-x-2">
          {(['soldier', 'archer', 'healer', 'tank'] as const).map((unitType) => {
            const unit = UNIT_TYPES[unitType];
            return (
              <button
                key={unitType}
                onClick={() => setSelectedUnitType(unitType)}
                className={`unit-card w-16 h-16 p-2 flex flex-col items-center justify-center bg-blue-600 ${
                  selectedUnitType === unitType ? 'selected' : ''
                }`}
                disabled={gameState.playerGold < unit.cost}
              >
                <img 
                  src={unit.icon}
                  alt={unit.name}
                  className="w-8 h-8"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="hidden text-2xl">🔵</div>
                <div className="text-white pixel-font text-xs mt-1">
                  {unit.cost}
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Center - Phase Display */}
        <div className="text-white pixel-font text-sm">
          SETUP PHASE
        </div>
        
        {/* Right - Red Team Units (preview only) */}
        <div className="flex items-center space-x-2">
          {(['red_soldier', 'red_archer', 'red_healer', 'red_tank'] as const).map((unitType) => {
            const unit = UNIT_TYPES[unitType];
            return (
              <div
                key={unitType}
                className="unit-card w-16 h-16 p-2 flex flex-col items-center justify-center bg-red-600"
              >
                <img 
                  src={unit.icon}
                  alt={unit.name}
                  className="w-8 h-8"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="hidden text-2xl">🔴</div>
                <div className="text-white pixel-font text-xs mt-1">
                  {unit.cost}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gold Display */}
      <div className="flex justify-center py-4">
        <div className="bg-yellow-600/80 px-6 py-2 border-2 border-yellow-400 pixel-font text-white text-sm">
          GOLD: {gameState.playerGold}
        </div>
      </div>

      {/* Battlefield */}
      <div className="flex justify-center">
        <div 
          ref={battlefieldRef}
          className="relative"
          style={{ 
            width: `${BATTLEFIELD_WIDTH}px`, 
            height: `${BATTLEFIELD_HEIGHT}px`,
            backgroundImage: 'url(/grass_field.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#2D5A27'
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            placeUnit(x, y);
          }}
        >
          {/* Center divider line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-600 transform -translate-x-1/2"></div>
          
          {/* Left side label */}
          <div className="absolute left-4 top-4 bg-blue-600/80 px-3 py-1 border-2 border-blue-400 pixel-font text-white text-xs">
            BLUE TEAM
          </div>
          
          {/* Right side label */}
          <div className="absolute right-4 top-4 bg-red-600/80 px-3 py-1 border-2 border-red-400 pixel-font text-white text-xs">
            RED TEAM
          </div>
          
          {/* Player units */}
          {gameState.playerUnits.map((unit) => {
            const unitType = UNIT_TYPES[unit.type];
            return (
              <div
                key={unit.id}
                className="absolute cursor-pointer hover:scale-110 transition-transform"
                style={{
                  left: `${unit.x}px`,
                  top: `${unit.y}px`,
                  width: `${UNIT_SIZE}px`,
                  height: `${UNIT_SIZE}px`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeUnit(unit.id);
                }}
              >
                <img 
                  src={unitType.sprite}
                  alt={unitType.name}
                  className="w-full h-full pixel-sprite"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div 
                  className="hidden w-full h-full pixel-sprite flex items-center justify-center text-2xl"
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  🔵
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center mt-8 space-x-6">
        <button
          onClick={startBattle}
          disabled={gameState.playerUnits.length === 0}
          className={`px-12 py-4 border-4 pixel-font text-lg transition-all duration-200 ${
            gameState.playerUnits.length === 0
              ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-500 text-white border-green-400 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          START
        </button>

        <button
          onClick={resetGame}
          className="px-12 py-4 bg-red-600 hover:bg-red-500 text-white border-4 border-red-400 pixel-font text-lg transition-colors duration-200"
        >
          RESET
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center mt-6">
        <p className="text-gray-400 pixel-font text-xs">
          SELECT A UNIT FROM THE TOP BAR, THEN CLICK ON THE LEFT SIDE TO PLACE IT. CLICK UNITS TO REMOVE THEM.
        </p>
      </div>
    </div>
  );
}
