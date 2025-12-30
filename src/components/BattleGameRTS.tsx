'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { soundManager } from '@/lib/sound-manager';

// ==================== TYPES ====================
type Formation = 'line' | 'box' | 'wedge' | 'free';
type AbilityType = 'charge' | 'volley' | 'shield';
type GamePhase = 'start' | 'setup' | 'battle' | 'victory' | 'defeat';

interface Unit {
  id: string;
  type: 'infantry' | 'archer' | 'tank';
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  attackSpeed: number;
  speed: number;
  baseSpeed: number;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  team: 'blue' | 'red';
  lastAttackTime: number;
  isAttacking: boolean;
  isSelected: boolean;
  abilityType: AbilityType;
  abilityCooldown: number;
  abilityActive: boolean;
  abilityDuration: number;
  damageFlash: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface GameState {
  phase: GamePhase;
  playerUnits: Unit[];
  enemyUnits: Unit[];
  playerGold: number;
  formation: Formation;
  particles: Particle[];
  screenShake: number;
  winner: 'player' | 'enemy' | 'draw' | null;
}

// ==================== CONSTANTS ====================
const BATTLEFIELD_WIDTH = 1000;
const BATTLEFIELD_HEIGHT = 600;
const UNIT_SIZE = 40;
const COLLISION_DISTANCE = 45;

const UNIT_TYPES = {
  infantry: { 
    health: 120, attack: 20, defense: 5, attackSpeed: 1000, speed: 2.5,
    name: 'Infantry', cost: 10, ability: 'charge' as AbilityType, abilityCooldown: 10000
  },
  archer: { 
    health: 80, attack: 30, defense: 2, attackSpeed: 800, speed: 2,
    name: 'Archer', cost: 20, ability: 'volley' as AbilityType, abilityCooldown: 12000
  },
  tank: { 
    health: 200, attack: 15, defense: 10, attackSpeed: 1500, speed: 1.5,
    name: 'Tank', cost: 30, ability: 'shield' as AbilityType, abilityCooldown: 15000
  }
};

const ABILITY_EFFECTS = {
  charge: { speedBoost: 2, attackBoost: 15, duration: 3000 },
  volley: { areaRadius: 100, damage: 40, duration: 500 },
  shield: { defenseBoost: 20, damageReduction: 0.5, duration: 5000 }
};

// ==================== AUDIO MANAGER ====================
// Note: Using our custom sound manager from @/lib/sound-manager
// which handles unit placement sounds with overlap prevention

export function BattleGameRTS() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [gameState, setGameState] = useState<GameState>({
    phase: 'start',
    playerUnits: [],
    enemyUnits: [],
    playerGold: 150,
    formation: 'free',
    particles: [],
    screenShake: 0,
    winner: null
  });

