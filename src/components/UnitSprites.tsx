/**
 * Pixel Art Unit Sprites for Battle Game
 * Each sprite is designed in a retro pixel-art style
 */

interface UnitSpriteProps {
  team: 'blue' | 'red';
  size?: number;
}

// Tank Sprite - Heavy armored vehicle with enhanced details
export const TankSprite: React.FC<UnitSpriteProps> = ({ team, size = 40 }) => {
  const color = team === 'blue' ? '#3b82f6' : '#ef4444';
  const darkColor = team === 'blue' ? '#1e40af' : '#b91c1c';
  const lightColor = team === 'blue' ? '#60a5fa' : '#f87171';
  const veryDark = team === 'blue' ? '#1e3a8a' : '#991b1b';
  
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ imageRendering: 'pixelated' }}>
      {/* Tank Tracks - Bottom layer */}
      <rect x="2" y="13" width="16" height="3" fill="#374151" />
      <rect x="2" y="14" width="2" height="1" fill="#1f2937" />
      <rect x="5" y="14" width="2" height="1" fill="#1f2937" />
      <rect x="8" y="14" width="2" height="1" fill="#1f2937" />
      <rect x="11" y="14" width="2" height="1" fill="#1f2937" />
      <rect x="14" y="14" width="2" height="1" fill="#1f2937" />
      <rect x="16" y="14" width="2" height="1" fill="#1f2937" />
      
      {/* Tank Body - Main hull */}
      <rect x="3" y="8" width="14" height="5" fill={darkColor} />
      <rect x="4" y="9" width="12" height="3" fill={color} />
      
      {/* Body highlights */}
      <rect x="5" y="9" width="1" height="1" fill={lightColor} />
      <rect x="14" y="9" width="1" height="1" fill={lightColor} />
      
      {/* Tank Turret */}
      <rect x="6" y="5" width="8" height="4" fill={color} />
      <rect x="7" y="6" width="6" height="2" fill={lightColor} />
      <rect x="8" y="4" width="4" height="2" fill={darkColor} />
      
      {/* Turret hatch */}
      <rect x="9" y="4" width="2" height="1" fill={veryDark} />
      
      {/* Tank Cannon - Extended */}
      <rect x="14" y="6" width="5" height="2" fill={darkColor} />
      <rect x="18" y="7" width="1" height="1" fill={veryDark} />
      <rect x="14" y="7" width="1" height="1" fill="#6b7280" />
      
      {/* Front armor plating detail */}
      <rect x="16" y="10" width="1" height="2" fill={veryDark} />
      
      {/* Side details */}
      <rect x="5" y="11" width="1" height="1" fill={veryDark} />
      <rect x="13" y="11" width="1" height="1" fill={veryDark} />
    </svg>
  );
};

// Infantry Sprite - Soldier with weapon and enhanced details
export const InfantrySprite: React.FC<UnitSpriteProps> = ({ team, size = 40 }) => {
  const color = team === 'blue' ? '#3b82f6' : '#ef4444';
  const darkColor = team === 'blue' ? '#1e40af' : '#b91c1c';
  const lightColor = team === 'blue' ? '#60a5fa' : '#f87171';
  const skinColor = '#d4a574';
  const darkSkin = '#b8835a';
  
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ imageRendering: 'pixelated' }}>
      {/* Helmet - Military style */}
      <rect x="7" y="2" width="6" height="2" fill={darkColor} />
      <rect x="6" y="3" width="8" height="1" fill={darkColor} />
      <rect x="8" y="1" width="4" height="1" fill={darkColor} />
      
      {/* Head/Face */}
      <rect x="8" y="4" width="4" height="3" fill={skinColor} />
      <rect x="7" y="5" width="6" height="2" fill={skinColor} />
      
      {/* Eyes */}
      <rect x="8" y="5" width="1" height="1" fill="#000000" />
      <rect x="11" y="5" width="1" height="1" fill="#000000" />
      
      {/* Facial shadow */}
      <rect x="7" y="6" width="1" height="1" fill={darkSkin} />
      <rect x="12" y="6" width="1" height="1" fill={darkSkin} />
      
      {/* Body - Military uniform */}
      <rect x="6" y="7" width="8" height="6" fill={color} />
      <rect x="7" y="8" width="6" height="4" fill={lightColor} />
      
      {/* Belt/Equipment */}
      <rect x="7" y="11" width="6" height="1" fill={darkColor} />
      <rect x="9" y="11" width="2" height="1" fill="#6b7280" />
      
      {/* Left Arm */}
      <rect x="5" y="8" width="2" height="4" fill={color} />
      <rect x="5" y="9" width="1" height="2" fill={darkColor} />
      
      {/* Right Arm (holding weapon) */}
      <rect x="13" y="8" width="2" height="4" fill={color} />
      <rect x="14" y="9" width="1" height="2" fill={darkColor} />
      
      {/* Hand holding weapon */}
      <rect x="14" y="11" width="1" height="1" fill={skinColor} />
      
      {/* Weapon - Rifle */}
      <rect x="14" y="10" width="4" height="1" fill="#4b5563" />
      <rect x="17" y="9" width="1" height="3" fill="#1f2937" />
      <rect x="15" y="10" width="1" height="1" fill="#1f2937" />
      
      {/* Legs */}
      <rect x="7" y="13" width="2" height="4" fill={darkColor} />
      <rect x="11" y="13" width="2" height="4" fill={darkColor} />
      <rect x="8" y="14" width="1" height="2" fill={color} />
      <rect x="11" y="14" width="1" height="2" fill={color} />
      
      {/* Boots */}
      <rect x="6" y="16" width="3" height="2" fill="#1f2937" />
      <rect x="11" y="16" width="3" height="2" fill="#1f2937" />
      <rect x="7" y="17" width="1" height="1" fill="#374151" />
      <rect x="12" y="17" width="1" height="1" fill="#374151" />
    </svg>
  );
};

