import { useCallback, useRef, useEffect } from 'react';

// Theme-based Sound Synthesis
// Generates UI sounds and BGM programmatically using Web Audio API
// No mp3 files required!

export const useAudio = () => {
    const audioCtx = useRef<AudioContext | null>(null);
    const bgmRef = useRef<{ active: boolean; timeout: any; nodes: Set<any>; currentTrack?: string }>({
        active: false,
        timeout: null,
        nodes: new Set()
    });

    // Initialize AudioContext on user interaction
    const initAudio = () => {
        if (!audioCtx.current) {
            audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtx.current.state === 'suspended') {
            audioCtx.current.resume();
        }
    };

    const stopBGM = useCallback(() => {
        bgmRef.current.active = false;
        if (bgmRef.current.timeout) clearTimeout(bgmRef.current.timeout);

        bgmRef.current.nodes.forEach(n => {
            try { n.stop(); n.disconnect(); } catch (e) { }
        });
        bgmRef.current.nodes.clear();
    }, []);

    const startBGM = useCallback((track: 'synthwave' | 'chiptune' | 'ambient' = 'synthwave') => {
        initAudio();
        const ctx = audioCtx.current;
        if (!ctx) return;

        if (bgmRef.current.active) stopBGM();

        bgmRef.current.active = true;
        bgmRef.current.currentTrack = track;

        const mainGain = ctx.createGain();
        mainGain.gain.setValueAtTime(0, ctx.currentTime);
        mainGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 4);
        mainGain.connect(ctx.destination);

        // --- MUSICAL CONSTANTS ---
        // Scales (frequencies for C Minor / Dorian / Lydian based on track)
        const C_MINOR = [65.41, 73.42, 77.78, 87.31, 98.00, 110.00, 116.54, 130.81]; // C2 scale
        const C_CHORD_PROGS = [
            [0, 2, 4], // Cm
            [5, 0, 2], // Ab
            [6, 1, 3], // Bb
            [4, 6, 1]  // Gm
        ];

        let tempo = 200; // ms per tick (16th notes roughly)
        let baseOctave = 1;

        if (track === 'chiptune') {
            tempo = 120; // Fast
            baseOctave = 2; // Higher pitch
        } else if (track === 'ambient') {
            tempo = 800; // Slow
            baseOctave = 0; // Deep
        }

        let step = 0;
        let measure = 0;

        // --- INSTRUMENTS ---
        const playNote = (freq: number, type: OscillatorType, duration: number, vol: number, filterVal: number) => {
            if (!freq) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(filterVal, ctx.currentTime);

            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(mainGain);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);

            bgmRef.current.nodes.add(osc);
            osc.onended = () => bgmRef.current.nodes.delete(osc);
        };

        const playTick = () => {
            if (!bgmRef.current.active) return;

            // Structure: 16 beats per measure.
            const beatInMeasure = step % 16;
            if (beatInMeasure === 0) measure++;

            // Progression loop length (e.g. 8 measures = 1 long cycle)
            const progIndex = Math.floor(measure / 2) % C_CHORD_PROGS.length;
            const currentChord = C_CHORD_PROGS[progIndex]; // [root, 3rd, 5th] indices
            const rootFreq = C_MINOR[currentChord[0]] * Math.pow(2, baseOctave);

            // -- BASS (Every beat or syncopated) --
            // Synthwave: Driving 8th notes. Chiptune: Syncopated. Ambient: Long drones.
            if (track === 'synthwave') {
                if (beatInMeasure % 2 === 0) { // 8th notes
                    const oct = (beatInMeasure % 8 === 0) ? 0.5 : 1;
                    playNote(rootFreq * oct, 'sawtooth', 0.2, 0.15, 600);
                }
            } else if (track === 'chiptune') {
                if ([0, 3, 6, 10, 12].includes(beatInMeasure)) { // Funky rhythm
                    playNote(rootFreq, 'square', 0.1, 0.1, 1200);
                }
            } else if (track === 'ambient') {
                if (beatInMeasure === 0) { // Long drone start of measure
                    playNote(rootFreq * 0.5, 'triangle', 4.0, 0.1, 300);
                }
            }

            // -- PADS / CHORDS (Evolving) --
            if (step % 32 === 0) { // Change every 2 measures
                const chordOct = (track === 'chiptune') ? 4 : 2;
                currentChord.forEach((noteIdx) => {
                    const f = C_MINOR[noteIdx] * chordOct;
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = (track === 'synthwave') ? 'sawtooth' : 'sine';
                    osc.frequency.value = f;

                    // Long fade in/out
                    g.gain.setValueAtTime(0, ctx.currentTime);
                    g.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 2);
                    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 8); // 8s duration

                    osc.connect(g);
                    g.connect(mainGain);
                    osc.start();
                    osc.stop(ctx.currentTime + 8);
                    bgmRef.current.nodes.add(osc);
                });
            }

            // -- MELODY / ARPEGGIO (Generative) --
            // More active in chiptune, sparse in ambient
            let melodyChance = 0.3;
            if (track === 'chiptune') melodyChance = 0.6;
            if (track === 'ambient') melodyChance = 0.1;

            if (Math.random() < melodyChance) {
                // Pick a note from current chord + extended scale
                const scaleIdx = currentChord[Math.floor(Math.random() * currentChord.length)];
                // Variation: sometimes go up an octave
                const octVar = (Math.random() > 0.7) ? 2 : 1;
                // Variation: Pentatonic runs
                const note = C_MINOR[(scaleIdx + Math.floor(Math.random() * 3)) % C_MINOR.length] * 4 * octVar;

                const type = (track === 'chiptune') ? 'square' : 'triangle';
                const dur = (track === 'ambient') ? 1.5 : 0.2;

                playNote(note, type, dur, 0.05, 1500);
            }

            step++;
            bgmRef.current.timeout = setTimeout(playTick, tempo);
        };

        playTick();
    }, [stopBGM]);

    const playSound = useCallback((type: 'hover' | 'click' | 'success' | 'error' | 'back') => {
        initAudio();
        const ctx = audioCtx.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        const now = ctx.currentTime;

        switch (type) {
            case 'hover':
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
                gainNode.gain.setValueAtTime(0.03, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now); osc.stop(now + 0.06);
                break;
            case 'click':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.1);
                gainNode.gain.setValueAtTime(0.06, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now); osc.stop(now + 0.16);
                break;
            case 'back':
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
                gainNode.gain.setValueAtTime(0.06, now);
                gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(now); osc.stop(now + 0.2);
                break;
            case 'success':
                osc.type = 'square';
                gainNode.gain.setValueAtTime(0.06, now);
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(554, now + 0.1);
                osc.frequency.setValueAtTime(659, now + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                osc.start(now); osc.stop(now + 0.6);
                break;
            case 'error':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                gainNode.gain.setValueAtTime(0.06, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc.start(now); osc.stop(now + 0.25);
                break;
        }
    }, []);

    useEffect(() => {
        return () => stopBGM();
    }, [stopBGM]);

    return { playSound, startBGM, stopBGM };
};
