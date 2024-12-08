export const useAudioFeedback = () => {
  const playTone = (startFreq: number, endFreq: number, duration: number) => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      endFreq,
      audioContext.currentTime + duration
    );

    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  const playStartTone = () => {
    playTone(440, 880, 0.2);
  };

  const playEndTone = () => {
    playTone(880, 440, 0.2);
  };

  return {
    playStartTone,
    playEndTone,
  };
};