// Archer Sprite - Ranged unit with bow and enhanced details
export const ArcherSprite: React.FC<UnitSpriteProps> = ({ team, size = 40 }) => {
  const color = team === 'blue' ? '#3b82f6' : '#ef4444';
  const darkColor = team === 'blue' ? '#1e40af' : '#b91c1c';
  const lightColor = team === 'blue' ? '#60a5fa' : '#f87171';
  const skinColor = '#d4a574';
  const darkSkin = '#b8835a';
  const bowColor = '#92400e';
  const darkBow = '#78350f';
  
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ imageRendering: 'pixelated' }}>
      {/* Hood - Flowing cape style */}
      <rect x="8" y="1" width="4" height="2" fill={darkColor} />
      <rect x="7" y="2" width="6" height="2" fill={color} />
      <rect x="6" y="3" width="8" height="1" fill={darkColor} />
      <rect x="5" y="4" width="10" height="1" fill={color} />
      
      {/* Head/Face */}
      <rect x="8" y="4" width="4" height="3" fill={skinColor} />
      <rect x="7" y="5" width="6" height="2" fill={skinColor} />
      
      {/* Eyes */}
      <rect x="8" y="5" width="1" height="1" fill="#000000" />
      <rect x="11" y="5" width="1" height="1" fill="#000000" />
      
      {/* Facial shadow */}
      <rect x="7" y="6" width="1" height="1" fill={darkSkin} />
      <rect x="12" y="6" width="1" height="1" fill={darkSkin} />
      
      {/* Body - Light armor/tunic */}
      <rect x="6" y="7" width="8" height="6" fill={color} />
      <rect x="7" y="8" width="6" height="4" fill={lightColor} />
      
      {/* Leather vest detail */}
      <rect x="8" y="8" width="4" height="3" fill={darkColor} />
      <rect x="9" y="9" width="2" height="1" fill="#6b7280" />
      
      {/* Quiver on back */}
      <rect x="12" y="8" width="2" height="4" fill={darkBow} />
      <rect x="12" y="8" width="1" height="1" fill="#a16207" />
      <rect x="13" y="9" width="1" height="1" fill="#a16207" />
      
      {/* Left Arm (holding bow) */}
      <rect x="4" y="8" width="2" height="4" fill={skinColor} />
      <rect x="4" y="9" width="1" height="2" fill={darkSkin} />
      
      {/* Right Arm (drawing arrow) */}
      <rect x="14" y="8" width="2" height="3" fill={skinColor} />
      <rect x="15" y="9" width="1" height="1" fill={darkSkin} />
      
      {/* Bow - Detailed recurve */}
      <rect x="2" y="7" width="1" height="7" fill={bowColor} />
      <rect x="3" y="7" width="1" height="1" fill={darkBow} />
      <rect x="3" y="8" width="1" height="1" fill={bowColor} />
      <rect x="3" y="12" width="1" height="1" fill={bowColor} />
      <rect x="3" y="13" width="1" height="1" fill={darkBow} />
      
      {/* Bow grip */}
      <rect x="3" y="10" width="1" height="1" fill="#6b7280" />
      
      {/* Bowstring - taut */}
      <line x1="3" y1="7" x2="3" y2="14" stroke="#e5e7eb" strokeWidth="0.5" />
      <line x1="3" y1="10" x2="5" y2="10" stroke="#e5e7eb" strokeWidth="0.5" />
      
      {/* Arrow - nocked and ready */}
      <rect x="5" y="10" width="5" height="1" fill={bowColor} />
      <polygon points="10,10 11,10.5 10,11" fill="#6b7280" />
      <rect x="5" y="10" width="1" height="1" fill="#dc2626" />
      
      {/* Legs */}
      <rect x="7" y="13" width="2" height="4" fill={darkColor} />
      <rect x="11" y="13" width="2" height="4" fill={darkColor} />
      <rect x="8" y="14" width="1" height="2" fill={color} />
      <rect x="11" y="14" width="1" height="2" fill={color} />
      
      {/* Boots - Leather */}
      <rect x="6" y="16" width="3" height="2" fill={darkBow} />
      <rect x="11" y="16" width="3" height="2" fill={darkBow} />
      <rect x="7" y="17" width="1" height="1" fill="#a16207" />
      <rect x="12" y="17" width="1" height="1" fill="#a16207" />
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
