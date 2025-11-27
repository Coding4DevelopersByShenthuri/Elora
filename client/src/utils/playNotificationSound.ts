let audioContext: AudioContext | null = null;

export function playNotificationSound() {
  if (typeof window === 'undefined') {
    return;
  }

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) {
    return;
  }

  if (!audioContext) {
    audioContext = new AudioCtx();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {
      /* ignore resume errors */
    });
  }

  const chimeGain = audioContext.createGain();
  chimeGain.gain.value = 0.08;
  chimeGain.connect(audioContext.destination);

  const primaryTone = audioContext.createOscillator();
  primaryTone.type = 'sine';
  primaryTone.frequency.value = 660;

  const harmonicTone = audioContext.createOscillator();
  harmonicTone.type = 'sine';
  harmonicTone.frequency.value = 990;

  primaryTone.connect(chimeGain);
  harmonicTone.connect(chimeGain);

  const now = audioContext.currentTime;
  primaryTone.start(now);
  harmonicTone.start(now + 0.05);

  primaryTone.frequency.exponentialRampToValueAtTime(440, now + 0.4);
  harmonicTone.frequency.exponentialRampToValueAtTime(660, now + 0.45);

  chimeGain.gain.setValueAtTime(chimeGain.gain.value, now);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  primaryTone.stop(now + 0.6);
  harmonicTone.stop(now + 0.65);
}

