import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Layout, Sparkles, Monitor, RefreshCw, Layers, Clock } from 'lucide-react';

interface KioskSettingsProps {
    config: {
        enabled: boolean;
        theme: string;
        effect: string;
        accentColor?: string;
        fontFamily?: string;
        scanlines?: boolean;
        wheelTilt?: number;
        glowIntensity?: number;
        borderWidth?: number;
        borderStyle?: string;
        idleDelay?: number;
        attractSpeed?: number;
    };
    onConfigChange: (key: string, value: any) => void;
    pexelsKey: string;
    onPexelsKeyChange: (val: string) => void;
    onSavePexelsKey: () => void;
}

export default function KioskSettings({ config, onConfigChange, pexelsKey, onPexelsKeyChange, onSavePexelsKey }: KioskSettingsProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'design' | 'effects' | 'borders' | 'attract'>('general');

    const themes = [
        { id: 'neon_arcade', name: 'Neon Arcade', desc: 'Style 80s Synthwave', img: 'media://media/images/themes/neon_arcade.png' },
        { id: 'classic_cabinet', name: 'Classic Cabinet', desc: 'Rétro Bois Noir', img: 'media://media/images/themes/retro_wood.png' },
        { id: 'future_glass', name: 'Future Glass', desc: 'Modern Minimalist', img: 'media://media/images/themes/future_glass.png' },
        { id: 'cyber_grid', name: 'Cyber Grid', desc: 'High-Tech Blueprint', img: 'media://media/images/themes/cyber_grid.png' },
    ];

    return (
        <div style={{ display: 'flex', gap: '30px', height: '100%', color: 'white' }}>

            {/* PANNEAU DE CONTRÔLE KIOSK */}
            <div style={{
                width: '400px',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '24px',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)'
            }}>
                {/* Header Studio Arcade */}
                <div style={{ padding: '25px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4em', fontWeight: '800' }}>
                            <Monitor size={24} color="var(--accent-color)" /> ARCADE STUDIO
                        </h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => {
                                    const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                                    onConfigChange('accentColor', randomColor());
                                    onConfigChange('wheelTilt', Math.floor(Math.random() * 40));
                                    onConfigChange('glowIntensity', Math.floor(Math.random() * 80));
                                }}
                                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'white' }}
                            >
                                <RefreshCw size={18} />
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                style={{ background: 'var(--accent-color)', border: 'none', borderRadius: '8px', padding: '8px 15px', cursor: 'pointer', color: 'black', fontWeight: 'bold', fontSize: '0.75em' }}
                            >
                                APPLIQUER
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px' }}>
                        {[
                            { id: 'general', icon: <Layout size={14} />, label: 'Base' },
                            { id: 'design', icon: <Palette size={14} />, label: 'Style' },
                            { id: 'borders', icon: <Layers size={14} />, label: 'Bords' },
                            { id: 'effects', icon: <Sparkles size={14} />, label: 'Effets' },
                            { id: 'attract', icon: <Clock size={14} />, label: 'Attract' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7em',
                                    background: activeTab === t.id ? 'var(--accent-color)' : 'transparent',
                                    color: activeTab === t.id ? 'black' : '#888',
                                    fontWeight: activeTab === t.id ? 'bold' : 'normal',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contenu Tab */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '25px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                        >
                            {activeTab === 'general' && (
                                <>
                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Démarrage & Comportement</div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.9em' }}>Auto-Start Kiosk</div>
                                        <input
                                            type="checkbox"
                                            checked={config.enabled}
                                            onChange={e => onConfigChange('enabled', e.target.checked)}
                                            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </div>
                                    <p style={{ fontSize: '0.75em', color: '#666', marginTop: '-10px', padding: '0 5px' }}>Lance l'application directement en mode borne d'arcade.</p>

                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>Thème de Base</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {themes.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => onConfigChange('theme', t.id)}
                                                style={{
                                                    padding: '10px', borderRadius: '10px', border: config.theme === t.id ? '1px solid var(--accent-color)' : '1px solid transparent',
                                                    background: config.theme === t.id ? 'rgba(255, 45, 85, 0.1)' : 'rgba(255,255,255,0.03)',
                                                    cursor: 'pointer', textAlign: 'left', color: config.theme === t.id ? 'white' : '#888'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.85em', fontWeight: 'bold' }}>{t.name}</div>
                                                <div style={{ fontSize: '0.65em', opacity: 0.6 }}>{t.desc}</div>
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>Média Automatique (Pexels)</div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="password" value={pexelsKey} onChange={e => onPexelsKeyChange(e.target.value)}
                                            placeholder="Clé API Pexels"
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #333', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '0.8em' }}
                                        />
                                        <button onClick={onSavePexelsKey} style={{ padding: '10px', background: 'var(--accent-color)', border: 'none', borderRadius: '8px', color: 'black', fontWeight: 'bold', fontSize: '0.7em' }}>OK</button>
                                    </div>
                                </>
                            )}

                            {activeTab === 'design' && (
                                <>
                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Personnalisation Visuelle</div>
                                    <ColorInput label="Couleur NÉON" value={config.accentColor || '#ff00ff'} onChange={v => onConfigChange('accentColor', v)} />

                                    <div style={{ marginTop: '10px', color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Typographie Arcade</div>
                                    {[
                                        { name: 'Orbitron (Futuriste)', val: "'Orbitron', sans-serif" },
                                        { name: 'Press Start (Pixel)', val: "'Press Start 2P', monospace" },
                                        { name: 'Modern Arcade', val: "'Outfit', sans-serif" }
                                    ].map(f => (
                                        <button
                                            key={f.name}
                                            onClick={() => onConfigChange('fontFamily', f.val)}
                                            style={{
                                                padding: '12px', textAlign: 'left', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                                background: config.fontFamily === f.val ? 'var(--accent-color)' : 'rgba(255,255,255,0.04)',
                                                color: config.fontFamily === f.val ? 'black' : 'white',
                                                fontFamily: f.val, fontSize: '0.8em'
                                            }}
                                        >
                                            {f.name}
                                        </button>
                                    ))}

                                    <RangeSlider label="Inclinaison Roue (Wheels)" min={0} max={45} value={config.wheelTilt || 0} onChange={v => onConfigChange('wheelTilt', v)} />
                                </>
                            )}

                            {activeTab === 'effects' && (
                                <>
                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Immersion & Effets</div>
                                    <RangeSlider label="Puissance du GLOW" min={0} max={100} value={config.glowIntensity || 50} onChange={v => onConfigChange('glowIntensity', v)} />

                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.9em' }}>Mode CRT (Scanlines)</div>
                                        <input
                                            type="checkbox"
                                            checked={config.scanlines}
                                            onChange={e => onConfigChange('scanlines', e.target.checked)}
                                            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                        />
                                    </div>

                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>Fond d'Ambiance</div>
                                    <select
                                        value={config.effect || 'none'}
                                        onChange={e => onConfigChange('effect', e.target.value)}
                                        style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #444', color: 'white', borderRadius: '10px', outline: 'none' }}
                                    >
                                        <option value="none">Aucun (Noir)</option>
                                        <option value="stars">Vitesse Lumière (Étoiles)</option>
                                        <option value="nebula">Brouillard Cosmique</option>
                                        <option value="grid">Grille Rétro Synthwave</option>
                                        <option value="hexagons">Cyber Ruche</option>
                                        <option value="particles">Particules Orbits</option>
                                    </select>
                                </>
                            )}

                            {activeTab === 'borders' && (
                                <>
                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Bordures de la Borne</div>
                                    <RangeSlider label="Épaisseur des cadres" min={0} max={20} value={config.borderWidth || 4} onChange={v => onConfigChange('borderWidth', v)} />
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.85em', color: '#ccc', marginBottom: '10px' }}>Type de bordure</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {['solid', 'double', 'groove', 'ridge'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => onConfigChange('borderStyle', type)}
                                                    style={{
                                                        padding: '8px', borderRadius: '6px', border: config.borderStyle === type ? '1px solid var(--accent-color)' : '1px solid #333',
                                                        background: config.borderStyle === type ? 'rgba(255,45,85,0.1)' : 'transparent', color: 'white', fontSize: '0.7em', textTransform: 'capitalize', cursor: 'pointer'
                                                    }}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'attract' && (
                                <>
                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Mode Démo (Attract Mode)</div>
                                    <RangeSlider label="Délai d'inactivité (sec)" min={10} max={300} value={config.idleDelay || 60} onChange={v => onConfigChange('idleDelay', v)} />
                                    <RangeSlider label="Vitesse de défilement (sec)" min={2} max={20} value={config.attractSpeed || 8} onChange={v => onConfigChange('attractSpeed', v)} />
                                    <div style={{ background: 'rgba(255, 45, 85, 0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255, 45, 85, 0.2)' }}>
                                        <div style={{ fontSize: '0.8em', color: '#ff4ade', fontWeight: 'bold' }}>🎮 NOTE</div>
                                        <div style={{ fontSize: '0.75em', color: '#aaa', marginTop: '5px' }}>Le mode attract change automatiquement de jeu quand personne ne touche à la borne.</div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* PRÉVISUALISATION ARCADE (DROITE) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ color: '#888', fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Monitor size={16} /> PRÉVISUALISATION BORNE D'ARCADE
                </div>

                <div style={{
                    flex: 1,
                    background: '#050505',
                    borderRadius: '24px',
                    border: `${config.borderWidth || 4}px ${config.borderStyle || 'solid'} ${config.accentColor || '#111'}`,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 0 50px rgba(0,0,0,1)'
                }}>
                    {/* Fake Arcade Game UI */}
                    <div style={{
                        flex: 1, position: 'relative', overflow: 'hidden',
                        background: 'radial-gradient(circle at center, #1a0033 0%, #000 100%)'
                    }}>
                        {/* Simulation Effect Grid */}
                        {config.effect === 'grid' && (
                            <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%', background: 'repeating-linear-gradient(90deg, transparent 0, transparent 40px, rgba(255,0,255,0.1) 40px, rgba(255,0,255,0.1) 41px)', transform: 'perspective(100px) rotateX(60deg)', transformOrigin: 'bottom' }}></div>
                        )}

                        {/* Fake Game Logo/Info */}
                        <div style={{ position: 'absolute', top: '20%', left: '50px', zIndex: 10 }}>
                            <div style={{
                                fontFamily: config.fontFamily || "'Orbitron', sans-serif",
                                fontSize: '2.5em', fontWeight: 'bold', color: 'white',
                                textShadow: `0 0 ${(config.glowIntensity || 50) / 5}px ${config.accentColor || '#ff00ff'}`
                            }}>
                                SUPER GAME
                            </div>
                            <div style={{
                                background: config.accentColor || '#ff00ff',
                                color: 'black', padding: '5px 15px', borderRadius: '4px',
                                display: 'inline-block', fontSize: '0.8em', fontWeight: 'bold', marginTop: '10px'
                            }}>
                                ARCADE CLASSIC
                            </div>
                        </div>

                        {/* Fake Wheel */}
                        <div style={{
                            position: 'absolute', right: '20px', top: '50%', transform: `translateY(-50%) rotateY(${config.wheelTilt || 0}deg)`,
                            display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end'
                        }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{
                                    width: i === 3 ? '220px' : '180px', height: '60px',
                                    background: i === 3 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                                    borderRight: i === 3 ? `4px solid ${config.accentColor || '#ff00ff'}` : 'none',
                                    borderRadius: '8px', opacity: i === 3 ? 1 : 0.4
                                }}></div>
                            ))}
                        </div>

                        {/* Scanlines Overlay Simulation */}
                        {config.scanlines && (
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.5) 50%)', backgroundSize: '100% 4px', pointerEvents: 'none', zIndex: 100 }}></div>
                        )}
                    </div>

                    {/* Bottom Instructions */}
                    <div style={{
                        height: '40px', background: 'rgba(0,0,0,0.8)', padding: '0 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7em', color: '#666'
                    }}>
                        <div>[ENTER] PLAY</div>
                        <div style={{ color: config.accentColor || '#ff00ff', fontWeight: 'bold' }}>KIOSK MODE V2</div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '15px 25px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85em', color: config.accentColor || '#ff00ff' }}>
                        <Sparkles size={16} /> <span>Mode Arcade Expert</span>
                    </div>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                        Personnalisez l'ambiance visuelle de votre borne dédiée.
                    </div>
                </div>
            </div>
        </div>
    );
}

function ColorInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 15px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.9em', color: '#ccc' }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="color"
                    value={value || '#ff00ff'}
                    onChange={e => onChange(e.target.value)}
                    style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '50%' }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    style={{ width: '80px', background: 'transparent', border: 'none', color: '#888', fontSize: '0.75em', fontFamily: 'monospace' }}
                />
            </div>
        </div>
    );
}

function RangeSlider({ label, min, max, value, onChange }: { label: string, min: number, max: number, value: number, onChange: (v: number) => void }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px 15px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em' }}>
                <span style={{ color: '#ccc' }}>{label}</span>
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{value}</span>
            </div>
            <input
                type="range" min={min} max={max} value={value || 0}
                onChange={e => onChange(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
            />
        </div>
    );
}
