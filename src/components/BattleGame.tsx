'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Unit {
  id: string;
  type: 'warrior' | 'archer' | 'mage';
  health: number;
  maxHealth: number;
  attack: number;
  position: number; // 0-4 grid position
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
  warrior: { health: 100, attack: 20, name: 'Warrior' },
  archer: { health: 70, attack: 30, name: 'Archer' },
  mage: { health: 60, attack: 40, name: 'Mage' }
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

  const [selectedUnitType, setSelectedUnitType] = useState<'warrior' | 'archer' | 'mage'>('warrior');
  const [placingUnit, setPlacingUnit] = useState(false);

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
    if (gameState.playerUnits.length >= 5) return;

    const unitType = UNIT_TYPES[selectedUnitType];
    const newUnit: Unit = {
      id: `${selectedUnitType}_${Date.now()}`,
      type: selectedUnitType,
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

      // Slow down the battle for visibility
      if (turn > 20) { // Prevent infinite battles
        clearInterval(battleInterval);
        setGameState(prev => ({ ...prev, phase: 'results', winner: 'draw', battleLog: log }));
      }
    }, 800);
  };

  const resetGame = () => {
    // Clear gateway flag and return to normal site
    sessionStorage.removeItem('battleEnteredViaGateway');
    router.push('/dashboard');
  };

  const exitToSite = () => {
    sessionStorage.removeItem('battleEnteredViaGateway');
    router.push('/dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex items-center justify-center">
        <style jsx>{`
          .pixel-font {
            font-family: 'Courier New', monospace;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.8);
            image-rendering: pixelated;
          }
        `}</style>

        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-4 border-red-400 p-8 text-center pixel-border shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-400">
            <span className="text-4xl">🚫</span>
          </div>

          <h1 className="text-3xl font-bold text-red-400 pixel-font mb-4">LOGIN REQUIRED</h1>
          <p className="text-gray-300 pixel-font mb-6">
            You must be logged in to battle!
          </p>

          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-4 rounded-lg border-2 border-blue-400 font-bold pixel-font transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🔐 LOGIN TO BATTLE 🔐
          </button>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-green-300 overflow-hidden">
        {/* Retro pixel styling */}
        <style jsx>{`
          .pixel-font {
            font-family: 'Courier New', monospace;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.8);
            image-rendering: pixelated;
          }
          .grass-texture {
            background-image:
              radial-gradient(circle at 20% 80%, rgba(34, 139, 34, 0.3) 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, rgba(34, 139, 34, 0.2) 1px, transparent 1px),
              radial-gradient(circle at 40% 40%, rgba(34, 139, 34, 0.1) 2px, transparent 2px);
            background-size: 40px 40px, 60px 60px, 80px 80px;
          }
          .pixel-border {
            box-shadow: inset 0 0 0 2px rgba(255,255,255,0.3);
          }
        `}</style>

        {/* Top UI Bar */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-b-4 border-yellow-400 px-6 py-4 text-center">
          <h1 className="text-4xl font-bold text-white pixel-font mb-2">SETUP PHASE</h1>
          <p className="text-yellow-200 pixel-font text-sm">
            Press SPACE to start battle, or drag more characters
          </p>
        </div>

        <div className="flex">
          {/* Left Team Panel - HUMANS */}
          <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 p-4 border-r-4 border-blue-300">
            <h2 className="text-2xl font-bold text-white pixel-font mb-4 text-center">HUMANS</h2>
            <div className="space-y-2">
              {Object.entries(UNIT_TYPES).map(([type, stats]) => (
                <button
                  key={type}
                  onClick={() => setSelectedUnitType(type as keyof typeof UNIT_TYPES)}
                  className={`w-full p-3 rounded border-2 transition-all duration-200 pixel-border ${
                    selectedUnitType === type
                      ? 'border-yellow-400 bg-blue-400 shadow-lg scale-105'
                      : 'border-blue-300 bg-blue-500 hover:bg-blue-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-400 rounded border-2 border-gray-600 flex items-center justify-center">
                      <span className="text-2xl">
                        {type === 'warrior' ? '⚔️' : type === 'archer' ? '🏹' : '🔮'}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold pixel-font text-sm">{stats.name}</div>
                      <div className="text-blue-200 text-xs pixel-font">
                        ❤️ {stats.health} ⚔️ {stats.attack}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Battlefield */}
          <div className="flex-1 relative">
            {/* Grass battlefield */}
            <div className="h-full min-h-[600px] grass-texture relative">
              {/* Center divider line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-yellow-400 to-transparent opacity-60"></div>

              {/* Battlefield for unit placement */}
              <div className="absolute inset-0 p-8">
                <div className="h-full flex items-center justify-center">
                  {/* Player deployment zone */}
                  <div className="w-1/2 h-full border-r-2 border-yellow-400/50 relative">
                    <div className="absolute top-4 left-4 text-blue-300 pixel-font text-sm">
                      HUMAN DEPLOYMENT ZONE
                    </div>

                    {/* Simple placement areas */}
                    <div className="h-full flex flex-col justify-center space-y-4 px-8">
                      {Array.from({ length: 5 }, (_, i) => {
                        const unit = gameState.playerUnits.find(u => u.position === i);

                        return (
                          <div
                            key={`player-zone-${i}`}
                            onClick={() => placingUnit ? addUnit(i) : null}
                            className={`h-16 border-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center ${
                              placingUnit
                                ? 'border-blue-400 bg-blue-200/30 hover:bg-blue-300/50'
                                : unit
                                ? 'border-blue-500 bg-blue-300/20'
                                : 'border-blue-300/50 hover:border-blue-400'
                            }`}
                          >
                            {unit && (
                              <div className="flex items-center space-x-4 relative w-full px-4">
                                <div className="text-3xl">
                                  {unit.type === 'warrior' ? '⚔️' : unit.type === 'archer' ? '🏹' : '🔮'}
                                </div>
                                <div className="flex-1">
                                  <div className="text-white pixel-font text-sm font-bold">
                                    {UNIT_TYPES[unit.type].name}
                                  </div>
                                  <div className="w-full h-2 bg-gray-700 rounded-full mt-1">
                                    <div
                                      className="h-full bg-red-500 rounded-full transition-all duration-300"
                                      style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeUnit(unit.id);
                                  }}
                                  className="w-6 h-6 bg-red-500 rounded-full text-white text-xs hover:bg-red-600 flex items-center justify-center pixel-font"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enemy preview zone */}
                  <div className="w-1/2 h-full relative">
                    <div className="absolute top-4 right-4 text-red-300 pixel-font text-sm text-right">
                      ORC THREAT ZONE
                    </div>

                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full border-4 border-red-400 flex items-center justify-center mb-4 pixel-border">
                          <span className="text-4xl">👹</span>
                        </div>
                        <div className="text-red-300 pixel-font text-lg">
                          UNKNOWN ENEMY FORCES
                        </div>
                        <div className="text-red-400 pixel-font text-sm mt-2">
                          3-5 UNITS APPROACHING
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Units display */}
              <div className="absolute inset-0 p-8 pointer-events-none">
                {gameState.playerUnits.map((unit, index) => {
                  // Position units organically on the left side during setup
                  const baseX = 15 + (index * 12); // Spread across left side
                  const baseY = 30 + (Math.sin(Date.now() / 2000 + index) * 8); // Gentle bobbing

                  return (
                    <div
                      key={unit.id}
                      className="absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                      style={{
                        left: `${baseX}%`,
                        top: `${baseY}%`,
                        animationDuration: '2s',
                        animationDelay: `${index * 0.2}s`
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-blue-300 flex items-center justify-center shadow-lg pixel-border">
                        <span className="text-2xl animate-bounce">
                          {unit.type === 'warrior' ? '⚔️' : unit.type === 'archer' ? '🏹' : '🔮'}
                        </span>
                      </div>
                      {/* HP bar above head */}
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="w-6 h-1 bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-red-500 rounded-full transition-all duration-300"
                            style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-6">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => setPlacingUnit(!placingUnit)}
                    className={`px-6 py-3 rounded border-2 font-bold pixel-font transition-all duration-200 ${
                      placingUnit
                        ? 'bg-yellow-400 text-black border-yellow-300 shadow-lg'
                        : 'bg-gray-700 text-white border-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    {placingUnit ? 'CANCEL PLACEMENT' : 'PLACE UNIT'}
                  </button>
                  <div className="text-white pixel-font">
                    UNITS: {gameState.playerUnits.length}/5
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded border-2 border-red-400 font-bold pixel-font transition-colors duration-200"
                  >
                    RESET
                  </button>
                  <button
                    onClick={startBattle}
                    disabled={gameState.playerUnits.length === 0}
                    className={`px-8 py-3 rounded border-2 font-bold pixel-font transition-all duration-200 ${
                      gameState.playerUnits.length === 0
                        ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-500 text-white border-green-400 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    START BATTLE!
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Team Panel - ORCS */}
          <div className="w-64 bg-gradient-to-b from-red-600 to-red-800 p-4 border-l-4 border-red-300">
            <h2 className="text-2xl font-bold text-white pixel-font mb-4 text-center">ORCS</h2>
            <div className="space-y-2">
              {/* Enemy unit previews */}
              <div className="p-3 rounded border-2 border-red-300 bg-red-500/50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded border-2 border-red-500 flex items-center justify-center">
                    <span className="text-2xl">⚔️</span>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold pixel-font text-sm">WARRIOR</div>
                    <div className="text-red-200 text-xs pixel-font">❤️ ?? ⚔️ ??</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded border-2 border-red-300 bg-red-500/50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded border-2 border-red-500 flex items-center justify-center">
                    <span className="text-2xl">🏹</span>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold pixel-font text-sm">ARCHER</div>
                    <div className="text-red-200 text-xs pixel-font">❤️ ?? ⚔️ ??</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded border-2 border-red-300 bg-red-500/50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded border-2 border-red-500 flex items-center justify-center">
                    <span className="text-2xl">🐎</span>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold pixel-font text-sm">RIDER</div>
                    <div className="text-red-200 text-xs pixel-font">❤️ ?? ⚔️ ??</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded border-2 border-red-300 bg-red-500/50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded border-2 border-red-500 flex items-center justify-center">
                    <span className="text-2xl">🐻</span>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold pixel-font text-sm">BEAR</div>
                    <div className="text-red-200 text-xs pixel-font">❤️ ?? ⚔️ ??</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exit button */}
            <button
              onClick={exitToSite}
              className="absolute top-4 right-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-500 font-bold pixel-font transition-colors duration-200"
            >
              EXIT
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'battle') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-green-300 overflow-hidden">
        {/* Retro pixel styling */}
        <style jsx>{`
          .pixel-font {
            font-family: 'Courier New', monospace;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.8);
            image-rendering: pixelated;
          }
          .grass-texture {
            background-image:
              radial-gradient(circle at 20% 80%, rgba(34, 139, 34, 0.3) 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, rgba(34, 139, 34, 0.2) 1px, transparent 1px),
              radial-gradient(circle at 40% 40%, rgba(34, 139, 34, 0.1) 2px, transparent 2px);
            background-size: 40px 40px, 60px 60px, 80px 80px;
          }
          .battle-flash {
            animation: battleFlash 0.5s ease-in-out;
          }
          @keyframes battleFlash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>

        {/* Top UI Bar */}
        <div className="bg-gradient-to-b from-red-800 to-red-900 border-b-4 border-red-400 px-6 py-4 text-center">
          <h1 className="text-4xl font-bold text-yellow-300 pixel-font mb-2 battle-flash">BATTLE IN PROGRESS</h1>
          <p className="text-white pixel-font text-sm">
            Turn {gameState.turn} | Humans {gameState.playerUnits.length} vs {gameState.enemyUnits.length} Orcs
          </p>
        </div>

        <div className="flex">
          {/* Battlefield - Full Width */}
          <div className="flex-1 relative">
            {/* Grass battlefield */}
            <div className="h-full min-h-[600px] grass-texture relative">
              {/* Center divider line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-transparent via-red-500 to-transparent opacity-80"></div>

              {/* Units on battlefield */}
              <div className="absolute inset-0 p-8">
                {/* Player units (left side) */}
                {gameState.playerUnits.map((unit, index) => {
                  const baseX = 20 + (index * 15); // Spread across left side
                  const baseY = 40 + (Math.sin(Date.now() / 1000 + index) * 5); // Slight bobbing

                  return (
                    <div
                      key={unit.id}
                      className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                      style={{
                        left: `${baseX}%`,
                        top: `${baseY}%`,
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-3 border-blue-300 flex items-center justify-center shadow-lg pixel-border">
                        <span className="text-3xl animate-bounce">
                          {unit.type === 'warrior' ? '⚔️' : unit.type === 'archer' ? '🏹' : '🔮'}
                        </span>
                      </div>
                      {/* HP bar */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-2 bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      {/* Damage effects */}
                      {unit.health < unit.maxHealth && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                          <div className="absolute top-2 right-2 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Enemy units (right side) */}
                {gameState.enemyUnits.map((unit, index) => {
                  const baseX = 80 - (index * 15); // Spread across right side
                  const baseY = 40 + (Math.sin(Date.now() / 1000 + index + Math.PI) * 5); // Opposite bobbing

                  return (
                    <div
                      key={unit.id}
                      className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                      style={{
                        left: `${baseX}%`,
                        top: `${baseY}%`,
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 rounded-full border-3 border-red-300 flex items-center justify-center shadow-lg pixel-border">
                        <span className="text-3xl animate-bounce">
                          {unit.type === 'warrior' ? '⚔️' : unit.type === 'archer' ? '🏹' : '🐎'}
                        </span>
                      </div>
                      {/* HP bar */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-2 bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      {/* Damage effects */}
                      {unit.health < unit.maxHealth && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                          <div className="absolute top-2 right-2 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Combat effects */}
                {gameState.battleLog.length > 0 && gameState.battleLog[gameState.battleLog.length - 1].includes('attacks') && (
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="text-6xl animate-bounce text-yellow-400">💥</div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom battle log */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-4">
              <div className="max-w-4xl mx-auto">
                <div className="bg-black/70 rounded border-2 border-gray-600 p-4 max-h-32 overflow-y-auto">
                  <h3 className="text-white pixel-font text-sm mb-2">BATTLE LOG</h3>
                  <div className="space-y-1">
                    {gameState.battleLog.slice(-5).map((log, index) => (
                      <div key={index} className="text-green-400 pixel-font text-xs">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center mt-4">
                  <button
                    onClick={resetGame}
                    className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded border-2 border-red-400 font-bold pixel-font transition-colors duration-200"
                  >
                    EXIT BATTLE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex items-center justify-center overflow-hidden">
        {/* Retro pixel styling */}
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
          .explosion {
            animation: explosion 1s ease-out;
          }
          @keyframes explosion {
            0% { transform: scale(0); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(2); opacity: 0; }
          }
        `}</style>

        {/* Animated particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-lg w-full mx-4 relative z-10">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-4 border-yellow-400 p-8 text-center pixel-border shadow-2xl">
            <div className="mb-8">
              {gameState.winner === 'player' && (
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 victory-glow border-4 border-yellow-300">
                    <span className="text-5xl animate-bounce">🏆</span>
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-ping opacity-20"></div>
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
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-4 px-8 rounded-lg border-2 border-green-400 font-bold pixel-font transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🗡️ PLAY AGAIN 🗡️
              </button>

              <button
                onClick={exitToSite}
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