import { useCallback, useRef, useEffect } from 'react';

// Theme-based Sound Synthesis
// Generates UI sounds programmatically using Web Audio API
// No mp3 files required!

export const useAudio = () => {
    const audioCtx = useRef<AudioContext | null>(null);

    // Initialize AudioContext on user interaction (autostart policy)
    const initAudio = () => {
        if (!audioCtx.current) {
            audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtx.current.state === 'suspended') {
            audioCtx.current.resume();
        }
    };

    const playSound = useCallback((type: 'hover' | 'click' | 'success' | 'error' | 'back') => {
        initAudio();
        if (!audioCtx.current) return;

        const ctx = audioCtx.current;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        // Sound Profiles
        switch (type) {
            case 'hover':
                // Light Tick (High freq sine)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.06);
                break;

            case 'click':
                // Affirmative Blip (Square/Triangle)
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.16);
                break;

            case 'back':
                // Cancel sound (Low pitch drop)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'success':
                // Triumph (Arpeggio style)
                osc.type = 'square';
                gainNode.gain.value = 0.1;

                // Note 1
                osc.frequency.setValueAtTime(440, now); // A4
                osc.frequency.setValueAtTime(554, now + 0.1); // C#5
                osc.frequency.setValueAtTime(659, now + 0.2); // E5

                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

                osc.start(now);
                osc.stop(now + 0.6);
                break;

            case 'error':
                // Buzz
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.2);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.25);
                break;
        }

    }, []);

    return { playSound };
};
