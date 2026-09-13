/**
 * BRUK — Synthesized Web Audio Engine
 * Zero-dependency procedural audio for futuristic agency interactions
 */

(function () {
  'use strict';

  let audioCtx = null;
  let isMuted = true; // default muted to respect user preference

  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Check saved preference
  try {
    const saved = localStorage.getItem('bruk_audio_enabled');
    if (saved === 'true') {
      isMuted = false;
    }
  } catch (e) {}

  const SoundEngine = {
    get isMuted() {
      return isMuted;
    },

    toggleMute() {
      isMuted = !isMuted;
      try {
        localStorage.setItem('bruk_audio_enabled', (!isMuted).toString());
      } catch (e) {}

      // If unmuting, warm up context & play chime
      if (!isMuted) {
        getAudioContext();
        this.playThemeSwitch();
      }
      this.updateUI();
      return !isMuted;
    },

    setMuted(val) {
      isMuted = !!val;
      try {
        localStorage.setItem('bruk_audio_enabled', (!isMuted).toString());
      } catch (e) {}
      this.updateUI();
    },

    updateUI() {
      const toggles = document.querySelectorAll('.sound-toggle');
      toggles.forEach((btn) => {
        if (isMuted) {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-label', 'Sound off (Click to enable)');
          btn.setAttribute('title', 'Sound off (Click to enable)');
          const label = btn.querySelector('.sound-toggle__label');
          if (label) label.textContent = 'Audio: OFF';
        } else {
          btn.classList.add('is-active');
          btn.setAttribute('aria-label', 'Sound on (Click to mute)');
          btn.setAttribute('title', 'Sound on (Click to mute)');
          const label = btn.querySelector('.sound-toggle__label');
          if (label) label.textContent = 'Audio: ON';
        }
      });
    },

    playHover() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    },

    playClick() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    },

    playShockwave() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      // Sub-bass hit
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);

      // Shimmer overlay
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(800, ctx.currentTime);
      shimmer.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);

      shimmerGain.gain.setValueAtTime(0.03, ctx.currentTime);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

      shimmer.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      shimmer.start();
      shimmer.stop(ctx.currentTime + 0.25);
    },

    playThemeSwitch() {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);

        gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.04 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.12);
      });
    },

    playSlider(valPercent) {
      if (isMuted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const baseFreq = 220 + (valPercent || 0.5) * 440;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  };

  // Bind first click anywhere to unlock audio context if needed
  window.addEventListener('click', function unlockAudio() {
    if (!isMuted) {
      getAudioContext();
    }
    window.removeEventListener('click', unlockAudio);
  }, { once: true });

  window.BrukAudio = SoundEngine;

  document.addEventListener('DOMContentLoaded', function () {
    SoundEngine.updateUI();
  });
})();
