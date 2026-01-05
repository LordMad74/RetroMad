import { useState, useEffect, useRef } from 'react';
import { Gamepad as GamepadIcon, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GamepadTester() {
    const [gamepads, setGamepads] = useState<Gamepad[]>([]);
    const [activeGamepadIndex, setActiveGamepadIndex] = useState<number | null>(null);
    const [buttonStates, setButtonStates] = useState<boolean[]>([]);
    const [axesStates, setAxesStates] = useState<number[]>([]);
    const requestRef = useRef<number>();

    const updateGamepadStatus = () => {
        const gps = navigator.getGamepads();
        const connectedGps = Array.from(gps).filter(gp => gp !== null) as Gamepad[];
        setGamepads(connectedGps);

        if (activeGamepadIndex !== null) {
            const gp = gps[activeGamepadIndex];
            if (gp) {
                setButtonStates(gp.buttons.map(b => b.pressed));
                setAxesStates(Array.from(gp.axes));
            }
        }
        requestRef.current = requestAnimationFrame(updateGamepadStatus);
    };

    useEffect(() => {
        window.addEventListener("gamepadconnected", updateGamepadStatus);
        window.addEventListener("gamepaddisconnected", updateGamepadStatus);
        requestRef.current = requestAnimationFrame(updateGamepadStatus);

        return () => {
            window.removeEventListener("gamepadconnected", updateGamepadStatus);
            window.removeEventListener("gamepaddisconnected", updateGamepadStatus);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [activeGamepadIndex]);

    return (
        <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '16px', border: '1px solid var(--glass-border)', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <GamepadIcon size={24} color="var(--accent-color)" /> Test de Manette
                </h3>
                <div style={{ fontSize: '0.8em', background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '20px', color: '#888' }}>
                    {gamepads.length} Manette(s) détectée(s)
                </div>
            </div>

            {gamepads.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666', textAlign: 'center' }}>
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <GamepadIcon size={64} opacity={0.2} />
                    </motion.div>
                    <p style={{ marginTop: '20px', fontSize: '1.1em' }}>Aucune manette détectée.<br /><span style={{ fontSize: '0.8em' }}>Branchez une manette USB ou connectez-la via Bluetooth.</span></p>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '30px', flex: 1, overflow: 'hidden' }}>
                    {/* List of Connected Gamepads */}
                    <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {gamepads.map((gp) => (
                            <button
                                key={gp.index}
                                onClick={() => setActiveGamepadIndex(gp.index)}
                                style={{
                                    padding: '15px',
                                    borderRadius: '12px',
                                    background: activeGamepadIndex === gp.index ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                                    color: activeGamepadIndex === gp.index ? 'black' : 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                    fontWeight: 'bold',
                                    fontSize: '0.9em'
                                }}
                            >
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gp.id}</div>
                                <div style={{ fontSize: '0.7em', color: activeGamepadIndex === gp.index ? 'black' : '#888', marginTop: '5px' }}>Index: {gp.index}</div>
                            </button>
                        ))}
                    </div>

                    {/* Active Gamepad Input Visualization */}
                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column', gap: '25px', overflowY: 'auto' }}>
                        {activeGamepadIndex !== null ? (
                            <>
                                <div>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9em', color: '#888', textTransform: 'uppercase' }}>Axes (Analogiques)</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                                        {axesStates.map((val, i) => (
                                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ fontSize: '0.7em', color: '#666', marginBottom: '8px' }}>AXE {i}</div>
                                                <div style={{ height: '4px', background: '#333', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
                                                    <motion.div
                                                        animate={{ x: (val * 100) + '%' }}
                                                        style={{ position: 'absolute', left: '50%', top: 0, width: '4px', height: '100%', background: 'var(--accent-color)', marginLeft: '-2px' }}
                                                    />
                                                </div>
                                                <div style={{ textAlign: 'center', fontSize: '0.8em', marginTop: '5px', fontFamily: 'monospace' }}>{val.toFixed(2)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9em', color: '#888', textTransform: 'uppercase' }}>Boutons</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {buttonStates.map((pressed, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    scale: pressed ? 1.1 : 1,
                                                    backgroundColor: pressed ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                                                    borderColor: pressed ? 'white' : 'rgba(255,255,255,0.1)'
                                                }}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.8em',
                                                    fontWeight: 'bold',
                                                    color: pressed ? 'black' : '#666',
                                                    border: '1px solid'
                                                }}
                                            >
                                                {i}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', padding: '15px', background: 'rgba(255, 45, 85, 0.05)', borderRadius: '10px', border: '1px dashed var(--accent-color)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <Zap size={20} color="var(--accent-color)" />
                                    <div style={{ fontSize: '0.85em', color: '#aaa' }}>
                                        <strong>Astuce :</strong> Si votre manette réagit ici mais pas dans les jeux, vérifiez la configuration du cœur dans RetroArch ou changez le "Device Index" dans les paramètres d'entrée.
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                                Sélectionnez une manette à gauche pour tester ses entrées.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
