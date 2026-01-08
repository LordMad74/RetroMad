import { useState, useEffect } from 'react';
import { Trophy, Palette, Gamepad, Save, RefreshCw, Eye, EyeOff, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

const SHADERS = [
    { id: 'none', name: 'Original (Pixels)', desc: 'Image brute et nette', img: 'clean', path: '' },
    { id: 'crt', name: 'Retro CRT', desc: 'Scanlines et lueur néon', img: 'crt', path: 'shaders/shaders_slang/crt/crt-lumas.slangp' },
    { id: 'hd', name: 'HD Upscale', desc: 'Lissage intelligent (xBRZ)', img: 'hd', path: 'shaders/shaders_slang/interpolation/xbrz.slangp' },
];

const BEZELS = [
    { id: 'auto', name: 'Mode Automatique', desc: 'Détecte le bezel selon la console', img: 'clean', path: 'auto' },
    { id: 'none', name: 'Sans Overlay', desc: 'Plein écran standard', img: 'clean', path: '' },
    { id: 'classic', name: 'Handheld Style', desc: 'Cadre console portable', img: 'bezel', path: 'overlays/borders/handheld.cfg' },
    { id: 'nes', name: 'NES TV 80s', desc: 'Look télé cathodique vintage', img: 'nes', path: 'overlays/borders/nes-tv.cfg' },
    { id: 'snes', name: 'Super Nintendo', desc: 'Cadre thématique 16-bit', img: 'snes', path: 'overlays/borders/snes.cfg' },
];

export default function RetroArchSettings() {
    const [config, setConfig] = useState<any>({});
    const [appConfig, setAppConfig] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const cfg = await window.electronAPI.getRetroArchConfig();
            const appCfg = await window.electronAPI.getConfig();
            setConfig(cfg || {});
            setAppConfig(appCfg || {});
        } catch (e) {
            console.error('Failed to load RA config', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (updates: any) => {
        setSaving(true);
        try {
            await window.electronAPI.setRetroArchConfig(updates);
            setConfig((prev: any) => ({ ...prev, ...updates }));
            // Optional: show toast or feedback
        } catch (e) {
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const toggleShader = async (shaderPath: string) => {
        const updates = {
            video_shader_enable: shaderPath !== '',
            video_shader: shaderPath
        };
        await handleSave(updates);
    };

    const toggleBezel = async (bezelPath: string) => {
        const isAuto = bezelPath === 'auto';
        const updates: any = {
            input_overlay_enable: bezelPath !== '' && !isAuto,
            input_overlay: isAuto ? '' : bezelPath
        };

        // Update local app state first for immediate UI feedback
        const newAppConfig = {
            ...appConfig,
            retroarch: { ...(appConfig.retroarch || {}), auto_bezel: isAuto }
        };
        setAppConfig(newAppConfig);

        // Send to backend
        await window.electronAPI.setConfig('retroarch', newAppConfig.retroarch);
        await handleSave(updates);
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}><RefreshCw className="spin" /> Chargement...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

            {/* 🎨 GESTIONNAIRE DE SHADERS */}
            <section style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '8px', background: 'rgba(0, 170, 255, 0.2)', borderRadius: '8px', color: '#00aaff' }}>
                        <Palette size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2em' }}>Gestionnaire de Shaders (Graphismes)</h3>
                        <p style={{ margin: 0, fontSize: '0.85em', color: '#888' }}>Personnalisez le rendu visuel de RetroArch</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {SHADERS.map((s) => (
                        <motion.div
                            key={s.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => toggleShader(s.path)}
                            style={{
                                cursor: 'pointer',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: (config.video_shader === s.path || (!config.video_shader && s.id === 'none')) ? '2px solid #00aaff' : '2px solid transparent',
                                background: 'rgba(0,0,0,0.3)',
                                position: 'relative'
                            }}
                        >
                            {/* DEMO IMAGE */}
                            <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                                <img
                                    src={`media://media/images/demo/${s.img}.png`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                                    alt={s.name}
                                />
                                {(config.video_shader === s.path || (!config.video_shader && s.id === 'none')) && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#00aaff', color: 'black', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7em', fontWeight: 'bold' }}>
                                        ACTIF
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '15px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1em', marginBottom: '4px' }}>{s.name}</div>
                                <div style={{ fontSize: '0.8em', color: '#888' }}>{s.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 🏆 RETROACHIEVEMENTS */}
            <section style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '8px', background: 'rgba(255, 215, 0, 0.2)', borderRadius: '8px', color: '#ffd700' }}>
                        <Trophy size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2em' }}>RetroAchievements</h3>
                        <p style={{ margin: 0, fontSize: '0.85em', color: '#888' }}>Débloquez des trophées en jouant à vos jeux retro</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                        <label style={{ fontSize: '0.9em', color: '#aaa' }}>Nom d'utilisateur</label>
                        <input
                            type="text"
                            value={config.cheevos_username || ''}
                            onChange={(e) => updateLocalConfig('cheevos_username', e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', padding: '12px', borderRadius: '8px', boxSizing: 'border-box', width: '100%', outline: 'none' }}
                            placeholder="MonPseudo"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                        <label style={{ fontSize: '0.9em', color: '#aaa' }}>Mot de passe / Token</label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={config.cheevos_password || ''}
                                onChange={(e) => updateLocalConfig('cheevos_password', e.target.value)}
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', padding: '12px', borderRadius: '8px', width: '100%', paddingRight: '45px', boxSizing: 'border-box', outline: 'none' }}
                                placeholder="••••••••"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={config.cheevos_enable === true}
                            onChange={(e) => updateLocalConfig('cheevos_enable', e.target.checked)}
                            style={{ width: '18px', height: '18px', accentColor: '#ffd700' }}
                        />
                        <span style={{ fontSize: '0.95em' }}>Activer les succès</span>
                    </label>

                    <button
                        onClick={() => handleSave({
                            cheevos_enable: config.cheevos_enable,
                            cheevos_username: config.cheevos_username,
                            cheevos_password: config.cheevos_password
                        })}
                        disabled={saving}
                        style={{ marginLeft: 'auto', background: '#ffd700', color: 'black', border: 'none', padding: '10px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {saving ? <RefreshCw className="spin" size={16} /> : <Save size={16} />}
                        Appliquer
                    </button>
                </div>
            </section>

            {/* 🖼️ OVERLAYS (BEZELS) */}
            <section style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '8px', background: 'rgba(255, 74, 222, 0.2)', borderRadius: '8px', color: '#ff4ade' }}>
                        <Layout size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2em' }}>Overlays Personnalisés (Bezels)</h3>
                        <p style={{ margin: 0, fontSize: '0.85em', color: '#888' }}>Habillez l'écran avec des cadres de consoles classiques</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {BEZELS.map((b) => (
                        <motion.div
                            key={b.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => toggleBezel(b.path)}
                            style={{
                                cursor: 'pointer',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: (
                                    (b.id === 'auto' && appConfig?.retroarch?.auto_bezel) ||
                                    (b.id === 'none' && !appConfig?.retroarch?.auto_bezel && !config.input_overlay) ||
                                    (b.id !== 'auto' && b.id !== 'none' && !appConfig?.retroarch?.auto_bezel && config.input_overlay === b.path)
                                ) ? '2px solid #ff4ade' : '2px solid transparent',
                                background: 'rgba(0,0,0,0.3)',
                                position: 'relative'
                            }}
                        >
                            <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                                <img
                                    src={`media://media/images/demo/${b.img}.png`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                                    alt={b.name}
                                />
                                {(
                                    (b.id === 'auto' && appConfig?.retroarch?.auto_bezel) ||
                                    (b.id === 'none' && !appConfig?.retroarch?.auto_bezel && !config.input_overlay) ||
                                    (b.id !== 'auto' && b.id !== 'none' && !appConfig?.retroarch?.auto_bezel && config.input_overlay === b.path)
                                ) && (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff4ade', color: 'black', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7em', fontWeight: 'bold' }}>
                                            ACTIF
                                        </div>
                                    )}
                            </div>
                            <div style={{ padding: '15px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1em', marginBottom: '4px' }}>{b.name}</div>
                                <div style={{ fontSize: '0.8em', color: '#888' }}>{b.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 🎮 CONFIGURATION MANETTES */}
            <section style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '8px', background: 'rgba(74, 222, 128, 0.2)', borderRadius: '8px', color: '#4ade80' }}>
                        <Gamepad size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2em' }}>Configuration Automatique des Manettes</h3>
                        <p style={{ margin: 0, fontSize: '0.85em', color: '#888' }}>Synchronisez et réinitialisez vos profils de contrôle</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, color: '#aaa', fontSize: '0.9em', lineHeight: '1.5' }}>
                        Cliquez sur synchroniser pour forcer la détection automatique des manettes et mettre à jour les profils RetroArch standard.
                        Cela résout souvent les problèmes de mapping incorrect sur les nouvelles manettes PS5/Xbox.
                    </div>
                    <button
                        onClick={syncControllers}
                        style={{ background: 'transparent', border: '1px solid #4ade80', color: '#4ade80', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <RefreshCw size={18} /> SYNCHRONISER
                    </button>
                </div>
            </section>
        </div>
    );

    function updateLocalConfig(key: string, value: any) {
        setConfig((prev: any) => ({ ...prev, [key]: value }));
    }

    async function syncControllers() {
        // We set typical flags for auto detection
        const updates = {
            input_autodetect_enable: true,
            input_joypad_driver: "xinput", // Assuming Windows as default
            input_menu_toggle_gamepad_combo: 2, // L3+R3 by default
        };
        await handleSave(updates);
        alert('Profils de manettes synchronisés !\nRelancez un jeu pour appliquer.');
    }
}
