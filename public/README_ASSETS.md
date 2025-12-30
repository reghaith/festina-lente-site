# Battle Game Assets

This folder should contain the following asset files for the auto-battler game:

## Required Assets:

### Images:
- `grass_field.png` - Background image for the battlefield (800x500px recommended)
- `blue_soldier.png` - Blue team soldier sprite (40x40px, pixel art style)
- `red_soldier.png` - Red team soldier sprite (40x40px, pixel art style)
- `icon_sword.png` - Sword icon for unit buttons (32x32px)

### Audio:
- `soundtrack.mp3` - Background music that loops during battle
- `sfx_hit.wav` - Attack sound effect played when units hit each other

## Notes:
- All images should be pixel art style with transparent backgrounds
- Use `imageRendering: pixelated` CSS for crisp pixel art
- Audio files are optional - the game will work without them
- If assets are missing, the game will show colored fallback squares

## Fallback Behavior:
The game code includes error handling to display:
- Blue/Red colored squares with emojis if sprite images fail to load
- No sound if audio files are missing (game will continue silently)
