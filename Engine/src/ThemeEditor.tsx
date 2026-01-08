import { useState, useEffect } from 'react';
import { Palette, Sun, Type, Layout, Sparkles, RefreshCw, Layers, Terminal, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESETS = {
    origin: {
        '--bg-deep': '#050505',
        '--bg-primary': '#0a0a0c',
        '--bg-secondary': '#0f1013',
        '--accent-color': '#6366f1',
        '--accent-glow': 'rgba(99, 102, 241, 0.25)',
        '--glass-border': 'rgba(255, 255, 255, 0.08)',
        '--blur-intensity': '12px',
        '--radius-main': '16px',
        '--radius-card': '12px',
        '--glow-strength': '15px',
        '--font-sans': "'Outfit', sans-serif"
    },
    cyber: {
        '--bg-deep': '#0d0221',
        '--bg-primary': '#19042b',
        '--bg-secondary': '#240a3d',
        '--accent-color': '#ff0055',
        '--accent-glow': 'rgba(255, 0, 85, 0.6)',
        '--glass-border': 'rgba(0, 243, 255, 0.3)',
        '--blur-intensity': '8px',
        '--radius-main': '4px',
        '--radius-card': '2px',
        '--glow-strength': '25px',
        '--font-sans': "'Outfit', sans-serif"
    },
    toxic: {
        '--bg-deep': '#001a00',
        '--bg-primary': '#002600',
        '--bg-secondary': '#003300',
        '--accent-color': '#39ff14',
        '--accent-glow': 'rgba(57, 255, 20, 0.4)',
        '--glass-border': 'rgba(57, 255, 20, 0.2)',
        '--blur-intensity': '10px',
        '--radius-main': '20px',
        '--radius-card': '10px',
        '--glow-strength': '12px',
        '--font-sans': "'JetBrains Mono', monospace"
    },
    gold: {
        '--bg-deep': '#121212',
        '--bg-primary': '#1a1a1a',
        '--bg-secondary': '#242424',
        '--accent-color': '#d4af37',
        '--accent-glow': 'rgba(212, 175, 55, 0.3)',
        '--glass-border': 'rgba(212, 175, 55, 0.1)',
        '--blur-intensity': '20px',
        '--radius-main': '30px',
        '--radius-card': '20px',
        '--glow-strength': '20px',
        '--font-sans': "'Outfit', sans-serif"
    }
};

export default function ThemeEditor() {
    const [themeConfig, setThemeConfig] = useState<any>(PRESETS.origin);
    const [activeTab, setActiveTab] = useState<'colors' | 'layout' | 'effects' | 'creative' | 'font' | 'borders'>('colors');
    const [extraEffects, setExtraEffects] = useState({ crt: false, tilt: true, rgb: false, particles: false });

    useEffect(() => {
        const saved = localStorage.getItem('custom_theme');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setThemeConfig((prev: any) => ({ ...prev, ...parsed }));
                applyTheme(parsed);
            } catch (e) { }
        }
    }, []);

    const applyTheme = (config: any) => {
        const root = document.documentElement;
        Object.keys(config).forEach(key => {
            root.style.setProperty(key, config[key]);
        });
    };

    const handleChange = (key: string, value: string) => {
        const newConfig = { ...themeConfig, [key]: value };
        setThemeConfig(newConfig);
        applyTheme({ [key]: value });
    };

    const saveTheme = () => {
        localStorage.setItem('custom_theme', JSON.stringify(themeConfig));
        alert('🎨 DESIGN STUDIO : Votre chef-d\'œuvre a été sauvegardé !');
    };

    const randomize = () => {
        const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        const newConfig = {
            ...themeConfig,
            '--accent-color': randomColor(),
            '--bg-deep': Math.random() > 0.5 ? '#050505' : '#1a1a20',
            '--radius-main': Math.floor(Math.random() * 40) + 'px',
            '--radius-card': Math.floor(Math.random() * 20) + 'px',
            '--blur-intensity': Math.floor(Math.random() * 25) + 'px',
            '--glow-strength': Math.floor(Math.random() * 40) + 'px',
            '--border-width': Math.floor(Math.random() * 4) + 'px',
            '--border-opacity': (Math.random() * 0.4).toFixed(2),
        };
        setThemeConfig(newConfig);
        applyTheme(newConfig);
    };

    return (
        <div style={{ display: 'flex', gap: '30px', height: '100%', color: 'white' }}>

            {/* PANNEAU DE CONTRÔLE (GAUCHE) */}
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
                {/* Header Studio */}
                <div style={{ padding: '25px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4em', fontWeight: '800' }}>
                            <Palette size={24} color="var(--accent-color)" /> DESIGN STUDIO
                        </h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={randomize} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'white' }} title="Aléatoire"><RefreshCw size={18} /></button>
                            <button onClick={saveTheme} style={{ background: 'var(--accent-color)', border: 'none', borderRadius: '8px', padding: '8px 15px', cursor: 'pointer', color: 'black', fontWeight: 'bold', fontSize: '0.8em' }}>SAUVER</button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px' }}>
                        {[
                            { id: 'colors', icon: <Sun size={14} />, label: 'Couleurs' },
                            { id: 'layout', icon: <Layout size={14} />, label: 'Structure' },
                            { id: 'borders', icon: <Layers size={14} />, label: 'Bordures' },
                            { id: 'effects', icon: <Sparkles size={14} />, label: 'Effets' },
                            { id: 'font', icon: <Type size={14} />, label: 'Texte' }
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
                    <button
                        onClick={() => setActiveTab('creative')}
                        style={{
                            width: '100%', marginTop: '10px', padding: '10px', background: activeTab === 'creative' ? 'linear-gradient(90deg, #ff00ff, #00ffff)' : 'rgba(255,255,255,0.05)',
                            border: 'none', borderRadius: '12px', cursor: 'pointer', color: activeTab === 'creative' ? 'white' : '#ff4ade', fontWeight: 'bold', fontSize: '0.8em',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: activeTab === 'creative' ? '0 0 20px rgba(255,0,255,0.4)' : 'none'
                        }}
                    >
                        <Zap size={16} /> LABORATOIRE CRÉATIF
                    </button>
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
                            {activeTab === 'colors' && (
                                <>
                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Identité Visuelle</div>
                                    <ColorInput label="Accent Principal" value={themeConfig['--accent-color']} onChange={v => handleChange('--accent-color', v)} />
                                    <ColorInput label="Fond Profond" value={themeConfig['--bg-deep']} onChange={v => handleChange('--bg-deep', v)} />
                                    <ColorInput label="Fond Panel" value={themeConfig['--bg-primary']} onChange={v => handleChange('--bg-primary', v)} />

                                    <div style={{ marginTop: '10px', color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Presets Rapides</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {Object.keys(PRESETS).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => { setThemeConfig(PRESETS[p as keyof typeof PRESETS]); applyTheme(PRESETS[p as keyof typeof PRESETS]); }}
                                                style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white', fontSize: '0.8em', textTransform: 'capitalize', cursor: 'pointer' }}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {activeTab === 'layout' && (
                                <>
                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Arrondis (Bords)</div>
                                    <RangeSlider label="Coins de l'interface" min={0} max={50} value={parseInt(themeConfig['--radius-main'])} onChange={v => handleChange('--radius-main', v + 'px')} />
                                    <RangeSlider label="Coins des cartes" min={0} max={30} value={parseInt(themeConfig['--radius-card'])} onChange={v => handleChange('--radius-card', v + 'px')} />
                                </>
                            )}

                            {activeTab === 'borders' && (
                                <>
                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Style des Bordures</div>
                                    <RangeSlider label="Épaisseur des bordures" min={0} max={10} value={parseInt(themeConfig['--border-width'] || '1')} unit="px" onChange={v => handleChange('--border-width', v + 'px')} />
                                    <RangeSlider label="Opacité des bordures" min={0} max={100} value={Math.round((parseFloat(themeConfig['--border-opacity'] || '0.1')) * 100)} unit="%" onChange={v => handleChange('--border-opacity', (v / 100).toString())} />
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.85em', color: '#ccc', marginBottom: '10px' }}>Type de Ligne</div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {['solid', 'dashed', 'dotted', 'double'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => handleChange('--border-style', type)}
                                                    style={{
                                                        flex: 1, padding: '8px', borderRadius: '6px', border: themeConfig['--border-style'] === type ? '1px solid var(--accent-color)' : '1px solid #333',
                                                        background: themeConfig['--border-style'] === type ? 'rgba(255,45,85,0.1)' : 'transparent', color: 'white', fontSize: '0.7em', textTransform: 'capitalize', cursor: 'pointer'
                                                    }}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'effects' && (
                                <>
                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Ambiance & Glow</div>
                                    <RangeSlider label="Intensité Flou (Glass)" min={0} max={40} value={parseInt(themeConfig['--blur-intensity'])} onChange={v => handleChange('--blur-intensity', v + 'px')} />
                                    <RangeSlider label="Force du Glow" min={0} max={50} value={parseInt(themeConfig['--glow-strength'])} onChange={v => handleChange('--glow-strength', v + 'px')} />
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
                                        <div style={{ fontSize: '0.8em', color: '#ff4ade', fontWeight: 'bold', marginBottom: '5px' }}>💡 Conseil de designer</div>
                                        <div style={{ fontSize: '0.75em', color: '#aaa', lineHeight: '1.4' }}>Utilisez un flou élevé (20px+) avec un fond sombre pour un effet "Luxury".</div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'font' && (
                                <>
                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Styles d'écriture</div>
                                    {[
                                        { name: 'Outfit (Moderne)', val: "'Outfit', sans-serif" },
                                        { name: 'Press Start (Rétro)', val: "'Press Start 2P', monospace" },
                                        { name: 'JetBrains (Code)', val: "'JetBrains Mono', monospace" },
                                        { name: 'Inter (Standard)', val: "'Inter', sans-serif" }
                                    ].map(f => (
                                        <button
                                            key={f.name}
                                            onClick={() => handleChange('--font-sans', f.val)}
                                            style={{
                                                padding: '15px', textAlign: 'left', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                                background: themeConfig['--font-sans'] === f.val ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                                                color: themeConfig['--font-sans'] === f.val ? 'black' : 'white',
                                                fontFamily: f.val
                                            }}
                                        >
                                            {f.name}
                                        </button>
                                    ))}
                                </>
                            )}

                            {activeTab === 'creative' && (
                                <>
                                    <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '1px' }}>Effets Visuels Avancés</div>
                                    <ToggleEffect
                                        label="Mode CRT (Scanlines)"
                                        active={extraEffects.crt}
                                        onChange={() => setExtraEffects(prev => ({ ...prev, crt: !prev.crt }))}
                                    />
                                    <ToggleEffect
                                        label="Effet d'Inclinaison (Tilt)"
                                        active={extraEffects.tilt}
                                        onChange={() => setExtraEffects(prev => ({ ...prev, tilt: !prev.tilt }))}
                                    />
                                    <ToggleEffect
                                        label="Bordures RGB Animées"
                                        active={extraEffects.rgb}
                                        onChange={() => setExtraEffects(prev => ({ ...prev, rgb: !prev.rgb }))}
                                    />
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
                                        <div style={{ fontSize: '0.8em', color: '#ff4ade', fontWeight: 'bold', marginBottom: '5px' }}>🧪 Expérimentez !</div>
                                        <div style={{ fontSize: '0.75em', color: '#aaa', lineHeight: '1.4' }}>Ces effets sont expérimentaux et peuvent ne pas être compatibles avec tous les navigateurs.</div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* PRÉVISUALISATION (DROITE) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ color: '#888', fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Layers size={16} /> PRÉVISUALISATION EN TEMPS RÉEL
                </div>

                <div style={{
                    flex: 1,
                    background: 'var(--bg-deep)',
                    borderRadius: '24px',
                    border: '2px solid var(--glass-border)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Faux Header App */}
                    <div style={{ height: '60px', borderBottom: '1px solid var(--glass-border)', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '24px', height: '24px', background: 'var(--accent-color)', borderRadius: '5px' }}></div>
                        <div style={{ width: '100px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                            <div style={{ width: '40px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}></div>
                            <div style={{ width: '40px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}></div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flex: 1 }}>
                        {/* Fausse Sidebar */}
                        <div style={{ width: '180px', borderRight: '1px solid var(--glass-border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', opacity: 0.3 }}></div>
                            <div style={{ height: '40px', background: 'linear-gradient(90deg, var(--accent-color), transparent)', borderRadius: '8px', opacity: 0.8 }}></div>
                            {[1, 2, 3].map(i => <div key={i} style={{ height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}></div>)}
                        </div>

                        {/* Faux Contenu Central */}
                        <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>Ma Bibliothèque</div>
                                <div style={{ height: '35px', width: '120px', background: 'var(--accent-color)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '0.86em', fontWeight: 'bold' }}>BOUTON TEST</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                {[1, 2, 3].map(i => (
                                    <motion.div
                                        key={i}
                                        style={{
                                            height: '180px',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-card)',
                                            border: extraEffects.rgb ? '2px solid transparent' : '1px solid var(--glass-border)',
                                            backgroundImage: extraEffects.rgb ? 'linear-gradient(black, black), linear-gradient(90deg, #ff00ff, #00ffff, #ff00ff)' : 'none',
                                            backgroundOrigin: 'border-box',
                                            backgroundClip: 'content-box, border-box',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            transform: extraEffects.tilt ? `perspective(1000px) rotateY(${i * 5 - 10}deg) rotateX(5deg)` : 'none'
                                        }}
                                    >
                                        <div style={{ height: '100px', background: 'rgba(255,255,255,0.05)' }}></div>
                                        <div style={{ padding: '15px' }}>
                                            <div style={{ width: '60%', height: '10px', background: 'rgba(255,255,255,0.2)', marginBottom: '10px', borderRadius: '5px' }}></div>
                                            <div style={{ width: '40%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}></div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {extraEffects.crt && (
                                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%', zIndex: 10 }}></div>
                            )}

                            <div style={{
                                marginTop: 'auto', padding: '20px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 'var(--radius-main)',
                                border: '1px solid var(--glass-border)',
                                backdropFilter: 'blur(var(--blur-intensity))'
                            }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Panneau Flottant</div>
                                <div style={{ fontSize: '0.8em', color: '#888' }}>Admirez l'effet de flou et les arrondis personnalisés !</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '15px 25px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85em', color: '#ff4ade' }}>
                        <Terminal size={16} /> <span>Mode Expert Activé</span>
                    </div>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                        Toutes les modifications sont appliquées instantanément à l'ensemble de RetroMad.
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
                    value={value?.startsWith('#') ? value : '#000000'}
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

function RangeSlider({ label, min, max, value, unit = 'px', onChange }: { label: string, min: number, max: number, value: number, unit?: string, onChange: (v: number) => void }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px 15px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em' }}>
                <span style={{ color: '#ccc' }}>{label}</span>
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{value}{unit}</span>
            </div>
            <input
                type="range" min={min} max={max} value={value || 0}
                onChange={e => onChange(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
            />
        </div>
    );
}

function ToggleEffect({ label, active, onChange }: { label: string, active: boolean, onChange: () => void }) {
    return (
        <div
            onClick={onChange}
            style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: active ? 'rgba(255, 45, 85, 0.1)' : 'rgba(255,255,255,0.02)',
                padding: '12px 15px', borderRadius: '12px', cursor: 'pointer',
                border: active ? '1px solid rgba(255, 45, 85, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s'
            }}
        >
            <span style={{ fontSize: '0.9em', color: active ? 'white' : '#aaa' }}>{label}</span>
            <div style={{
                width: '40px', height: '20px', background: active ? 'var(--accent-color)' : '#333',
                borderRadius: '10px', position: 'relative', transition: 'all 0.3s'
            }}>
                <div style={{
                    position: 'absolute', top: '2px', left: active ? '22px' : '2px',
                    width: '16px', height: '16px', background: 'white', borderRadius: '50%',
                    transition: 'all 0.3s'
                }}></div>
            </div>
        </div>
    );
}
