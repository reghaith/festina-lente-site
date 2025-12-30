'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Unit {
  id: string;
  type: keyof typeof UNIT_TYPES;
  health: number;
  maxHealth: number;
  attack: number;
  position: number; // 0-50 battlefield position
}

interface GameState {
  phase: 'setup' | 'battle' | 'results';
  playerUnits: Unit[];
  enemyUnits: Unit[];
  turn: number;
  winner: 'player' | 'enemy' | 'draw' | null;
  battleLog: string[];
}

const UNIT_TYPES = {
  // Human units
  soldier: { health: 120, attack: 25, name: 'Soldier', team: 'human', icon: '⚔️' },
  bowman: { health: 80, attack: 35, name: 'Bowman', team: 'human', icon: '🏹' },
  wizard: { health: 70, attack: 45, name: 'Wizard', team: 'human', icon: '🔮' },
  lancer: { health: 90, attack: 30, name: 'Lancer', team: 'human', icon: '🗡️' },
  // Orc units (for enemy generation)
  warrior: { health: 130, attack: 22, name: 'Warrior', team: 'orc', icon: '⚔️' },
  archer: { health: 85, attack: 32, name: 'Archer', team: 'orc', icon: '🏹' },
  rider: { health: 100, attack: 28, name: 'Rider', team: 'orc', icon: '🐎' },
  bear: { health: 160, attack: 20, name: 'Bear', team: 'orc', icon: '🐻' }
};