  const [selectedUnitType, setSelectedUnitType] = useState<'infantry' | 'archer' | 'tank' | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const animationFrameRef = useRef<number | null>(null);
  const battlefieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const enteredViaGateway = sessionStorage.getItem('battleEnteredViaGateway');
    if (!enteredViaGateway) {
      router.push('/dashboard');
      return;
    }
    // Cleanup sound manager on unmount
    return () => soundManager.stopAllSounds();
  }, [router]);

  // ==================== HELPER FUNCTIONS ====================
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => 
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

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

  const createParticles = (x: number, y: number, color: string, count: number = 5) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      particles.push({
        id: `p_${Date.now()}_${i}`,
        x, y,
        vx: Math.cos(angle) * (2 + Math.random() * 2),
        vy: Math.sin(angle) * (2 + Math.random() * 2),
        life: 1,
        color
      });
    }
    return particles;
  };

  const calculateFormationPosition = (index: number, total: number, formation: Formation, centerX: number, centerY: number) => {
    const spacing = 60;
    switch (formation) {
      case 'line':
        return { x: centerX + (index - total / 2) * spacing, y: centerY };
      case 'box':
        const cols = Math.ceil(Math.sqrt(total));
        const row = Math.floor(index / cols);
        const col = index % cols;
        return {
          x: centerX + (col - cols / 2) * spacing,
          y: centerY + (row - Math.floor(total / cols) / 2) * spacing
        };
      case 'wedge':
        const wedgeRow = Math.floor(Math.sqrt(index * 2));
        const wedgeCol = index - (wedgeRow * (wedgeRow + 1)) / 2;
        return {
          x: centerX + (wedgeCol - wedgeRow / 2) * spacing,
          y: centerY + wedgeRow * spacing
        };
      case 'free':
      default:
        return null;
    }
  };

  // ==================== UNIT MANAGEMENT ====================
  const placeUnit = (x: number, y: number) => {
    if (!selectedUnitType || gameState.phase !== 'setup') return;
    const unitType = UNIT_TYPES[selectedUnitType];
    if (gameState.playerGold < unitType.cost || x > BATTLEFIELD_WIDTH / 2) return;

    const newUnit: Unit = {
      id: `blue_${Date.now()}_${Math.random()}`,
      type: selectedUnitType,
      health: unitType.health,
      maxHealth: unitType.health,
      attack: unitType.attack,
      defense: unitType.defense,
      attackSpeed: unitType.attackSpeed,
      speed: unitType.speed,
      baseSpeed: unitType.speed,
      x, y,
      team: 'blue',
      lastAttackTime: 0,
      isAttacking: false,
      isSelected: false,
      abilityType: unitType.ability,
      abilityCooldown: 0,
      abilityActive: false,
      abilityDuration: 0,
      damageFlash: 0
    };

    // Play unit placement sound based on unit type
    soundManager.playPlacementSound(selectedUnitType);
    
    setGameState(prev => ({
      ...prev,
      playerUnits: [...prev.playerUnits, newUnit],
      playerGold: prev.playerGold - unitType.cost
    }));
  };

  const removeUnit = (unitId: string) => {
    if (gameState.phase !== 'setup') return;
    const unit = gameState.playerUnits.find(u => u.id === unitId);
    if (!unit) return;
    const unitType = UNIT_TYPES[unit.type];
    setGameState(prev => ({
      ...prev,
      playerUnits: prev.playerUnits.filter(u => u.id !== unitId),
      playerGold: prev.playerGold + unitType.cost
    }));
  };

  const selectUnits = (x1: number, y1: number, x2: number, y2: number) => {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    setGameState(prev => ({
      ...prev,
      playerUnits: prev.playerUnits.map(unit => ({
        ...unit,
        isSelected: unit.x >= minX && unit.x <= maxX && unit.y >= minY && unit.y <= maxY
      }))
    }));
  };

  const moveSelectedUnits = (targetX: number, targetY: number) => {
    setGameState(prev => {
      const selectedUnits = prev.playerUnits.filter(u => u.isSelected);
      if (selectedUnits.length === 0) return prev;
      const centerX = selectedUnits.reduce((sum, u) => sum + u.x, 0) / selectedUnits.length;
      const centerY = selectedUnits.reduce((sum, u) => sum + u.y, 0) / selectedUnits.length;
      const updatedUnits = prev.playerUnits.map(unit => {
        if (!unit.isSelected) return unit;
        return {
          ...unit,
          targetX: targetX + (unit.x - centerX),
          targetY: targetY + (unit.y - centerY)
        };
      });
      return { ...prev, playerUnits: updatedUnits };
    });
  };

  const applyFormation = (formation: Formation) => {
    setGameState(prev => {
      const selectedUnits = prev.playerUnits.filter(u => u.isSelected);
      if (selectedUnits.length === 0) return prev;
      const centerX = selectedUnits.reduce((sum, u) => sum + u.x, 0) / selectedUnits.length;
      const centerY = selectedUnits.reduce((sum, u) => sum + u.y, 0) / selectedUnits.length;
      const updatedUnits = prev.playerUnits.map(unit => {
        if (!unit.isSelected) return unit;
        const index = selectedUnits.indexOf(unit);
        const formationPos = calculateFormationPosition(index, selectedUnits.length, formation, centerX, centerY);
        if (formationPos) {
          return { ...unit, targetX: formationPos.x, targetY: formationPos.y };
        }
        return unit;
      });
      return { ...prev, playerUnits: updatedUnits, formation };
    });
  };

  const activateAbility = (abilityType: AbilityType) => {
    setGameState(prev => {
      const updatedUnits = prev.playerUnits.map(unit => {
        if (!unit.isSelected || unit.abilityType !== abilityType || unit.abilityCooldown > 0) return unit;
        const effect = ABILITY_EFFECTS[abilityType];
        const unitConfig = UNIT_TYPES[unit.type];
        
        let newSpeed = unit.speed, newAttack = unit.attack, newDefense = unit.defense;
        if (abilityType === 'charge' && 'speedBoost' in effect) {
          newSpeed = unit.baseSpeed + effect.speedBoost;
          newAttack = unit.attack + effect.attackBoost;
        } else if (abilityType === 'shield' && 'defenseBoost' in effect) {
          newDefense = unit.defense + effect.defenseBoost;
        }

        return {
          ...unit,
          abilityActive: true,
          abilityDuration: effect.duration,
          abilityCooldown: unitConfig.abilityCooldown,
          speed: newSpeed,
          attack: newAttack,
          defense: newDefense
        };
      });
      return { ...prev, playerUnits: updatedUnits };
    });
  };

  const generateEnemyUnits = () => {
    const enemyUnits: Unit[] = [];
    const enemyTypes: ('infantry' | 'archer' | 'tank')[] = ['infantry', 'archer', 'tank'];
    let remainingGold = 150;
    
    while (remainingGold >= 10 && enemyUnits.length < 10) {
      const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const unitType = UNIT_TYPES[randomType];
      if (unitType.cost <= remainingGold) {
        const x = BATTLEFIELD_WIDTH / 2 + 50 + Math.random() * (BATTLEFIELD_WIDTH / 2 - UNIT_SIZE - 100);
        const y = 50 + Math.random() * (BATTLEFIELD_HEIGHT - UNIT_SIZE - 100);
        enemyUnits.push({
          id: `red_${Date.now()}_${Math.random()}`,
          type: randomType,
          health: unitType.health,
          maxHealth: unitType.health,
          attack: unitType.attack,
          defense: unitType.defense,
          attackSpeed: unitType.attackSpeed,
          speed: unitType.speed,
          baseSpeed: unitType.speed,
          x, y,
          team: 'red',
          lastAttackTime: 0,
          isAttacking: false,
          isSelected: false,
          abilityType: unitType.ability,
          abilityCooldown: 0,
          abilityActive: false,
          abilityDuration: 0,
          damageFlash: 0
        });
        remainingGold -= unitType.cost;
      } else break;
    }
    return enemyUnits;
  };

  const startGame = () => setGameState(prev => ({ ...prev, phase: 'setup' }));
  
  const startBattle = () => {
    if (gameState.playerUnits.length === 0) return;
    const enemyUnits = generateEnemyUnits();
    // Start background battle music
    soundManager.startBattleMusic();
    setGameState(prev => ({ ...prev, phase: 'battle', enemyUnits }));
  };

  const resetGame = () => {
    // Stop all sounds when resetting
    soundManager.stopAllSounds();
    setGameState({
      phase: 'start',
      playerUnits: [],
      enemyUnits: [],
      playerGold: 150,
      formation: 'free',
      particles: [],
      screenShake: 0,
      winner: null
    });
  };

  // ==================== GAME LOOP ====================
  const gameLoop = useCallback(() => {
    setGameState(prev => {
      if (prev.phase !== 'battle') return prev;
      const currentTime = Date.now();
      const deltaTime = 16;
      let updatedPlayerUnits = [...prev.playerUnits];
      let updatedEnemyUnits = [...prev.enemyUnits];
      let newParticles = [...prev.particles].map(p => ({
        ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.02
      })).filter(p => p.life > 0);
      let newScreenShake = Math.max(0, prev.screenShake - 1);

      // Update units
      const updateUnit = (unit: Unit, enemies: Unit[]) => {
        let u = { ...unit };
        if (u.abilityCooldown > 0) u.abilityCooldown = Math.max(0, u.abilityCooldown - deltaTime);
        if (u.abilityActive && u.abilityDuration > 0) {
          u.abilityDuration -= deltaTime;
          if (u.abilityDuration <= 0) {
            const unitType = UNIT_TYPES[u.type];
            u.abilityActive = false;
            u.speed = u.baseSpeed;
            u.attack = unitType.attack;
            u.defense = unitType.defense;
          }
        }
        if (u.damageFlash > 0) u.damageFlash -= deltaTime;

        if (u.targetX !== undefined && u.targetY !== undefined) {
          const dx = u.targetX - u.x, dy = u.targetY - u.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 5) {
            const angle = Math.atan2(dy, dx);
            u.x += Math.cos(angle) * u.speed;
            u.y += Math.sin(angle) * u.speed;
            if (Math.random() < 0.1) newParticles.push(...createParticles(u.x, u.y, '#8B4513', 1));
          } else {
            u.targetX = undefined;
            u.targetY = undefined;
          }
        } else {
          const nearestEnemy = findNearestEnemy(u, enemies);
          if (nearestEnemy) {
            const distance = getDistance(u.x, u.y, nearestEnemy.x, nearestEnemy.y);
            if (distance <= COLLISION_DISTANCE) {
              if (currentTime - u.lastAttackTime >= u.attackSpeed) {
                const damage = Math.max(0, u.attack - nearestEnemy.defense);
                nearestEnemy.health -= damage;
                nearestEnemy.damageFlash = 200;
                newParticles.push(...createParticles(nearestEnemy.x, nearestEnemy.y, '#FF0000', 8));
                newScreenShake = 5;
                if (nearestEnemy.health <= 0) {
                  newParticles.push(...createParticles(nearestEnemy.x, nearestEnemy.y, '#FFD700', 15));
                }
                u.lastAttackTime = currentTime;
                u.isAttacking = true;
              }
            } else {
              const dx = nearestEnemy.x - u.x, dy = nearestEnemy.y - u.y;
              const angle = Math.atan2(dy, dx);
              u.x += Math.cos(angle) * u.speed;
              u.y += Math.sin(angle) * u.speed;
              u.isAttacking = false;
              if (Math.random() < 0.05) newParticles.push(...createParticles(u.x, u.y, '#8B4513', 1));
            }
          }
        }
        return u;
      };

      updatedPlayerUnits = updatedPlayerUnits.map(u => updateUnit(u, updatedEnemyUnits));
      updatedEnemyUnits = updatedEnemyUnits.map(u => updateUnit(u, updatedPlayerUnits));
      updatedPlayerUnits = updatedPlayerUnits.filter(u => u.health > 0);
      updatedEnemyUnits = updatedEnemyUnits.filter(u => u.health > 0);

      if (updatedPlayerUnits.length === 0 || updatedEnemyUnits.length === 0) {
        // Stop battle music when battle ends
        soundManager.stopBattleMusic();
        return {
          ...prev,
          phase: updatedEnemyUnits.length === 0 ? 'victory' : 'defeat',
          winner: updatedEnemyUnits.length === 0 ? 'player' : 'enemy',
          playerUnits: updatedPlayerUnits,
          enemyUnits: updatedEnemyUnits
        };
      }

      return { ...prev, playerUnits: updatedPlayerUnits, enemyUnits: updatedEnemyUnits, particles: newParticles, screenShake: newScreenShake };
    });
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    if (gameState.phase === 'battle') {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [gameState.phase, gameLoop]);

  // ==================== CONTROLS ====================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.phase !== 'battle') return;
      if (e.key === '1') applyFormation('line');
      if (e.key === '2') applyFormation('box');
      if (e.key === '3') applyFormation('wedge');
      if (e.key === '4') applyFormation('free');
      if (e.key === 'q' || e.key === 'Q') activateAbility('charge');
      if (e.key === 'w' || e.key === 'W') activateAbility('volley');
      if (e.key === 'e' || e.key === 'E') activateAbility('shield');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.phase]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = battlefieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left, y = e.clientY - rect.top;

    if (gameState.phase === 'setup') {
      if (selectedUnitType) placeUnit(x, y);
      return;
    }

    if (gameState.phase !== 'battle') return;
    const clickedUnit = gameState.playerUnits.find(u => Math.abs(u.x - x) < UNIT_SIZE / 2 && Math.abs(u.y - y) < UNIT_SIZE / 2);
    if (clickedUnit && !e.shiftKey) {
      setGameState(prev => ({
        ...prev,
        playerUnits: prev.playerUnits.map(u => ({ ...u, isSelected: u.id === clickedUnit.id }))
      }));
    } else if (!clickedUnit) {
      setIsDragging(true);
      setSelectionBox({ x1: x, y1: y, x2: x, y2: y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectionBox) return;
    const rect = battlefieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    setSelectionBox(prev => prev ? { ...prev, x2: x, y2: y } : null);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (gameState.phase !== 'battle' || !isDragging || !selectionBox) return;
    selectUnits(selectionBox.x1, selectionBox.y1, selectionBox.x2, selectionBox.y2);
    setIsDragging(false);
    setSelectionBox(null);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (gameState.phase !== 'battle') return;
    const rect = battlefieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    moveSelectedUnits(x, y);
  };

  // ==================== RENDERING ====================
  const glassPanel = "bg-slate-900/70 backdrop-blur-md border border-white/10";
  
  if (gameState.phase === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-white mb-4" style={{ textShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>⚔️ BATTLE COMMANDER ⚔️</h1>
          <p className="text-xl text-gray-300">Lead your army to victory!</p>
          <button onClick={startGame} className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105">START GAME</button>
          <div className="mt-8 text-gray-400 text-sm space-y-2">
            <p>🎮 Click & Drag select | Right-click move/attack</p>
            <p>⌨️ 1-4 (Formations) | Q/W/E (Abilities)</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'victory' || gameState.phase === 'defeat') {
    const isVictory = gameState.phase === 'victory';
    return (
      <div className={`min-h-screen ${isVictory ? 'bg-gradient-to-br from-green-900 via-blue-900 to-slate-900' : 'bg-gradient-to-br from-red-900 via-gray-900 to-slate-900'} flex items-center justify-center`}>
        <div className="text-center space-y-8 p-8">
          <div className="text-8xl animate-bounce">{isVictory ? '🏆' : '💀'}</div>
          <h1 className={`text-6xl font-bold ${isVictory ? 'text-yellow-400' : 'text-red-400'}`} style={{ textShadow: `0 0 30px ${isVictory ? 'rgba(250, 204, 21, 0.8)' : 'rgba(239, 68, 68, 0.8)'}` }}>{isVictory ? 'VICTORY!' : 'DEFEAT!'}</h1>
          <p className="text-2xl text-white">{isVictory ? 'You defeated the enemy!' : 'Your army was destroyed!'}</p>
          <div className={`${glassPanel} px-8 py-6 rounded-xl inline-block`}>
            <div className="text-gray-300 space-y-2">
              <div>🔵 Your Survivors: <span className="text-blue-400 font-bold">{gameState.playerUnits.length}</span></div>
              <div>🔴 Enemy Survivors: <span className="text-red-400 font-bold">{gameState.enemyUnits.length}</span></div>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <button onClick={resetGame} className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105">PLAY AGAIN</button>
            <button onClick={() => { sessionStorage.removeItem('battleEnteredViaGateway'); router.push('/dashboard'); }} className="px-12 py-4 bg-slate-700/70 hover:bg-slate-600 text-white text-xl font-bold rounded-lg backdrop-blur transition-all duration-300">EXIT</button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="h-20 bg-slate-900/70 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8">
          <div className="text-white font-bold text-xl">⚙️ SETUP PHASE</div>
          <div className={`${glassPanel} px-6 py-3 rounded-lg`}>
            <div className="text-yellow-400 font-bold text-sm">GOLD</div>
            <div className="text-white text-2xl font-bold">{gameState.playerGold}</div>
          </div>
        </div>
        <div className="flex justify-center py-6 space-x-6">
          {(['infantry', 'archer', 'tank'] as const).map((unitType) => {
            const unit = UNIT_TYPES[unitType];
            return (
              <button key={unitType} onClick={() => setSelectedUnitType(unitType)} disabled={gameState.playerGold < unit.cost} className={`${glassPanel} p-6 rounded-xl transition-all duration-200 transform hover:scale-105 ${selectedUnitType === unitType ? 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/50' : ''} ${gameState.playerGold < unit.cost ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="text-4xl mb-2">{unitType === 'infantry' ? '🛡️' : unitType === 'archer' ? '🏹' : '🚜'}</div>
                <div className="text-white font-bold">{unit.name}</div>
                <div className="text-gray-400 text-sm mt-2">
                  <div>HP: {unit.health}</div>
                  <div>ATK: {unit.attack}</div>
                  <div>DEF: {unit.defense}</div>
                </div>
                <div className="text-yellow-400 font-bold mt-2">💰 {unit.cost}</div>
                <div className="text-xs text-gray-500 mt-1">{unit.ability === 'charge' ? '⚡ Charge' : unit.ability === 'volley' ? '🏹 Volley' : '🛡️ Shield'}</div>
              </button>
            );
          })}
        </div>
        <div className="flex justify-center">
          <div ref={battlefieldRef} className="relative" style={{ width: `${BATTLEFIELD_WIDTH}px`, height: `${BATTLEFIELD_HEIGHT}px`, backgroundImage: 'url(/grass_field.png)', backgroundSize: 'cover', backgroundColor: '#2d5016', borderRadius: '8px', border: '2px solid rgba(255, 255, 255, 0.1)' }} onMouseDown={handleMouseDown}>
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-500/30 transform -translate-x-1/2"></div>
            <div className={`absolute left-4 top-4 ${glassPanel} px-3 py-1 rounded text-blue-400 font-bold text-sm`}>YOUR SIDE</div>
            <div className={`absolute right-4 top-4 ${glassPanel} px-3 py-1 rounded text-red-400 font-bold text-sm`}>ENEMY SIDE</div>
            {gameState.playerUnits.map((unit) => (
              <div key={unit.id} className="absolute cursor-pointer hover:scale-110 transition-transform" style={{ left: `${unit.x - UNIT_SIZE / 2}px`, top: `${unit.y - UNIT_SIZE / 2}px`, width: `${UNIT_SIZE}px`, height: `${UNIT_SIZE}px` }} onClick={(e) => { e.stopPropagation(); removeUnit(unit.id); }}>
                <div className="w-full h-full rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: '#3b82f6', border: '2px solid #60a5fa' }}>🔵</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-8 space-x-6">
          <button onClick={startBattle} disabled={gameState.playerUnits.length === 0} className={`px-12 py-4 rounded-lg font-bold text-xl transition-all duration-200 transform ${gameState.playerUnits.length === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg hover:shadow-green-500/50 hover:scale-105'}`}>START BATTLE ({gameState.playerUnits.length} units)</button>
          <button onClick={resetGame} className={`px-8 py-4 ${glassPanel} rounded-lg font-bold text-white hover:bg-slate-700 transition-all duration-200`}>RESET</button>
        </div>
        <div className="text-center mt-6 text-gray-400 text-sm">Click unit type, then click left side to place. Click units to remove.</div>
      </div>
    );
  }

  // ==================== BATTLE PHASE ====================
  const selectedUnits = gameState.playerUnits.filter(u => u.isSelected);
  const screenShakeStyle = gameState.screenShake > 0 ? { transform: `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)` } : {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden" style={screenShakeStyle}>
      <div className="h-20 bg-slate-900/70 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8">
        <div className="flex items-center space-x-4">
          <div className={`${glassPanel} px-6 py-3 rounded-lg border-blue-500`}>
            <div className="text-blue-400 font-bold text-sm">BLUE ARMY</div>
            <div className="text-white text-2xl font-bold">{gameState.playerUnits.length}</div>
          </div>
          <div className={`${glassPanel} px-4 py-2 rounded-lg`}>
            <div className="text-gray-400 text-xs">Formation</div>
            <div className="text-white font-bold uppercase">{gameState.formation}</div>
          </div>
        </div>
        <div className="text-white font-bold text-xl" style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.5)' }}>⚔️ BATTLE IN PROGRESS ⚔️</div>
        <div className="flex items-center space-x-4">
          <div className={`${glassPanel} px-4 py-2 rounded-lg`}>
            <div className="text-gray-400 text-xs">Enemy</div>
            <div className="text-red-400 font-bold">AI Controlled</div>
          </div>
          <div className={`${glassPanel} px-6 py-3 rounded-lg border-red-500`}>
            <div className="text-red-400 font-bold text-sm">RED ARMY</div>
            <div className="text-white text-2xl font-bold">{gameState.enemyUnits.length}</div>
          </div>
        </div>
      </div>

      <div ref={battlefieldRef} className="relative mx-auto mt-4" style={{ width: `${BATTLEFIELD_WIDTH}px`, height: `${BATTLEFIELD_HEIGHT}px`, backgroundImage: 'url(/grass_field.png)', backgroundSize: 'cover', backgroundColor: '#2d5016', borderRadius: '8px', border: '2px solid rgba(255, 255, 255, 0.1)' }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onContextMenu={handleRightClick}>
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-500/30 transform -translate-x-1/2"></div>
        {selectionBox && <div className="absolute border-2 pointer-events-none" style={{ left: `${Math.min(selectionBox.x1, selectionBox.x2)}px`, top: `${Math.min(selectionBox.y1, selectionBox.y2)}px`, width: `${Math.abs(selectionBox.x2 - selectionBox.x1)}px`, height: `${Math.abs(selectionBox.y2 - selectionBox.y1)}px`, backgroundColor: 'rgba(100, 200, 255, 0.3)', borderColor: 'rgba(100, 200, 255, 0.8)' }} />}
        {gameState.particles.map(p => <div key={p.id} className="absolute w-2 h-2 rounded-full pointer-events-none" style={{ left: `${p.x}px`, top: `${p.y}px`, backgroundColor: p.color, opacity: p.life }} />)}
        {[...gameState.playerUnits, ...gameState.enemyUnits].map((unit) => {
          const hpPercent = (unit.health / unit.maxHealth) * 100;
          const isBlue = unit.team === 'blue';
          return (
            <div key={unit.id} className={`absolute ${unit.isAttacking ? 'animate-pulse' : ''}`} style={{ left: `${unit.x - UNIT_SIZE / 2}px`, top: `${unit.y - UNIT_SIZE / 2}px`, width: `${UNIT_SIZE}px`, height: `${UNIT_SIZE}px` }}>
              {unit.isSelected && <div className="absolute inset-0 rounded-full border-4 border-blue-400" style={{ transform: 'scale(1.3)', animation: 'pulse 1s ease-in-out infinite' }}></div>}
              {unit.abilityActive && <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 20px 10px rgba(59, 130, 246, 0.6)', animation: 'pulse 0.5s ease-in-out infinite' }}></div>}
              <div className="w-full h-full rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: isBlue ? '#3b82f6' : '#ef4444', border: isBlue ? '2px solid #60a5fa' : '2px solid #f87171', filter: unit.damageFlash > 0 ? 'brightness(2) saturate(0)' : 'none' }}>{isBlue ? '🔵' : '🔴'}</div>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12">
                <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                  <div className="h-full transition-all duration-300" style={{ width: `${hpPercent}%`, backgroundColor: hpPercent > 60 ? '#22c55e' : hpPercent > 30 ? '#eab308' : '#ef4444' }} />
                </div>
              </div>
              {unit.abilityCooldown > 0 && isBlue && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12">
                  <div className="h-1 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                    <div className="h-full bg-purple-500 transition-all" style={{ width: `${(unit.abilityCooldown / UNIT_TYPES[unit.type].abilityCooldown) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
