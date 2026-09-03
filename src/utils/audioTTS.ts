import { VOICE_OPTIONS } from '../data/voices';

class DramaAudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCtx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmOscillators: OscillatorNode[] = [];

  // Play dialogue text with the specified voice profile
  public async speakText(text: string, voiceId: string, onEnd?: () => void): Promise<void> {
    this.stopSpeaking();

    const voiceConfig = VOICE_OPTIONS.find(v => v.id === voiceId) || VOICE_OPTIONS[0];
    const cleanText = text.replace(/^\[[^\]]+\]:\s*/, '').trim();

    // Check if browser speech synthesis is supported
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'th-TH';
      utterance.pitch = voiceConfig.pitch || 1.0;
      utterance.rate = voiceConfig.rate || 0.95;

      // Find best Thai voice if available
      const voices = window.speechSynthesis.getVoices();
      const thaiVoice = voices.find(v => v.lang.includes('th') || v.lang.includes('TH'));
      if (thaiVoice) {
        utterance.voice = thaiVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback timer if no speech synthesis
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 3000);
    }
  }

  // Play audio from base64 or URL
  public playAudioUrl(url: string, onEnd?: () => void): void {
    this.stopSpeaking();
    const audio = new Audio(url);
    this.currentAudio = audio;
    audio.onended = () => {
      this.currentAudio = null;
      if (onEnd) onEnd();
    };
    audio.onerror = () => {
      this.currentAudio = null;
      if (onEnd) onEnd();
    };
    audio.play().catch(e => console.warn('Audio play error:', e));
  }

  // Stop any active speech or audio
  public stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  // Cinematic Ambient BGM using Web Audio API for rich drama atmosphere
  public startCinematicAmbientBGM(): void {
    if (this.isBgmPlaying) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.audioCtx = new AudioCtxClass();
      this.bgmGain = this.audioCtx.createGain();
      this.bgmGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime); // gentle ambient level
      this.bgmGain.connect(this.audioCtx.destination);

      // Create warm low chords (D - F - A - C cinematic pad)
      const freqs = [146.83, 220.00, 261.63, 329.63];
      this.bgmOscillators = freqs.map(f => {
        const osc = this.audioCtx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.audioCtx!.currentTime);
        
        // Gentle filter
        const filter = this.audioCtx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, this.audioCtx!.currentTime);

        osc.connect(filter);
        filter.connect(this.bgmGain!);
        osc.start();
        return osc;
      });

      this.isBgmPlaying = true;
    } catch (e) {
      console.warn('BGM init error:', e);
    }
  }

  public stopCinematicAmbientBGM(): void {
    if (!this.isBgmPlaying) return;
    try {
      this.bgmOscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (_) {}
      });
      this.bgmOscillators = [];
      if (this.audioCtx) {
        this.audioCtx.close();
        this.audioCtx = null;
      }
      this.isBgmPlaying = false;
    } catch (e) {
      console.warn('Stop BGM error:', e);
    }
  }
}

export const dramaAudio = new DramaAudioManager();
