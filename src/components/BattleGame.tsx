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
    const positions = [0, 1, 2, 3, 4];

    // Generate 3-5 random enemy units
    const numUnits = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numUnits; i++) {
      const types = Object.keys(UNIT_TYPES) as Array<keyof typeof UNIT_TYPES>;
      const randomType = types[Math.floor(Math.random() * types.length)];
      const unitType = UNIT_TYPES[randomType];

      const availablePositions = positions.filter(pos =>
        !enemyUnits.some(unit => unit.position === pos)
      );
      const position = availablePositions[Math.floor(Math.random() * availablePositions.length)];

      enemyUnits.push({
        id: `enemy_${randomType}_${i}`,
        type: randomType,
        health: unitType.health,
        maxHealth: unitType.health,
        attack: unitType.attack,
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Please log in to play</h1>
          <button
            onClick={() => router.push('/login')}
            className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'setup') {
    return (
      <div className="min-h-screen bg-background">
        {/* Top Bar */}
        <div className="bg-surface-primary border-b border-divider px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-accent rounded-full"></div>
                <span className="font-semibold text-primary">Player Army</span>
              </div>
              <span className="text-secondary">vs</span>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-error rounded-full"></div>
                <span className="font-semibold text-primary">Enemy Army</span>
              </div>
            </div>
            <button
              onClick={exitToSite}
              className="bg-surface-secondary hover:bg-surface-primary text-secondary px-4 py-2 rounded-lg border border-divider transition-colors duration-200"
            >
              Exit to Site
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Battle Setup Phase</h1>
            <p className="text-secondary">Build your army and prepare for battle!</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Unit Selection */}
            <div className="bg-surface-primary rounded-xl border border-divider p-6">
              <h2 className="text-xl font-bold text-primary mb-4">Select Unit</h2>
              <div className="space-y-3">
                {Object.entries(UNIT_TYPES).map(([type, stats]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedUnitType(type as keyof typeof UNIT_TYPES)}
                    className={`w-full p-3 rounded-lg border transition-colors duration-200 ${
                      selectedUnitType === type
                        ? 'border-accent bg-accent/10'
                        : 'border-divider hover:border-accent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">{stats.name}</span>
                      <div className="text-sm text-secondary">
                        ❤️ {stats.health} ⚔️ {stats.attack}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Battlefield Preview */}
            <div className="lg:col-span-2">
              <div className="bg-surface-primary rounded-xl border border-divider p-6 mb-6">
                <h2 className="text-xl font-bold text-primary mb-4">Battlefield</h2>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {/* Player side (bottom) */}
                  {Array.from({ length: 5 }, (_, i) => {
                    const unit = gameState.playerUnits.find(u => u.position === i);
                    return (
                      <div
                        key={`player-${i}`}
                        onClick={() => placingUnit ? addUnit(i) : null}
                        className={`aspect-square border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                          placingUnit
                            ? 'border-accent bg-accent/10 hover:bg-accent/20'
                            : unit
                            ? 'border-accent bg-accent/20'
                            : 'border-divider hover:border-accent'
                        }`}
                      >
                        {unit && (
                          <div className="text-center">
                            <div className="text-xs font-bold text-primary">
                              {UNIT_TYPES[unit.type].name.charAt(0)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeUnit(unit.id);
                              }}
                              className="text-xs text-error hover:text-error mt-1"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mb-4">
                  <div className="w-full h-2 bg-divider rounded-full mb-2"></div>
                  <span className="text-sm text-secondary">Battle Line</span>
                  <div className="w-full h-2 bg-divider rounded-full mt-2"></div>
                </div>

                {/* Enemy side (top) - preview */}
                <div className="grid grid-cols-5 gap-2 opacity-50">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={`enemy-${i}`}
                      className="aspect-square border-2 border-error/30 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-xs text-error">?</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setPlacingUnit(!placingUnit)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                      placingUnit
                        ? 'bg-accent text-white'
                        : 'bg-surface-secondary text-primary hover:bg-surface-primary border border-divider'
                    }`}
                  >
                    {placingUnit ? 'Cancel Placement' : 'Place Unit'}
                  </button>
                  <span className="text-secondary">
                    Units: {gameState.playerUnits.length}/5
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={resetGame}
                    className="bg-surface-secondary hover:bg-surface-primary text-secondary px-6 py-3 rounded-lg border border-divider transition-colors duration-200"
                  >
                    Reset
                  </button>
                  <button
                    onClick={startBattle}
                    disabled={gameState.playerUnits.length === 0}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      gameState.playerUnits.length === 0
                        ? 'bg-disabled text-muted cursor-not-allowed'
                        : 'bg-success hover:bg-success text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    Start Battle!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'battle') {
    return (
      <div className="min-h-screen bg-background">
        {/* Top Bar */}
        <div className="bg-surface-primary border-b border-divider px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-accent rounded-full"></div>
                <span className="font-semibold text-primary">Player Army ({gameState.playerUnits.length})</span>
              </div>
              <span className="text-secondary">vs</span>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-error rounded-full"></div>
                <span className="font-semibold text-primary">Enemy Army ({gameState.enemyUnits.length})</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-secondary">Turn: {gameState.turn}</span>
              <button
                onClick={resetGame}
                className="bg-surface-secondary hover:bg-surface-primary text-secondary px-4 py-2 rounded-lg border border-divider transition-colors duration-200"
              >
                Exit Battle
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Battlefield */}
            <div className="lg:col-span-2">
              <div className="bg-surface-primary rounded-xl border border-divider p-6">
                <h2 className="text-xl font-bold text-primary mb-6 text-center">Battle in Progress</h2>

                {/* Player side */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                    <div className="w-3 h-3 bg-accent rounded-full mr-2"></div>
                    Your Army
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 5 }, (_, i) => {
                      const unit = gameState.playerUnits.find(u => u.position === i);
                      return (
                        <div
                          key={`player-${i}`}
                          className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center ${
                            unit ? 'border-accent bg-accent/10' : 'border-divider'
                          }`}
                        >
                          {unit && (
                            <div className="text-center">
                              <div className="text-xs font-bold text-primary">
                                {UNIT_TYPES[unit.type].name.charAt(0)}
                              </div>
                              <div className="text-xs text-success">
                                ❤️ {unit.health}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="w-full h-4 bg-divider rounded-full flex items-center justify-center">
                    <div className="text-xs text-secondary bg-background px-2 py-1 rounded">⚔️ BATTLE ⚔️</div>
                  </div>
                </div>

                {/* Enemy side */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                    <div className="w-3 h-3 bg-error rounded-full mr-2"></div>
                    Enemy Army
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 5 }, (_, i) => {
                      const unit = gameState.enemyUnits.find(u => u.position === i);
                      return (
                        <div
                          key={`enemy-${i}`}
                          className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center ${
                            unit ? 'border-error bg-error/10' : 'border-divider'
                          }`}
                        >
                          {unit && (
                            <div className="text-center">
                              <div className="text-xs font-bold text-primary">
                                {UNIT_TYPES[unit.type].name.charAt(0)}
                              </div>
                              <div className="text-xs text-error">
                                ❤️ {unit.health}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Battle Log */}
            <div className="bg-surface-primary rounded-xl border border-divider p-6">
              <h3 className="text-lg font-bold text-primary mb-4">Battle Log</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {gameState.battleLog.slice(-10).map((log, index) => (
                  <div key={index} className="text-sm text-secondary p-2 bg-surface-secondary rounded">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'results') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-surface-primary rounded-xl border border-divider p-8 text-center">
            <div className="mb-6">
              {gameState.winner === 'player' && (
                <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🏆</span>
                </div>
              )}
              {gameState.winner === 'enemy' && (
                <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">💀</span>
                </div>
              )}
              {gameState.winner === 'draw' && (
                <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🤝</span>
                </div>
              )}

              <h1 className="text-2xl font-bold text-primary mb-2">
                {gameState.winner === 'player' && 'Victory!'}
                {gameState.winner === 'enemy' && 'Defeat!'}
                {gameState.winner === 'draw' && 'Draw!'}
              </h1>

              <p className="text-secondary">
                Battle lasted {gameState.turn} turns
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={resetGame}
                className="w-full bg-accent hover:bg-accent-hover text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
              >
                Play Again
              </button>

              <button
                onClick={exitToSite}
                className="w-full bg-surface-secondary hover:bg-surface-primary text-primary py-3 px-6 rounded-lg border border-divider transition-colors duration-200"
              >
                Return to Site
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}