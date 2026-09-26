// Web Audio API sound synthesizer for Emergency Alerts and UI Feedback
class EmergencyAudioController {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('erip_audio_muted') === 'true';
    this.volume = parseFloat(localStorage.getItem('erip_audio_volume') || '0.7');
    this.activeOscillators = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem('erip_audio_muted', String(muted));
    if (muted) {
      this.stopAlarm();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('erip_audio_volume', String(this.volume));
  }

  playBeep(freq = 600, duration = 0.15, type = 'sine') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(this.volume * 0.3, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playSonarPing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Sonar play error:', e);
    }
  }

  playSiren(durationSeconds = 3.5) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    this.stopAlarm();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';

      const now = this.ctx.currentTime;
      const cycles = Math.floor(durationSeconds / 0.5);

      for (let i = 0; i < cycles; i++) {
        const t = now + i * 0.5;
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.linearRampToValueAtTime(950, t + 0.25);
        osc.frequency.linearRampToValueAtTime(450, t + 0.5);
      }

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.setValueAtTime(this.volume * 0.35, now + durationSeconds - 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);
      this.activeOscillators.push(osc);

      setTimeout(() => {
        this.activeOscillators = this.activeOscillators.filter(o => o !== osc);
      }, durationSeconds * 1000 + 100);
    } catch (e) {
      console.warn('Siren play error:', e);
    }
  }

  stopAlarm() {
    this.activeOscillators.forEach(osc => {
      try { osc.stop(); } catch (_) {}
    });
    this.activeOscillators = [];
  }

  speakAlert(text, lang = 'en-IN') {
    if (this.muted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.volume;
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  }
}

export const soundManager = new EmergencyAudioController();
