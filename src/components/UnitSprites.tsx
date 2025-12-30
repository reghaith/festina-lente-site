/**
 * Pixel Art Unit Sprites for Battle Game
 * Each sprite is designed in a retro pixel-art style
 */

interface UnitSpriteProps {
  team: 'blue' | 'red';
  size?: number;
}

// Tank Sprite - Heavy armored vehicle
export const TankSprite: React.FC<UnitSpriteProps> = ({ team, size = 40 }) => {
  const color = team === 'blue' ? '#3b82f6' : '#ef4444';
  const darkColor = team === 'blue' ? '#1e40af' : '#b91c1c';
  const lightColor = team === 'blue' ? '#60a5fa' : '#f87171';
  
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Tank Body */}
      <rect x="3" y="6" width="10" height="6" fill={color} />
      <rect x="2" y="7" width="12" height="4" fill={darkColor} />
      
      {/* Tank Turret */}
      <rect x="5" y="4" width="6" height="3" fill={color} />
      <rect x="6" y="3" width="4" height="2" fill={lightColor} />
      
      {/* Tank Cannon */}
      <rect x="11" y="5" width="3" height="1" fill={darkColor} />
      
      {/* Tank Tracks */}
      <rect x="2" y="11" width="2" height="2" fill="#1f2937" />
      <rect x="5" y="11" width="2" height="2" fill="#1f2937" />
      <rect x="9" y="11" width="2" height="2" fill="#1f2937" />
      <rect x="12" y="11" width="2" height="2" fill="#1f2937" />
      
      {/* Details */}
      <rect x="7" y="5" width="2" height="1" fill={lightColor} />
    </svg>
  );
};

// Infantry Sprite - Soldier with weapon
export const InfantrySprite: React.FC<UnitSpriteProps> = ({ team, size = 40 }) => {
  const color = team === 'blue' ? '#3b82f6' : '#ef4444';
  const darkColor = team === 'blue' ? '#1e40af' : '#b91c1c';
  const skinColor = '#d4a574';
  
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Head */}
      <rect x="6" y="2" width="4" height="3" fill={skinColor} />
      <rect x="7" y="3" width="2" height="1" fill="#000000" />
      
      {/* Helmet */}
      <rect x="5" y="1" width="6" height="2" fill={darkColor} />
      
      {/* Body */}
      <rect x="5" y="5" width="6" height="5" fill={color} />
      
      {/* Arms */}
      <rect x="4" y="6" width="2" height="3" fill={color} />
      <rect x="10" y="6" width="2" height="3" fill={color} />
      
      {/* Weapon */}
      <rect x="11" y="7" width="3" height="1" fill="#4b5563" />
      <rect x="13" y="6" width="1" height="3" fill="#1f2937" />
      
      {/* Legs */}
      <rect x="6" y="10" width="2" height="4" fill={darkColor} />
      <rect x="8" y="10" width="2" height="4" fill={darkColor} />
      
      {/* Boots */}
      <rect x="5" y="13" width="3" height="1" fill="#1f2937" />
      <rect x="8" y="13" width="3" height="1" fill="#1f2937" />
    </svg>
  );
};

// Archer Sprite - Ranged unit with bow
export const ArcherSprite: React.FC<UnitSpriteProps> = ({ team, size = 40 }) => {
  const color = team === 'blue' ? '#3b82f6' : '#ef4444';
  const darkColor = team === 'blue' ? '#1e40af' : '#b91c1c';
  const skinColor = '#d4a574';
  const bowColor = '#92400e';
  
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* Head */}
      <rect x="6" y="2" width="4" height="3" fill={skinColor} />
      <rect x="7" y="3" width="2" height="1" fill="#000000" />
      
      {/* Hood */}
      <rect x="5" y="1" width="6" height="2" fill={color} />
      <rect x="4" y="2" width="8" height="1" fill={darkColor} />
      
      {/* Body */}
      <rect x="5" y="5" width="6" height="5" fill={color} />
      <rect x="6" y="6" width="4" height="3" fill={darkColor} />
      
      {/* Arms */}
      <rect x="4" y="6" width="2" height="3" fill={skinColor} />
      <rect x="10" y="6" width="2" height="3" fill={skinColor} />
      
      {/* Bow */}
      <rect x="2" y="5" width="1" height="5" fill={bowColor} />
      <rect x="3" y="5" width="1" height="1" fill={bowColor} />
      <rect x="3" y="9" width="1" height="1" fill={bowColor} />
      
      {/* Bowstring */}
      <line x1="3" y1="5" x2="3" y2="10" stroke="#e5e7eb" strokeWidth="0.5" />
      
      {/* Arrow */}
      <rect x="3" y="7" width="3" height="1" fill={bowColor} />
      <polygon points="6,7 7,7.5 6,8" fill="#6b7280" />
      
      {/* Legs */}
      <rect x="6" y="10" width="2" height="4" fill={darkColor} />
      <rect x="8" y="10" width="2" height="4" fill={darkColor} />
      
      {/* Boots */}
      <rect x="5" y="13" width="3" height="1" fill="#92400e" />
      <rect x="8" y="13" width="3" height="1" fill="#92400e" />
    </svg>
  );
};

// Main component to render the correct sprite based on unit type
interface UnitSpriteRendererProps {
  unitType: 'tank' | 'infantry' | 'archer';
  team: 'blue' | 'red';
  size?: number;
}

export const UnitSpriteRenderer: React.FC<UnitSpriteRendererProps> = ({ 
  unitType, 
  team, 
  size = 40 
}) => {
  switch (unitType) {
    case 'tank':
      return <TankSprite team={team} size={size} />;
    case 'infantry':
      return <InfantrySprite team={team} size={size} />;
    case 'archer':
      return <ArcherSprite team={team} size={size} />;
    default:
      return <div style={{ width: size, height: size, backgroundColor: team === 'blue' ? '#3b82f6' : '#ef4444', borderRadius: '50%' }} />;
  }
};
