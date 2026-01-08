import { useState, useEffect } from 'react';
import { useTranslation } from './contexts/LanguageContext';

import AdminPanel from './AdminPanel';
import GameList from './GameList';
import WebPlayPanel from './WebPlayPanel';
import KioskMode from './KioskMode';
import ManufacturersView from './ManufacturersView';
import { motion } from 'framer-motion';
import { useAudio } from './hooks/useAudio';
import { useGamepad } from './hooks/useGamepad';
import { Volume2, VolumeX, Power, Monitor } from 'lucide-react';

// Initial fallback systems, will be replaced by config
const DEFAULT_SYSTEMS = [
    { id: 'NES', name: 'Nintendo (NES)', core: null },
    { id: 'SNES', name: 'Super Nintendo (SNES)', core: null },
    { id: 'MEGADRIVE', name: 'Sega MegaDrive', core: null },
    { id: 'PSX', name: 'PlayStation', core: null },
    { id: 'ARCADE', name: 'Arcade', core: null }
];

function App() {
    const { t, language, setLanguage } = useTranslation();
    const [activeTab, setActiveTab] = useState('manufacturers');

    const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
    const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
    const [systems, setSystems] = useState<any[]>(DEFAULT_SYSTEMS);
    const [kioskConfig, setKioskConfig] = useState<{ enabled: boolean, theme: string } | null>(null);
    const [bgmMuted, setBgmMuted] = useState(false);

    // Apply custom theme on startup
    useEffect(() => {
        const saved = localStorage.getItem('custom_theme');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                Object.keys(config).forEach(key => {
                    document.documentElement.style.setProperty(key, config[key]);
                });
            } catch (e) { }
        }
    }, []);

    // Audio Hook
    const { playSound, startBGM, stopBGM } = useAudio();

    // Interaction to start audio (autostart policy)
    const handleFirstInteraction = () => {
        if (!bgmMuted) startBGM();
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
    };

    useEffect(() => {
        window.addEventListener('click', handleFirstInteraction);
        window.addEventListener('keydown', handleFirstInteraction);
        return () => {
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
        };
    }, []);

    // Load systems and config on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Systems
                const configured = await window.electronAPI.getConfiguredSystems();
                if (configured && configured.length > 0) {
                    setSystems(configured);
                }

                // Config
                if (window.electronAPI.getConfig) {
                    const cfg = await window.electronAPI.getConfig();
                    if (cfg && cfg.kiosk) {
                        setKioskConfig(cfg.kiosk);
                    }
                    if (cfg && cfg.theme) {
                        document.body.setAttribute('data-theme', cfg.theme);
                    }
                }
            } catch (e) { console.error("Could not load init data", e); }
        };
        loadData();
    }, [activeTab]);

    // Handle Remote Action Event
    useEffect(() => {
        if (!window.electronAPI.onRemoteAction) return;

        const cleanup = window.electronAPI.onRemoteAction((data: any) => {
            console.log("Remote action received in App:", data);

            if (data.type === 'nav') {
                const key = data.key;
                if (key === 'Select') {
                    const active = document.activeElement as HTMLElement;
                    if (active) active.click();
                    else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                } else if (key === 'Back') {
                    handleBack();
                } else {
                    window.dispatchEvent(new KeyboardEvent('keydown', { key: `Arrow${key}` }));
                    playSound('hover');
                }
            } else if (data.type === 'volume') {
                console.log("Setting volume to:", data.value);
                playSound('success');
            } else if (data.type === 'launch-start') {
                stopBGM();
                setBgmMuted(true);
            }
        });

        return cleanup;
    }, [selectedSystem, selectedManufacturer, activeTab, bgmMuted]);

    // Stop BGM when entering a system library (optional but immersive)
    useEffect(() => {
        if (selectedSystem) {
            stopBGM();
            setBgmMuted(true);
        }
    }, [selectedSystem]);

    // Handle Web Play Event
    useEffect(() => {
        const handleWebPlay = () => {
            setActiveTab('webplay');
            playSound('success');
        };
        window.addEventListener('web-play-launch', handleWebPlay);
        return () => window.removeEventListener('web-play-launch', handleWebPlay);
    }, []);

    const handleSystemSelect = (sys: string) => {
        playSound('click');
        setSelectedSystem(sys);
    };

    const handleBack = () => {
        if (selectedSystem) {
            playSound('back');
            setSelectedSystem(null);
        } else if (selectedManufacturer) {
            playSound('back');
            setActiveTab('manufacturers');
            setSelectedManufacturer(null);
        }
    };

    const handleKioskExit = async () => {
        await window.electronAPI.setConfig('kiosk', { enabled: false, theme: kioskConfig?.theme || 'neon_arcade' });
        setKioskConfig({ enabled: false, theme: kioskConfig?.theme || 'neon_arcade' });
        playSound('back');
    };

    const handleKioskEnter = async () => {
        const theme = kioskConfig?.theme || 'neon_arcade';
        await window.electronAPI.setConfig('kiosk', { enabled: true, theme });
        setKioskConfig({ enabled: true, theme });
        playSound('success');
    };

    const handleManufacturerSelect = (manName: string) => {
        playSound('click');
        setSelectedManufacturer(manName);
        setActiveTab('home');
    };

    // --- GAMEPAD NAVIGATION ---
    useGamepad({
        onLeft: () => {
            if (!selectedSystem && !selectedManufacturer) {
                if (activeTab === 'home') setActiveTab('manufacturers');
                else if (activeTab === 'webplay') setActiveTab('home');
                else if (activeTab === 'admin') setActiveTab('webplay');
                playSound('hover');
            }
        },
        onRight: () => {
            if (!selectedSystem && !selectedManufacturer) {
                if (activeTab === 'manufacturers') setActiveTab('home');
                else if (activeTab === 'home') setActiveTab('webplay');
                else if (activeTab === 'webplay') setActiveTab('admin');
                playSound('hover');
            }
        },
        onBack: handleBack
    });

    // Filter systems based on active manufacturer
    const displayedSystems = selectedManufacturer
        ? systems.filter(s => s.manufacturer === selectedManufacturer)
        : systems;

    if (kioskConfig?.enabled) {
        return <KioskMode config={kioskConfig} onExit={handleKioskExit} />;
    }

    const navButton = (tabName: string, label: string, onClick: () => void) => (
        <button
            onClick={() => { playSound('click'); onClick(); }}
            onMouseEnter={() => playSound('hover')}
            style={{
                padding: '10px 20px',
                background: activeTab === tabName ? 'var(--accent-color)' : 'transparent',
                color: activeTab === tabName ? 'white' : 'var(--text-secondary)',
                border: activeTab === 'admin' && tabName === 'admin' ? '1px solid var(--accent-color)' : '1px solid transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === tabName ? 'bold' : 'normal',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
            <header style={{
                padding: '15px 30px',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                zIndex: 10,
                WebkitAppRegion: 'drag'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', background: 'var(--accent-color)', borderRadius: '6px', transform: 'rotate(45deg)', boxShadow: '0 0 10px var(--accent-glow)' }}></div>
                    <h1 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px', color: 'white', fontSize: '1.4em', fontWeight: 800 }}>
                        Retro<span style={{ color: 'var(--accent-color)' }}>Mad</span>
                    </h1>
                </div>

                <nav style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {navButton('manufacturers', t('nav.manufacturers'), () => { setActiveTab('manufacturers'); setSelectedManufacturer(null); })}
                    {navButton('home', t('nav.systems'), () => { setActiveTab('home'); setSelectedSystem(null); setSelectedManufacturer(null); })}
                    {navButton('webplay', t('nav.webplay'), () => setActiveTab('webplay'))}
                    {navButton('admin', t('nav.admin'), () => setActiveTab('admin'))}

                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2px', marginLeft: '10px' }}>
                        <button
                            onClick={() => { setLanguage('fr'); playSound('click'); }}
                            style={{
                                padding: '4px 8px', borderRadius: '15px', border: 'none', fontSize: '10px', cursor: 'pointer',
                                background: language === 'fr' ? 'var(--accent-color)' : 'transparent',
                                color: language === 'fr' ? 'white' : 'var(--text-secondary)'
                            }}
                        >FR</button>
                        <button
                            onClick={() => { setLanguage('en'); playSound('click'); }}
                            style={{
                                padding: '4px 8px', borderRadius: '15px', border: 'none', fontSize: '10px', cursor: 'pointer',
                                background: language === 'en' ? 'var(--accent-color)' : 'transparent',
                                color: language === 'en' ? 'white' : 'var(--text-secondary)'
                            }}
                        >EN</button>
                    </div>


                    <select
                        onChange={(e) => {
                            const track = e.target.value as any;
                            if (!bgmMuted) startBGM(track);
                            playSound('click');
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-secondary)',
                            borderRadius: '4px',
                            fontSize: '11px',
                            padding: '2px 5px',
                            outline: 'none',
                            cursor: 'pointer',
                            marginLeft: '10px'
                        }}
                    >
                        <option value="synthwave">Synthwave</option>
                        <option value="chiptune">Chiptune</option>
                        <option value="ambient">Ambient</option>
                    </select>

                    <button
                        onClick={handleKioskEnter}
                        style={{
                            background: 'rgba(0, 255, 136, 0.1)',
                            border: '1px solid rgba(0, 255, 136, 0.4)',
                            color: '#00ff88',
                            cursor: 'pointer',
                            padding: '8px',
                            marginLeft: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '50%',
                            transition: 'all 0.2s',
                            WebkitAppRegion: 'no-drag'
                        }}
                        title="Mode Kiosk"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 255, 136, 0.3)';
                            playSound('hover');
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)';
                        }}
                    >
                        <Monitor size={18} />
                    </button>

                    <button
                        onClick={() => {
                            if (bgmMuted) startBGM();
                            else stopBGM();
                            setBgmMuted(!bgmMuted);
                            playSound('click');
                        }}
                        style={{
                            background: 'rgba(0, 170, 255, 0.1)',
                            border: '1px solid rgba(0, 170, 255, 0.4)',
                            color: '#00aaff',
                            cursor: 'pointer',
                            padding: '8px',
                            marginLeft: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '50%',
                            transition: 'all 0.2s',
                            WebkitAppRegion: 'no-drag'
                        }}
                        title={bgmMuted ? "Activer la musique" : "Couper la musique"}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 170, 255, 0.3)';
                            playSound('hover');
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 170, 255, 0.1)';
                        }}
                    >
                        {bgmMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    <button
                        onClick={() => {
                            if (window.confirm('Quitter RetroMad ?')) {
                                window.electronAPI.quitApp();
                            }
                        }}
                        style={{
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid rgba(255, 68, 68, 0.4)',
                            color: '#ff4444',
                            cursor: 'pointer',
                            padding: '8px',
                            marginLeft: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '50%',
                            transition: 'all 0.2s',
                            WebkitAppRegion: 'no-drag'
                        }}
                        title="Quitter l'application"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 68, 68, 0.3)';
                            playSound('hover');
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)';
                        }}
                    >
                        <Power size={18} />
                    </button>
                </nav>
            </header>

            <main style={{ flex: 1, padding: '30px 40px', overflowY: 'auto' }}>
                {activeTab === 'manufacturers' && (
                    <ManufacturersView onSelect={handleManufacturerSelect} />
                )}

                {activeTab === 'home' && !selectedSystem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{ textAlign: 'center' }}
                    >
                        {selectedManufacturer ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => { playSound('back'); setActiveTab('manufacturers'); setSelectedManufacturer(null); }}
                                    onMouseEnter={() => playSound('hover')}
                                    className="glass-panel"
                                    style={{ padding: '8px 16px', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9em' }}
                                >
                                    &larr; Retour
                                </button>
                                <h2 style={{ margin: 0, fontSize: '2em', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>Consoles {selectedManufacturer}</h2>
                            </div>
                        ) : (
                            <div style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '2.5em', marginBottom: '10px' }}>Bienvenue sur <span className="text-gradient">RetroMad</span></h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1em' }}>Votre bibliothèque de jeux ultime, prête à jouer.</p>
                                <button
                                    onClick={() => { playSound('click'); setActiveTab('manufacturers'); }}
                                    onMouseEnter={() => playSound('hover')}
                                    className="btn-primary"
                                    style={{
                                        padding: '12px 30px',
                                        borderRadius: '30px',
                                        cursor: 'pointer',
                                        marginTop: '20px',
                                        fontSize: '1em'
                                    }}
                                >
                                    PARCOURIR PAR CONSTRUCTEURS
                                </button>
                            </div>
                        )}

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '30px',
                            paddingBottom: '50px'
                        }}>
                            {displayedSystems.map((sys, i) => (
                                <motion.div
                                    key={sys.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 100 }}
                                    onClick={() => handleSystemSelect(sys.id)}
                                    onMouseEnter={() => playSound('hover')}
                                    whileHover={{ scale: 1.05, y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.6)', borderColor: 'var(--accent-color)' }}
                                    className="glass-panel"
                                    style={{
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        aspectRatio: '16/9',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'flex-end',
                                        borderWidth: '1px'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                        background: sys.headerImage ? `url(${sys.headerImage}) center/cover` : 'var(--bg-secondary)',
                                        opacity: sys.headerImage ? 1 : 1,
                                        transition: 'transform 0.5s'
                                    }} className="card-bg" />

                                    {!sys.headerImage && (
                                        <div className="bg-grid" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.5 }}></div>
                                    )}

                                    <div style={{
                                        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%',
                                        background: 'linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.6) 40%, transparent 100%)',
                                        pointerEvents: 'none'
                                    }} />

                                    <div style={{ position: 'relative', zIndex: 2, padding: '24px', textAlign: 'left' }}>
                                        {sys.manufacturer && (
                                            <div style={{
                                                fontSize: '0.75em',
                                                color: 'var(--accent-color)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '2px',
                                                marginBottom: '6px',
                                                fontWeight: '800'
                                            }}>
                                                {sys.manufacturer}
                                            </div>
                                        )}
                                        <h3 style={{
                                            margin: 0,
                                            fontSize: '1.8em',
                                            color: 'white',
                                            fontWeight: '700',
                                            textShadow: '0 5px 10px rgba(0,0,0,0.8)'
                                        }}>
                                            {sys.name}
                                        </h3>

                                        <div style={{
                                            marginTop: '12px',
                                            display: 'flex',
                                            gap: '10px',
                                            fontSize: '0.8em'
                                        }}>
                                            <span style={{
                                                background: sys.core ? 'var(--success-color)' : 'rgba(255, 255, 255, 0.1)',
                                                color: sys.core ? '#000' : '#aaa',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontWeight: 'bold',
                                                fontSize: '0.9em'
                                            }}>
                                                {sys.core ? 'PRÊT' : 'NON DISPONIBLE'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'home' && selectedSystem && (
                    <GameList system={selectedSystem} onBack={handleBack} />
                )}

                {activeTab === 'webplay' && (
                    <WebPlayPanel />
                )}

                {activeTab === 'admin' && (
                    <AdminPanel />
                )}
            </main>
        </div>
    );
}

export default App;
