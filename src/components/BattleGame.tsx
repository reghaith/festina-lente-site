'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Unit {
  id: string;
  type: keyof typeof UNIT_TYPES;
  health: number;
  maxHealth: number;
  attack: number;
  x: number; // Grid X position (0-9)
  y: number; // Grid Y position (0-4)
  team: 'player' | 'enemy';
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
  // Human units (Blue team)
  soldier: { health: 120, attack: 25, name: 'Soldier', team: 'human', color: '#3b82f6' },
  wizard: { health: 70, attack: 45, name: 'Wizard', team: 'human', color: '#8b5cf6' },
  lancer: { health: 90, attack: 30, name: 'Lancer', team: 'human', color: '#06b6d4' },
  // Orc units (Red team)
  orc: { health: 130, attack: 22, name: 'Orc', team: 'orc', color: '#22c55e' },
  rider: { health: 100, attack: 28, name: 'Rider', team: 'orc', color: '#f59e0b' },
  bear: { health: 160, attack: 20, name: 'Bear', team: 'orc', color: '#84cc16' }
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

  const [selectedUnitType, setSelectedUnitType] = useState<keyof typeof UNIT_TYPES | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const battlefieldRef = useRef<HTMLDivElement>(null);

  // Check if user entered through proper gateway
  useEffect(() => {
    const enteredViaGateway = sessionStorage.getItem('battleEnteredViaGateway');
    if (!enteredViaGateway) {
      // Redirect to normal site if accessed directly
      router.push('/dashboard');
      return;
    }
  }, [router]);

  const isPositionOccupied = (x: number, y: number, team: 'player' | 'enemy') => {
    const units = team === 'player' ? gameState.playerUnits : gameState.enemyUnits;
    return units.some(unit => unit.x === x && unit.y === y);
  };

  const placeUnit = (x: number, y: number) => {
    if (!selectedUnitType || gameState.playerUnits.length >= 8) return;
    if (x >= 5 || isPositionOccupied(x, y, 'player')) return; // Left side only (0-4)

    const unitType = UNIT_TYPES[selectedUnitType];
    const newUnit: Unit = {
      id: `player_${selectedUnitType}_${Date.now()}`,
      type: selectedUnitType,
      health: unitType.health,
      maxHealth: unitType.health,
      attack: unitType.attack,
      x,
      y,
      team: 'player'
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
    const enemyTypes: (keyof typeof UNIT_TYPES)[] = ['orc', 'rider', 'bear'];
    
    // Generate 4-6 random enemy units
    const numUnits = Math.floor(Math.random() * 3) + 4;

    for (let i = 0; i < numUnits; i++) {
      const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const unitType = UNIT_TYPES[randomType];

      // Find random position on right side (x: 5-9, y: 0-4)
      let x, y;
      let attempts = 0;
      do {
        x = Math.floor(Math.random() * 5) + 5; // 5-9
        y = Math.floor(Math.random() * 5); // 0-4
        attempts++;
      } while (isPositionOccupied(x, y, 'enemy') && attempts < 50);

      if (attempts >= 50) continue; // Skip if can't find position

      enemyUnits.push({
        id: `enemy_${randomType}_${i}`,
        type: randomType,
        health: unitType.health,
        maxHealth: unitType.health,
        attack: unitType.attack,
        x,
        y,
        team: 'enemy'
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
    const log: string[] = ['⚔️ Battle begins!', `🔵 Humans deploy ${currentPlayerUnits.length} units`, `🔴 Orcs deploy ${currentEnemyUnits.length} units`];

    const battleInterval = setInterval(() => {
      turn++;

      // Player turn
      if (currentPlayerUnits.length > 0 && currentEnemyUnits.length > 0) {
        const attacker = currentPlayerUnits[Math.floor(Math.random() * currentPlayerUnits.length)];
        const target = currentEnemyUnits[Math.floor(Math.random() * currentEnemyUnits.length)];

        target.health -= attacker.attack;
        log.push(`Turn ${turn}: ${UNIT_TYPES[attacker.type].name} ⚔️ ${UNIT_TYPES[target.type].name} (-${attacker.attack} HP)`);

        if (target.health <= 0) {
          currentEnemyUnits = currentEnemyUnits.filter(u => u.id !== target.id);
          log.push(`💀 ${UNIT_TYPES[target.type].name} defeated!`);
        }
      }

      // Enemy turn
      if (currentPlayerUnits.length > 0 && currentEnemyUnits.length > 0) {
        const attacker = currentEnemyUnits[Math.floor(Math.random() * currentEnemyUnits.length)];
        const target = currentPlayerUnits[Math.floor(Math.random() * currentPlayerUnits.length)];

        target.health -= attacker.attack;
        log.push(`Turn ${turn}: ${UNIT_TYPES[attacker.type].name} ⚔️ ${UNIT_TYPES[target.type].name} (-${attacker.attack} HP)`);

        if (target.health <= 0) {
          currentPlayerUnits = currentPlayerUnits.filter(u => u.id !== target.id);
          log.push(`💀 ${UNIT_TYPES[target.type].name} defeated!`);
        }
      }

      // Check for winner
      if (currentPlayerUnits.length === 0) {
        clearInterval(battleInterval);
        setGameState(prev => ({ ...prev, phase: 'results', winner: 'enemy', battleLog: log, playerUnits: currentPlayerUnits, enemyUnits: currentEnemyUnits }));
        return;
      }

      if (currentEnemyUnits.length === 0) {
        clearInterval(battleInterval);
        setGameState(prev => ({ ...prev, phase: 'results', winner: 'player', battleLog: log, playerUnits: currentPlayerUnits, enemyUnits: currentEnemyUnits }));
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
      if (turn > 30) {
        clearInterval(battleInterval);
        const winner = currentPlayerUnits.length > currentEnemyUnits.length ? 'player' : 
                       currentEnemyUnits.length > currentPlayerUnits.length ? 'enemy' : 'draw';
        setGameState(prev => ({ ...prev, phase: 'results', winner, battleLog: [...log, '⏱️ Time limit reached!'], playerUnits: currentPlayerUnits, enemyUnits: currentEnemyUnits }));
      }
    }, 1000);
  };

  // Render pixel art sprite for units
  const renderUnitSprite = (unit: Unit) => {
    const unitType = UNIT_TYPES[unit.type];
    const hpPercent = (unit.health / unit.maxHealth) * 100;
    
    return (
      <div className="relative w-full h-full">
        {/* Unit sprite - pixel art style */}
        <div 
          className="w-full h-full pixel-sprite flex items-center justify-center text-2xl font-bold"
          style={{ 
            backgroundColor: unitType.color,
            imageRendering: 'pixelated'
          }}
        >
          {unit.type === 'soldier' && '🛡️'}
          {unit.type === 'wizard' && '🧙'}
          {unit.type === 'lancer' && '🗡️'}
          {unit.type === 'orc' && '👹'}
          {unit.type === 'rider' && '🐎'}
          {unit.type === 'bear' && '🐻'}
        </div>
        
        {/* HP bar above unit */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12">
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
  };

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
        <div className="h-16 bg-gray-900 border-b-4 border-yellow-500 flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600/80 px-4 py-2 border-2 border-blue-400 pixel-font text-white text-xs">
              🔵 HUMANS: {gameState.playerUnits.length}
            </div>
          </div>
          
          <div className="text-white pixel-font text-sm">
            ⚔️ BATTLE PHASE ⚔️
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-red-600/80 px-4 py-2 border-2 border-red-400 pixel-font text-white text-xs">
              🔴 ORCS: {gameState.enemyUnits.length}
            </div>
          </div>
        </div>

        {/* Battlefield Grid */}
        <div className="relative h-[600px]">
          <div className="absolute inset-0 flex">
            {/* Left side - Player territory (cool green) */}
            <div className="w-1/2 grass-left relative border-r-4 border-yellow-600">
              {gameState.playerUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="absolute battle-shake"
                  style={{
                    left: `${(unit.x * 20) + 10}%`,
                    top: `${(unit.y * 20) + 10}%`,
                    width: '60px',
                    height: '60px'
                  }}
                >
                  {renderUnitSprite(unit)}
                </div>
              ))}
            </div>
            
            {/* Right side - Enemy territory (warm olive) */}
            <div className="w-1/2 grass-right relative">
              {gameState.enemyUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="absolute battle-shake"
                  style={{
                    left: `${((unit.x - 5) * 20) + 10}%`,
                    top: `${(unit.y * 20) + 10}%`,
                    width: '60px',
                    height: '60px'
                  }}
                >
                  {renderUnitSprite(unit)}
                </div>
              ))}
            </div>
          </div>
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
      <div className="h-16 bg-gray-900 border-b-4 border-yellow-500 flex items-center justify-between px-8">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600/80 px-4 py-2 border-2 border-blue-400 pixel-font text-white text-xs">
            🛡️ SOLDIER | 🧙 WIZARD | 🗡️ LANCER
          </div>
        </div>
        
        <div className="text-white pixel-font text-sm">
          ⚔️ SETUP PHASE ⚔️
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-red-600/80 px-4 py-2 border-2 border-red-400 pixel-font text-white text-xs">
            👹 ORC | 🐎 RIDER | 🐻 BEAR
          </div>
        </div>
      </div>

      {/* Unit Selection Panel */}
      <div className="flex justify-center py-6 space-x-6">
        {(['soldier', 'wizard', 'lancer'] as const).map((unitType) => {
          const unit = UNIT_TYPES[unitType];
          return (
            <div
              key={unitType}
              onClick={() => setSelectedUnitType(unitType)}
              className={`unit-card w-32 h-40 p-4 flex flex-col items-center justify-center ${
                selectedUnitType === unitType ? 'selected' : ''
              }`}
              style={{ backgroundColor: unit.color }}
            >
              <div className="text-4xl mb-2">
                {unitType === 'soldier' && '🛡️'}
                {unitType === 'wizard' && '🧙'}
                {unitType === 'lancer' && '🗡️'}
              </div>
              <div className="text-white pixel-font text-xs text-center">
                {unit.name.toUpperCase()}
              </div>
              <div className="text-white pixel-font text-xs mt-2">
                HP: {unit.health}
              </div>
              <div className="text-white pixel-font text-xs">
                ATK: {unit.attack}
              </div>
            </div>
          );
        })}
      </div>

      {/* Battlefield Grid */}
      <div className="relative mx-auto" style={{ width: '800px', height: '400px' }}>
        <div className="absolute inset-0 flex">
          {/* Left side - Player territory (cool green) */}
          <div className="w-1/2 grass-left relative border-r-4 border-yellow-600">
            <div className="grid grid-cols-5 grid-rows-5 w-full h-full">
              {Array.from({ length: 5 }).map((_, y) =>
                Array.from({ length: 5 }).map((_, x) => {
                  const unit = gameState.playerUnits.find(u => u.x === x && u.y === y);
                  return (
                    <div
                      key={`${x}-${y}`}
                      className="grid-cell relative"
                      onClick={() => !unit && placeUnit(x, y)}
                      onMouseEnter={() => setHoveredCell({ x, y })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {unit && (
                        <div 
                          className="w-full h-full pixel-sprite flex items-center justify-center text-2xl"
                          style={{ backgroundColor: UNIT_TYPES[unit.type].color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeUnit(unit.id);
                          }}
                        >
                          {unit.type === 'soldier' && '🛡️'}
                          {unit.type === 'wizard' && '🧙'}
                          {unit.type === 'lancer' && '🗡️'}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Right side - Enemy territory (warm olive) - Preview */}
          <div className="w-1/2 grass-right relative flex items-center justify-center">
            <div className="text-gray-800 pixel-font text-xs text-center opacity-50">
              ENEMY UNITS<br/>WILL SPAWN HERE
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center mt-8 space-x-6">
        <div className="bg-blue-600/80 px-6 py-3 border-2 border-blue-400 pixel-font text-white text-xs">
          UNITS: {gameState.playerUnits.length}/8
        </div>
        
        <button
          onClick={startBattle}
          disabled={gameState.playerUnits.length === 0}
          className={`px-8 py-3 border-4 pixel-font text-sm transition-all duration-200 ${
            gameState.playerUnits.length === 0
              ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-500 text-white border-green-400 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          START BATTLE!
        </button>

        <button
          onClick={resetGame}
          className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white border-4 border-red-400 pixel-font text-sm transition-colors duration-200"
        >
          CLEAR ALL
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center mt-6">
        <p className="text-gray-400 pixel-font text-xs">
          SELECT A UNIT TYPE, THEN CLICK ON THE LEFT BATTLEFIELD TO PLACE IT
        </p>
      </div>
    </div>
  );
}
