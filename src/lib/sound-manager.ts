/**
 * Sound Manager for Battle Game
 * Handles audio playback with overlap prevention for placement sounds
 */

export class SoundManager {
  private placementSoundPlaying: boolean = false;
  private backgroundMusic: HTMLAudioElement | null = null;
  private currentPlacementSound: HTMLAudioElement | null = null;

  // Sound URLs
  private readonly SOUNDS = {
    tank: 'https://audio.jukehost.co.uk/0dVghI1rv5oPtfDZrqRMoYJahT6HXYNW',
    infantry: 'https://audio.jukehost.co.uk/N5AQv7cXxHN3k2DlAdgx63xxiU2eScWj',
    archer: 'https://audio.jukehost.co.uk/MRyBcgo1s8dU12R2Y8gwLpNLjXjzAD5J',
    setupMusic: 'https://audio.jukehost.co.uk/WdRFuU3KGhxRTHfYJ79y760wAarrzwb8',
    battleMusic: 'https://audio.jukehost.co.uk/rH8Et0GB769OMdUi50zulvi5ZFMKR97T'
  };

  /**
   * Play unit placement sound with interruption support
   * @param unitType - Type of unit being placed (tank, infantry, or archer)
   */
  playPlacementSound(unitType: 'tank' | 'infantry' | 'archer'): void {
    // Stop the previous placement sound if one is playing
    if (this.currentPlacementSound) {
      this.currentPlacementSound.pause();
      this.currentPlacementSound.currentTime = 0;
      this.currentPlacementSound = null;
    }

    const soundUrl = this.SOUNDS[unitType];
    if (!soundUrl) {
      console.warn(`No sound defined for unit type: ${unitType}`);
      return;
    }

    try {
      // Create new audio instance
      this.currentPlacementSound = new Audio(soundUrl);
      this.placementSoundPlaying = true;

      // Mark as not playing when sound ends
      this.currentPlacementSound.addEventListener('ended', () => {
        this.placementSoundPlaying = false;
        this.currentPlacementSound = null;
      });

      // Handle errors
      this.currentPlacementSound.addEventListener('error', (e) => {
        console.error('Error playing placement sound:', e);
        this.placementSoundPlaying = false;
        this.currentPlacementSound = null;
      });

      // Play the sound
      this.currentPlacementSound.play().catch(err => {
        console.error('Failed to play placement sound:', err);
        this.placementSoundPlaying = false;
        this.currentPlacementSound = null;
      });
    } catch (error) {
      console.error('Error creating placement sound:', error);
      this.placementSoundPlaying = false;
    }
  }

  /**
   * Start playing setup phase background music (looped)
   */
  startSetupMusic(): void {
    if (this.backgroundMusic) {
      // Already playing
      return;
    }

    try {
      this.backgroundMusic = new Audio(this.SOUNDS.setupMusic);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = 0.4; // Set to 40% volume so it doesn't overpower

      this.backgroundMusic.addEventListener('error', (e) => {
        console.error('Error playing setup music:', e);
        this.backgroundMusic = null;
      });

      this.backgroundMusic.play().catch(err => {
        console.error('Failed to play setup music:', err);
        this.backgroundMusic = null;
      });
    } catch (error) {
      console.error('Error creating setup music:', error);
    }
  }

  /**
   * Start playing background battle music (looped)
   * Stops any currently playing music first
   */
  startBattleMusic(): void {
    // Stop setup music if it's playing
    this.stopBattleMusic();

    try {
      this.backgroundMusic = new Audio(this.SOUNDS.battleMusic);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = 0.4; // Set to 40% volume so it doesn't overpower

      this.backgroundMusic.addEventListener('error', (e) => {
        console.error('Error playing battle music:', e);
        this.backgroundMusic = null;
      });

      this.backgroundMusic.play().catch(err => {
        console.error('Failed to play battle music:', err);
        this.backgroundMusic = null;
      });
    } catch (error) {
      console.error('Error creating battle music:', error);
    }
  }

  /**
   * Stop background battle music
   */
  stopBattleMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
    }
  }

  /**
   * Stop all sounds (placement and background music)
   */
  stopAllSounds(): void {
    // Stop placement sound
    if (this.currentPlacementSound) {
      this.currentPlacementSound.pause();
      this.currentPlacementSound.currentTime = 0;
      this.currentPlacementSound = null;
    }
    this.placementSoundPlaying = false;

    // Stop background music
    this.stopBattleMusic();
  }

  /**
   * Check if a placement sound is currently playing
   */
  isPlacementSoundPlaying(): boolean {
    return this.placementSoundPlaying;
  }

  /**
   * Check if background music is playing
   */
  isMusicPlaying(): boolean {
    return this.backgroundMusic !== null && !this.backgroundMusic.paused;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
