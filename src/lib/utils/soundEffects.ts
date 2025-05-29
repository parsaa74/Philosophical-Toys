import * as Tone from 'tone';

interface SoundEffect {
  synth: Tone.Synth;
  notes: string[];
  timing: number[];
}

interface AudioPlayer {
  player: Tone.Player;
  isLoaded: boolean;
}

class SoundEffects {
  private effects: Map<string, SoundEffect>;
  private players: Map<string, AudioPlayer>;
  private isInitialized: boolean;
  private globalVolume: Tone.Volume;

  constructor() {
    this.effects = new Map();
    this.players = new Map();
    this.isInitialized = false;
    this.globalVolume = new Tone.Volume(0).toDestination(); // Master volume control
  }

  private async loadPlayer(name: string, url: string): Promise<AudioPlayer> {
    return new Promise((resolve, reject) => {
      const player = new Tone.Player({
        url,
        onload: () => {
          console.log(`${name} sound loaded successfully.`);
          resolve({ player, isLoaded: true });
        },
        onerror: (err) => {
          console.error(`Error loading ${name} sound:`, err);
          reject(err);
        },
      }).connect(this.globalVolume);
      this.players.set(name, { player, isLoaded: false }); // Temporarily set with isLoaded: false
    });
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await Tone.start();
      console.log('AudioContext started.');
      this.isInitialized = true;

      // Load audio files
      const soundFiles = {
        crackle: '/sounds/crackle.mp3',
        film: '/sounds/film.mp3',
        twopop: '/sounds/twopop.mp3',
        mechanical: '/sounds/mechanical.mp3',
      };

      const loadPromises = Object.entries(soundFiles).map(async ([name, url]) => {
        try {
          const loadedPlayer = await this.loadPlayer(name, url);
          this.players.set(name, loadedPlayer);
          // Add mechanical as alias for spin sound
          if (name === 'mechanical') {
            this.players.set('spin', loadedPlayer);
          }
        } catch (error) {
          console.error(`Failed to load player for ${name}:`, error);
          // Set a placeholder or handle the error as appropriate
          this.players.set(name, { player: new Tone.Player().connect(this.globalVolume), isLoaded: false });
        }
      });

      await Promise.all(loadPromises);
      console.log('All sound players initialized.');

    } catch (error) {
      console.error('Error during SoundEffects initialization:', error);
      this.isInitialized = false; // Ensure not marked as initialized if Tone.start() fails
      return; // Stop further execution if Tone.start() fails
    }


    // Create transition effect
    const transitionSynth = new Tone.Synth({
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).connect(this.globalVolume);

    this.effects.set('transition', {
      synth: transitionSynth,
      notes: ['C4', 'E4', 'G4'],
      timing: [0, 0.1, 0.2]
    });

    // Create spin effect
    const spinSynth = new Tone.Synth({
      oscillator: {
        type: 'sine'
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.1,
        release: 0.5
      }
    }).connect(this.globalVolume);

    this.effects.set('spin', {
      synth: spinSynth,
      notes: ['A4', 'C5', 'E5'],
      timing: [0, 0.05, 0.1]
    });
  }

  async playEffect(effectName: string) {
    if (!this.isInitialized) {
      console.log('Initializing sound effects before playing effect...');
      await this.initialize();
      if (!this.isInitialized) { // Check again if initialization failed
        console.error('Sound system not initialized. Cannot play effect.');
        return;
      }
    }

    const effect = this.effects.get(effectName);
    if (!effect) {
      console.warn(`Effect ${effectName} not found.`);
      return;
    }

    const now = Tone.now();
    effect.notes.forEach((note, i) => {
      effect.synth.triggerAttackRelease(note, '16n', now + effect.timing[i]);
    });
  }

