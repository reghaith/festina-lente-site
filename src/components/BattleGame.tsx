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

  return null;
}
