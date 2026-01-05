import { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Zap, Save, Type } from 'lucide-react';

const PRESETS = {
    origin: {
        '--bg-deep': '#050505',
        '--bg-primary': '#0a0a0c',
        '--bg-secondary': '#0f1013',
        '--accent-color': '#6366f1',
        '--accent-glow': 'rgba(99, 102, 241, 0.25)',
        '--glass-border': 'rgba(255, 255, 255, 0.08)',
        '--blur-intensity': '12px',
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
        '--font-sans': "'Outfit', sans-serif"
    },
    retro: {
        '--bg-deep': '#2c2137',
        '--bg-primary': '#a7a4e0',
        '--bg-secondary': '#8b88c3',
        '--accent-color': '#d32f2f',
        '--accent-glow': 'rgba(0, 0, 0, 0.1)',
        '--glass-border': '#444',
        '--blur-intensity': '0px',
        '--font-sans': "'Press Start 2P', monospace"
    },
    ocean: {
        '--bg-deep': '#001219',
        '--bg-primary': '#005f73',
        '--bg-secondary': '#0a9396',
        '--accent-color': '#94d2bd',
        '--accent-glow': 'rgba(148, 210, 189, 0.4)',
        '--glass-border': 'rgba(148, 210, 189, 0.2)',
        '--blur-intensity': '16px',
        '--font-sans': "'Outfit', sans-serif"
    }
};

export default function ThemeEditor() {
    const [themeConfig, setThemeConfig] = useState<any>(PRESETS.origin);

    useEffect(() => {
        // Load custom theme if exists
        const saved = localStorage.getItem('custom_theme');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setThemeConfig(parsed);
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
        applyTheme(newConfig);
    };

    const saveTheme = () => {
        localStorage.setItem('custom_theme', JSON.stringify(themeConfig));
        alert('Thème personnalisé sauvegardé !');
    };

    const resetToPreset = (name: keyof typeof PRESETS) => {
        const preset = PRESETS[name];
        setThemeConfig(preset);
        applyTheme(preset);
    };

    return (
        <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '16px', border: '1px solid var(--glass-border)', height: '100%', display: 'flex', flexDirection: 'column', gap: '25px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Palette size={24} color="var(--accent-color)" /> Éditeur de Thème Complet
                </h3>
                <button
                    onClick={saveTheme}
                    style={{ padding: '10px 20px', background: 'var(--accent-color)', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Save size={18} /> SAUVEGARDER
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', flex: 1, overflowY: 'auto', paddingRight: '10px' }}>

                {/* Section: Presets */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={18} color="#fbbf24" /> Préréglages
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {Object.keys(PRESETS).map(name => (
                            <button
                                key={name}
                                onClick={() => resetToPreset(name as any)}
                                style={{
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    textTransform: 'capitalize',
                                    cursor: 'pointer'
                                }}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section: Couleurs */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sun size={18} color="var(--accent-color)" /> Couleurs & Identité
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <ColorInput label="Accent Principal" value={themeConfig['--accent-color']} onChange={v => handleChange('--accent-color', v)} />
                        <ColorInput label="Fond Profond" value={themeConfig['--bg-deep']} onChange={v => handleChange('--bg-deep', v)} />
                        <ColorInput label="Fond Primaire" value={themeConfig['--bg-primary']} onChange={v => handleChange('--bg-primary', v)} />
                        <ColorInput label="Fond Secondaire" value={themeConfig['--bg-secondary']} onChange={v => handleChange('--bg-secondary', v)} />
                    </div>
                </div>

                {/* Section: Effets & Verre */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Moon size={18} color="#60a5fa" /> Effets de Verre (Glass)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <ColorInput label="Bordure Verre" value={themeConfig['--glass-border']} onChange={v => handleChange('--glass-border', v)} />
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8em', color: '#888', marginBottom: '8px' }}>Intensité du Flou ({themeConfig['--blur-intensity']})</label>
                            <input
                                type="range" min="0" max="32" step="1"
                                value={parseInt(themeConfig['--blur-intensity'])}
                                onChange={e => handleChange('--blur-intensity', `${e.target.value}px`)}
                                style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Typographie */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Type size={18} color="#c084fc" /> Typographie
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { name: 'Modern Sans', val: "'Outfit', sans-serif" },
                            { name: 'Retro Pixel', val: "'Press Start 2P', monospace" },
                            { name: 'Monospace', val: "'JetBrains Mono', monospace" }
                        ].map(f => (
                            <button
                                key={f.name}
                                onClick={() => handleChange('--font-sans', f.val)}
                                style={{
                                    padding: '10px',
                                    background: themeConfig['--font-sans'] === f.val ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                                    color: themeConfig['--font-sans'] === f.val ? 'black' : 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontFamily: f.val
                                }}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ColorInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85em', color: '#aaa' }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    style={{ width: '80px', background: 'black', border: '1px solid #333', color: 'white', fontSize: '10px', padding: '4px', borderRadius: '4px' }}
                />
                <input
                    type="color"
                    value={value.startsWith('#') ? value : '#6366f1'}
                    onChange={e => onChange(e.target.value)}
                    style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
            </div>
        </div>
    );
}