export function BattleGame() {
  const { user } = useAuth();
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    phase: 'setup',
    playerUnits: [],
    enemyUnits: [],
    turn: 0,
    winner: null,
    battleLog: []
  });

  const [selectedUnitType, setSelectedUnitType] = useState<string | null>(null);
  const [placingUnit, setPlacingUnit] = useState(false);
  const [draggedUnit, setDraggedUnit] = useState<string | null>(null);

  // Check if user entered through proper gateway
  useEffect(() => {
    const enteredViaGateway = sessionStorage.getItem('battleEnteredViaGateway');
    if (!enteredViaGateway) {
      // Redirect to normal site if accessed directly
      router.push('/dashboard');
      return;
    }
  }, [router]);

  const addUnit = (position: number) => {
    if (gameState.playerUnits.length >= 8 || !selectedUnitType) return;

    const unitType = UNIT_TYPES[selectedUnitType as keyof typeof UNIT_TYPES];
    const newUnit: Unit = {
      id: `${selectedUnitType}_${Date.now()}`,
      type: selectedUnitType as keyof typeof UNIT_TYPES,
      health: unitType.health,
      maxHealth: unitType.health,
      attack: unitType.attack,
      position
    };

    setGameState(prev => ({
      ...prev,
      playerUnits: [...prev.playerUnits, newUnit]
    }));
  };

  const removeUnit = (unitId: string) => {
    setGameState(prev => ({
      ...prev,
      playerUnits: prev.playerUnits.filter(u => u.id !== unitId)
    }));
  };

  const generateEnemyUnits = () => {
    const enemyUnits: Unit[] = [];
    const enemyTypes = ['warrior', 'archer', 'rider', 'bear'] as const;
    const positions = Array.from({ length: 50 }, (_, i) => i).filter(i => i >= 5); // Right side only (columns 5-9)

    // Generate 3-5 random enemy units
    const numUnits = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numUnits; i++) {
      const randomTypeIndex = Math.floor(Math.random() * enemyTypes.length);
      const randomType = enemyTypes[randomTypeIndex];

      // Create enemy unit stats (slightly different from player units)
      let unitStats;
      switch (randomType) {
        case 'warrior':
          unitStats = { health: 110, attack: 18, name: 'Warrior' };
          break;
        case 'archer':
          unitStats = { health: 75, attack: 28, name: 'Archer' };
          break;
        case 'rider':
          unitStats = { health: 90, attack: 22, name: 'Rider' };
          break;
        case 'bear':
          unitStats = { health: 140, attack: 16, name: 'Bear' };
          break;
        default:
          unitStats = { health: 100, attack: 20, name: 'Unknown' };
      }

      const availablePositions = positions.filter(pos =>
        !enemyUnits.some(unit => unit.position === pos)
      );
      const position = availablePositions[Math.floor(Math.random() * availablePositions.length)];

      enemyUnits.push({
        id: `enemy_${randomType}_${i}`,
        type: randomType as keyof typeof UNIT_TYPES,
        health: unitStats.health,
        maxHealth: unitStats.health,
        attack: unitStats.attack,
        position
      });
    }

    return enemyUnits;
  };

  const startBattle = () => {
    if (gameState.playerUnits.length === 0) return;

    const enemyUnits = generateEnemyUnits();
    setGameState(prev => ({
      ...prev,
      phase: 'battle',
      enemyUnits,
      battleLog: ['Battle begins!', `Player deploys ${prev.playerUnits.length} units`, `Enemy deploys ${enemyUnits.length} units`]
    }));

    // Start battle simulation after a brief delay
    setTimeout(() => runBattle(enemyUnits), 1000);
  };

  const resetGame = () => {
    setGameState({
      phase: 'setup',
      playerUnits: [],
      enemyUnits: [],
      turn: 0,
      winner: null,
      battleLog: []
    });
  };

  const runBattle = (enemyUnits: Unit[]) => {
    let currentPlayerUnits = [...gameState.playerUnits];
    let currentEnemyUnits = [...enemyUnits];
    let turn = 0;
    const log: string[] = ['Battle begins!', `Player deploys ${currentPlayerUnits.length} units`, `Enemy deploys ${currentEnemyUnits.length} units`];

    const battleInterval = setInterval(() => {
      turn++;

      // Player turn
      if (currentPlayerUnits.length > 0 && currentEnemyUnits.length > 0) {
        const attacker = currentPlayerUnits[Math.floor(Math.random() * currentPlayerUnits.length)];
        const target = currentEnemyUnits[Math.floor(Math.random() * currentEnemyUnits.length)];

        target.health -= attacker.attack;
        log.push(`Turn ${turn}: ${UNIT_TYPES[attacker.type].name} attacks ${UNIT_TYPES[target.type].name} for ${attacker.attack} damage`);

        if (target.health <= 0) {
          currentEnemyUnits = currentEnemyUnits.filter(u => u.id !== target.id);
          log.push(`${UNIT_TYPES[target.type].name} defeated!`);
        }
      }

      // Enemy turn
      if (currentPlayerUnits.length > 0 && currentEnemyUnits.length > 0) {
        const attacker = currentEnemyUnits[Math.floor(Math.random() * currentEnemyUnits.length)];
        const target = currentPlayerUnits[Math.floor(Math.random() * currentPlayerUnits.length)];

        target.health -= attacker.attack;
        log.push(`Turn ${turn}: Enemy ${UNIT_TYPES[attacker.type].name} attacks ${UNIT_TYPES[target.type].name} for ${attacker.attack} damage`);

        if (target.health <= 0) {
          currentPlayerUnits = currentPlayerUnits.filter(u => u.id !== target.id);
          log.push(`${UNIT_TYPES[target.type].name} defeated!`);
        }
      }

      // Check for winner
      if (currentPlayerUnits.length === 0) {
        clearInterval(battleInterval);
        setGameState(prev => ({ ...prev, phase: 'results', winner: 'enemy', battleLog: log }));
        return;
      }

      if (currentEnemyUnits.length === 0) {
        clearInterval(battleInterval);
        setGameState(prev => ({ ...prev, phase: 'results', winner: 'player', battleLog: log }));
        return;
      }

      // Update state for next turn
      setGameState(prev => ({
        ...prev,
        turn,
        playerUnits: currentPlayerUnits,
        enemyUnits: currentEnemyUnits,
        battleLog: log
      }));

      // Prevent infinite battles
      if (turn > 20) {
        clearInterval(battleInterval);
        setGameState(prev => ({ ...prev, phase: 'results', winner: 'draw', battleLog: log }));
      }
    }, 800);
  };

  if (gameState.phase === 'battle') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-500 to-green-400 overflow-hidden">
        <style jsx>{`
          .pixel-font {
            font-family: 'Courier New', monospace;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.9);
            image-rendering: pixelated;
            letter-spacing: 1px;
          }
          .grass-texture {
            background-color: #2D5A27;
            background-image:
              radial-gradient(circle at 25% 75%, rgba(50, 205, 50, 0.15) 2px, transparent 2px),
              radial-gradient(circle at 75% 25%, rgba(34, 139, 34, 0.1) 3px, transparent 3px),
              radial-gradient(circle at 50% 50%, rgba(0, 100, 0, 0.08) 1px, transparent 1px);
            background-size: 60px 60px, 80px 80px, 40px 40px;
          }
          .center-divider {
            background: repeating-linear-gradient(
              90deg,
              transparent,
              transparent 4px,
              rgba(241, 196, 15, 0.6) 4px,
              rgba(241, 196, 15, 0.6) 6px
            );
          }
          .unit-icon {
            image-rendering: pixelated;
            filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.5));
          }
          .battle-chaos {
            animation: battleChaos 0.3s ease-in-out infinite alternate;
          }
          @keyframes battleChaos {
            0% { transform: translateX(0px) translateY(0px) rotate(0deg); }
            100% { transform: translateX(2px) translateY(-1px) rotate(1deg); }
          }
        `}</style>

        {/* Top UI Bar */}
        <div className="h-24 bg-gradient-to-r from-red-800 via-red-700 to-red-800 border-b-4 border-red-400 shadow-lg">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-yellow-300 pixel-font mb-1 battle-chaos">BATTLE IN PROGRESS</h1>
              <p className="text-white pixel-font text-sm">
                Turn {gameState.turn} | Humans {gameState.playerUnits.length} vs {gameState.enemyUnits.length} Orcs
              </p>
            </div>
          </div>
        </div>

        {/* Battlefield */}
        <div className="flex-1 relative min-h-[500px] grass-texture">
          {/* Center divider line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-2 center-divider opacity-80"></div>

          {/* Combat units - animated toward center */}
          <div className="absolute inset-0 p-4">
            {/* Player units */}
            {gameState.playerUnits.map((unit, index) => {
              const baseX = 30 + (index * 8); // Move toward center
              const chaosOffset = Math.sin(Date.now() / 500 + index) * 3;

              return (
                <div
                  key={unit.id}
                  className="absolute w-14 h-14 transform -translate-x-1/2 -translate-y-1/2 battle-chaos"
                  style={{
                    left: `${baseX + chaosOffset}%`,
                    top: `${35 + (index % 3) * 10}%`,
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg border-2 border-blue-300 flex items-center justify-center shadow-lg unit-icon">
                    <span className="text-3xl block">{UNIT_TYPES[unit.type].icon}</span>
                  </div>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-6 h-1 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              );
            })}

            {/* Enemy units */}
            {gameState.enemyUnits.map((unit, index) => {
              const baseX = 70 - (index * 8); // Move toward center from right
              const chaosOffset = Math.sin(Date.now() / 500 + index + Math.PI) * 3;

              return (
                <div
                  key={unit.id}
                  className="absolute w-14 h-14 transform -translate-x-1/2 -translate-y-1/2 battle-chaos"
                  style={{
                    left: `${baseX + chaosOffset}%`,
                    top: `${35 + (index % 3) * 10}%`,
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 rounded-lg border-2 border-red-300 flex items-center justify-center shadow-lg unit-icon">
                    <span className="text-3xl block">{UNIT_TYPES[unit.type].icon}</span>
                  </div>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-6 h-1 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gray-800/90 rounded-lg border-2 border-gray-600 p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-6">
              <div className="text-white pixel-font text-sm">
                UNITS: {gameState.playerUnits.length}/8
              </div>

              <button
                onClick={startBattle}
                disabled={gameState.playerUnits.length === 0}
                className={`px-6 py-3 rounded border-2 font-bold pixel-font transition-all duration-200 ${
                  gameState.playerUnits.length === 0
                    ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-500 text-white border-green-400 shadow-lg hover:shadow-xl'
                }`}
              >
                START BATTLE!
              </button>

              <button
                onClick={resetGame}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded border-2 border-red-400 font-bold pixel-font transition-colors duration-200"
              >
                RESET
              </button>
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
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-4 border-yellow-400 p-8 text-center pixel-border shadow-2xl">
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
                <p className="text-green-400 pixel-font text-lg">
                  Battle lasted {gameState.turn} turns
                </p>
                <p className="text-blue-300 pixel-font text-sm">
                  Humans: {gameState.playerUnits.length} survivors
                </p>
                <p className="text-red-300 pixel-font text-sm">
                  Orcs: {gameState.enemyUnits.length} survivors
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setGameState({
                    phase: 'setup',
                    playerUnits: [],
                    enemyUnits: [],
                    turn: 0,
                    winner: null,
                    battleLog: []
                  });
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

  return null;
}