  async playSound(
    soundName: string,
    loop: boolean = false,
    volumeDB: number = 0, // Volume in decibels
    fadeInTime: Tone.Unit.Time = 0.01
  ) {
    if (!this.isInitialized) {
      console.log('Initializing sound effects before playing sound...');
      await this.initialize();
       if (!this.isInitialized) { // Check again if initialization failed
        console.error('Sound system not initialized. Cannot play sound.');
        return null;
      }
    }

    const audioPlayer = this.players.get(soundName);
    if (!audioPlayer || !audioPlayer.isLoaded) {
      console.warn(`Sound ${soundName} not found or not loaded. Attempting to load...`);
      // Attempt to re-initialize if a specific sound wasn't loaded
      // This is a fallback, ideally all sounds are loaded during initial initialize()
      await this.initialize();
      const recheckedPlayer = this.players.get(soundName);
      if (!recheckedPlayer || !recheckedPlayer.isLoaded) {
        console.error(`Sound ${soundName} still not available after re-check.`);
        return null;
      }
      // Use the rechecked player
      const playerInstance = recheckedPlayer.player;
      playerInstance.loop = loop;
      playerInstance.volume.value = -Infinity; // Start silent for fade-in
      playerInstance.start();
      playerInstance.volume.linearRampTo(volumeDB, fadeInTime, Tone.now());
      console.log(`Playing ${soundName} (loop: ${loop}, volume: ${volumeDB}dB)`);
      return playerInstance;
    }
    
    const playerInstance = audioPlayer.player;
    playerInstance.loop = loop;
    playerInstance.volume.value = -Infinity; // Start silent for fade-in
    // playerInstance.fadeIn = fadeInTime; // Tone.Player has fadeIn/fadeOut properties
    // playerInstance.fadeOut = fadeOutTime;
    
    if (playerInstance.state === 'started' && !loop) {
        playerInstance.restart(); // Restart if already playing and not looping
    } else if (playerInstance.state !== 'started') {
        playerInstance.start();
    }
    playerInstance.volume.linearRampTo(volumeDB, fadeInTime, Tone.now());

    console.log(`Playing ${soundName} (loop: ${loop}, volume: ${volumeDB}dB)`);
    return playerInstance;
  }

  async stopSound(soundName: string, fadeOutTime: Tone.Unit.Time = 0.1) {
    if (!this.isInitialized) {
      console.warn('Sound system not initialized. Cannot stop sound.');
      return;
    }
    const audioPlayer = this.players.get(soundName);
    if (!audioPlayer || !audioPlayer.isLoaded) {
      console.warn(`Sound ${soundName} not found or not loaded. Cannot stop.`);
      return;
    }
    if (audioPlayer.player.state === 'started') {
      const currentVolume = audioPlayer.player.volume.value;
      audioPlayer.player.volume.linearRampTo(-Infinity, fadeOutTime, Tone.now());
      // Stop the player after the fade-out duration
      Tone.Transport.scheduleOnce(() => {
        if (audioPlayer.player.state === 'started') { // Check again in case it was stopped by other means
            audioPlayer.player.stop();
            audioPlayer.player.volume.value = currentVolume; // Reset volume for next play
        }
      }, `+${fadeOutTime}`);
      console.log(`Stopping ${soundName}`);
    }
  }
  
  async setSoundVolume(soundName: string, volumeDB: number, rampTime: Tone.Unit.Time = 0.1) {
    if (!this.isInitialized) {
       console.warn('Sound system not initialized. Cannot set volume.');
      return;
    }
    const audioPlayer = this.players.get(soundName);
    if (!audioPlayer || !audioPlayer.isLoaded) {
      console.warn(`Sound ${soundName} not found or not loaded. Cannot set volume.`);
      return;
    }
    audioPlayer.player.volume.linearRampTo(volumeDB, rampTime, Tone.now());
    console.log(`Set volume for ${soundName} to ${volumeDB}dB`);
  }

  isSoundPlaying(soundName: string): boolean {
    if (!this.isInitialized) return false;
    const audioPlayer = this.players.get(soundName);
    // Ensure a boolean is always returned
    return !!(audioPlayer?.isLoaded && audioPlayer.player.state === 'started');
  }

  async setPlaybackRate(soundName: string, rate: number) {
    if (!this.isInitialized) {
      console.warn('Sound system not initialized. Cannot set playback rate.');
      return;
    }
    const audioPlayer = this.players.get(soundName);
    if (!audioPlayer || !audioPlayer.isLoaded) {
      console.warn(`Sound ${soundName} not found or not loaded. Cannot set playback rate.`);
      return;
    }
    
    // Ensure rate is within reasonable bounds (0.1 to 4.0)
    const safeRate = Math.max(0.1, Math.min(4.0, rate));
    audioPlayer.player.playbackRate = safeRate;
    console.log(`Set playback rate for ${soundName} to ${safeRate}`);
  }

  dispose() {
    this.effects.forEach(effect => {
      effect.synth.dispose();
    });
    this.effects.clear();

    this.players.forEach(audioPlayer => {
      if (audioPlayer.player) {
        audioPlayer.player.stop();
        audioPlayer.player.dispose();
      }
    });
    this.players.clear();
    if (this.globalVolume) {
        this.globalVolume.dispose();
    }
    this.isInitialized = false;
    console.log('SoundEffects disposed.');
  }
}

export const soundEffects = new SoundEffects();
export default soundEffects;