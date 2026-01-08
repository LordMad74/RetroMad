import { useState, useEffect } from 'react';
import { Settings, Save, Monitor, Palette, Download } from 'lucide-react';

const SYSTEMS = [
    { id: 'global', name: 'Global (Tous les systèmes)' },
    { id: 'nes', name: 'Nintendo (NES)' },
    { id: 'snes', name: 'Super Nintendo (SNES)' },
    { id: 'n64', name: 'Nintendo 64' },
    { id: 'megadrive', name: 'Sega MegaDrive' },
    { id: 'psx', name: 'PlayStation' },
    { id: 'gba', name: 'GameBoy Advance' },
    { id: 'arcade', name: 'Arcade / MAME' },
];

const THEMES = [
    { id: 'origin', name: 'Origin (Classic)' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon' },
    { id: 'retro', name: 'Retro Wood' },
];

export default function ConfigPanel() {
    const [selectedSystem, setSelectedSystem] = useState('global');
    const [options, setOptions] = useState<any>({});
    const [currentTheme, setCurrentTheme] = useState('origin');

    // Kiosk Config
    const [kioskConfig, setKioskConfig] = useState({ theme: 'neon_arcade', attractMode: true, idleTime: 60 });

    // RetroArch Management
    const [systemCores, setSystemCores] = useState<any[]>([]);
    const [isBackingUp, setIsBackingUp] = useState(false);

    // RetroAchievements
    const [raUsername, setRaUsername] = useState('');
    const [raToken, setRaToken] = useState('');

    useEffect(() => {
        loadConfig();
    }, []);

    useEffect(() => {
        loadOptions(selectedSystem);
    }, [selectedSystem]);

    useEffect(() => {
        document.body.setAttribute('data-theme', currentTheme);
        // @ts-ignore
        window.electronAPI.setConfig('theme', currentTheme);
    }, [currentTheme]);

    const loadConfig = async () => {
        const cfg = await window.electronAPI.getConfig();
        if (cfg.theme) setCurrentTheme(cfg.theme);
        if (cfg.kiosk) setKioskConfig(cfg.kiosk);
        if (cfg.retroAchievements) {
            setRaUsername(cfg.retroAchievements.username || '');
            setRaToken(cfg.retroAchievements.token || '');
        }
    };

    const loadOptions = async (sysId: string) => {
        const opts = await window.electronAPI.getLaunchOptions(sysId);
        setOptions(opts);

        if (sysId !== 'global') {
            const cores = await window.electronAPI.getAvailableCores();
            // Determine core family from system ID mapping (simple heuristic or map)
            const map: Record<string, string> = { 'nes': 'nes', 'snes': 'snes', 'megadrive': 'megadrive', 'psx': 'psx', 'arcade': 'arcade' };
            const family = map[sysId] || sysId;
            setSystemCores(cores[family] || []);
        } else {
            setSystemCores([]);
        }
    };

    const handleOptionChange = (key: string, val: any) => {
        setOptions({ ...options, [key]: val });
    };

    const handleSave = async () => {
        await window.electronAPI.setLaunchOptions(selectedSystem, options);

        // Save Kiosk
        const currentCfg = await window.electronAPI.getConfig();
        currentCfg.kiosk = kioskConfig;
        currentCfg.retroAchievements = { username: raUsername, token: raToken };
        // @ts-ignore
        await window.electronAPI.setConfig('kiosk', kioskConfig); // Ideally backend handles full object merge
        alert('Configuration sauvegardée !');
    };

    const handleBackupSaves = async () => {
        setIsBackingUp(true);
        try {
            const res = await window.electronAPI.backupSaves();
            if (res.success) alert(`Backup créé : ${res.path}`);
            else alert('Erreur lors du backup');
        } catch (e) {
            alert('Erreur: ' + e);
        } finally {
            setIsBackingUp(false);
        }
    };



    const handleKioskChange = (key: string, val: any) => {
        setKioskConfig(prev => ({ ...prev, [key]: val }));
    };



    return (
        <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                <Settings size={32} /> Configuration Système
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

                {/* Left Column: Emulator Config */}
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '1.1em', fontWeight: 'bold' }}>Système Cible</label>
                        <select
                            value={selectedSystem}
                            onChange={e => setSelectedSystem(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'white',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                        >
                            {SYSTEMS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {selectedSystem !== 'global' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Moteur (Core)</label>
                                <select
                                    value={options.core || ''}
                                    onChange={e => handleOptionChange('core', e.target.value)}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                >
                                    <option value="">Automatique (Défaut)</option>
                                    {systemCores.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <input
                                type="checkbox"
                                checked={options.fullscreen !== false}
                                onChange={e => handleOptionChange('fullscreen', e.target.checked)}
                                style={{ transform: 'scale(1.5)', margin: '10px' }}
                            />
                            <label>Forcer le Plein Écran</label>
                        </div>
                    </div>



                    <div style={{ marginTop: '30px', textAlign: 'right' }}>
                        <button className="btn-primary" onClick={handleSave} style={{ padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}>
                            ENREGISTRER
                        </button>
                    </div>
                </div>

                {/* Right Column: Premium Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Theme Selector */}
                    <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <Palette size={24} color="#ec4899" />
                            <h3 style={{ margin: 0 }}>Thème UI</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setCurrentTheme(theme.id)}
                                    style={{
                                        flex: 1,
                                        padding: '15px',
                                        background: currentTheme === theme.id ? 'var(--accent-color)' : 'rgba(0,0,0,0.3)',
                                        border: `1px solid ${currentTheme === theme.id ? 'white' : 'var(--glass-border)'}`,
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {theme.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* KIOSK MODE CONFIG */}
                    <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--accent-color)', boxShadow: '0 0 15px rgba(255, 0, 255, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Monitor size={24} color="#00ffff" />
                                <h3 style={{ margin: 0 }}>Mode Borne Arcade</h3>
                            </div>
                            <button

                                onClick={() => {
                                    // Hack to force refresh clean
                                    window.electronAPI.setConfig('kiosk', kioskConfig).then(() => {
                                        window.location.reload(); // Simple reload will default to app, manual navigation needed or ensure reload checks kiosk mode
                                        // Since we don't have direct route control here easily without hook, let's just alert
                                        alert("Configuration sauvegardée. Veuillez redémarrer en mode Kiosk.");
                                    });
                                }}
                                style={{ background: '#00ffff', color: 'black', border: 'none', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <Settings size={14} /> SAUVER
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em', color: '#ccc' }}>Thème Kiosk</label>
                                <select
                                    value={kioskConfig.theme || 'neon_arcade'}
                                    onChange={(e) => handleKioskChange('theme', e.target.value)}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid #444', borderRadius: '6px' }}
                                >
                                    <option value="neon_arcade">Neon Arcade</option>
                                    <option value="minimal_dark">Minimal Dark</option>
                                    <option value="retro_pixel">Retro Pixel</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={kioskConfig.attractMode !== false}
                                        onChange={(e) => handleKioskChange('attractMode', e.target.checked)}
                                    />
                                    <span style={{ color: '#ccc' }}>Mode Attract (Vidéo Auto)</span>
                                </label>
                            </div>
                            {kioskConfig.attractMode !== false && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8em', color: '#888' }}>Délai Inactivité (sec)</label>
                                    <input
                                        type="number"
                                        value={kioskConfig.idleTime || 60}
                                        onChange={(e) => handleKioskChange('idleTime', parseInt(e.target.value))}
                                        style={{ width: '60px', padding: '5px', background: 'rgba(0,0,0,0.5)', border: '1px solid #444', color: 'white', borderRadius: '4px', textAlign: 'center' }}
                                    />
                                </div>
                            )}
                            <small style={{ color: '#888', fontStyle: 'italic' }}>
                                Raccourcis: Flèches (Naviguer), Entrer (Jouer), Ctrl+Shift+Q (Quitter)
                            </small>
                        </div>
                    </div>

                    {/* Save Manager */}
                    <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <Save size={24} color="#10b981" />
                            <h3 style={{ margin: 0 }}>Sauvegardes</h3>
                        </div>
                        <button
                            onClick={handleBackupSaves}
                            disabled={isBackingUp}
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: isBackingUp ? '#555' : '#10b981',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: isBackingUp ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            <Download size={20} />
                            {isBackingUp ? 'Création...' : 'BACKUP ZIP'}
                        </button>
                    </div>



                </div>
            </div>
        </div>
    );
}
