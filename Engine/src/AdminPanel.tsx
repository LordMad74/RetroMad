import { useState, useEffect } from 'react';
import { Settings, Cpu, HardDrive, Download, Monitor, Factory, ChevronRight, X, Save, ShieldAlert, Activity, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfigPanel from './ConfigPanel';
import SystemManager from './SystemManager';
import ManufacturerManager from './ManufacturerManager';
import ScraperPanel from './ScraperPanel';
import MaintenancePanel from './MaintenancePanel';
import Dashboard from './Dashboard';

export default function AdminPanel() {
    const [status, setStatus] = useState<{ retroarch: boolean } | null>(null);
    const [installing, setInstalling] = useState(false);
    const [progress, setProgress] = useState({ message: '', percent: 0 });
    const [activeTab, setActiveTab] = useState<'dashboard' | 'systems' | 'scraper' | 'config' | 'emulator' | 'kiosk' | 'manufacturers' | 'maintenance'>('dashboard');
    const [kioskConfig, setKioskConfig] = useState({ enabled: false, theme: 'neon_arcade', effect: 'none' });
    const [pexelsKey, setPexelsKey] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    // RetroArch Config State
    const [showRaConfig, setShowRaConfig] = useState(false);
    const [raConfig, setRaConfig] = useState<any>({});

    useEffect(() => {
        checkStatus();
        loadConfig();

        const cleanup = window.electronAPI.onInstallStatus((data: any) => {
            setInstalling(true);
            setProgress({ message: data.message, percent: data.progress });
            if (data.step === 'complete') {
                setInstalling(false);
                checkStatus();
            }
        });

        const errorCleanup = window.electronAPI.onInstallError((err: any) => {
            setInstalling(false);
            alert('Erreur: ' + err);
        });

        return () => {
            if (typeof cleanup === 'function') cleanup();
            if (typeof errorCleanup === 'function') errorCleanup();
        };
    }, []);

    const checkStatus = async () => {
        const s = await window.electronAPI.getEmuStatus();
        setStatus(s);
    };

    const loadConfig = async () => {
        if (window.electronAPI.getConfig) {
            const cfg = await window.electronAPI.getConfig();
            if (cfg) {
                if (cfg.kiosk) setKioskConfig(cfg.kiosk);
                if (cfg.pexelsKey) setPexelsKey(cfg.pexelsKey);
            }
        }
    };

    const handleConfigChange = async (key: string, value: any) => {
        const newKiosk = { ...kioskConfig, [key]: value };
        setKioskConfig(newKiosk);
        await window.electronAPI.setConfig('kiosk', newKiosk);
    };

    const savePexelsKey = async () => {
        await window.electronAPI.setConfig('pexelsKey', pexelsKey);
        alert('Clé Validée !');
    };

    const handleInstall = (version: 'stable' | 'nightly') => {
        if (confirm(`Voulez-vous installer RetroArch (${version === 'stable' ? 'Stable v1.19.1' : 'Nightly Beta'}) ?`)) {
            setInstalling(true);
            window.electronAPI.installRetroArch(version);
        }
    };

    const handleUninstall = async () => {
        if (confirm("Êtes-vous sûr de vouloir désinstaller RetroArch ? Les sauvegardes et configurations pourraient être perdues.")) {
            await window.electronAPI.uninstallRetroArch();
            checkStatus();
        }
    };

    const openRaConfig = async () => {
        if (!status?.retroarch) return alert("RetroArch n'est pas installé.");
        const cfg = await window.electronAPI.getRetroArchConfig();
        setRaConfig(cfg || {});
        setShowRaConfig(true);
    };

    const saveRaConfig = async () => {
        await window.electronAPI.setRetroArchConfig(raConfig);
        alert("Configuration RetroArch sauvegardée !");
        setShowRaConfig(false);
    };

    const handleInstallAllCores = async () => {
        if (confirm("Voulez-vous télécharger et installer TOUS les cœurs d'émulation supportés ? (Cela peut prendre du temps)")) {
            // AdminPanel already has global 'installing' state being updated by the main effect listener
            await window.electronAPI.installAllCores();
        }
    };

    const updateRaConfig = (key: string, value: any) => {
        setRaConfig((prev: any) => ({ ...prev, [key]: value }));
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <Activity size={20} />, desc: 'Vue d\'ensemble' },
        { id: 'systems', label: 'Systèmes', icon: <Cpu size={20} />, desc: 'Gérer les consoles et chemins' },
        { id: 'manufacturers', label: 'Constructeurs', icon: <Factory size={20} />, desc: 'Marques et logos' },
        { id: 'maintenance', label: 'Maintenance', icon: <ShieldAlert size={20} />, desc: 'Nettoyage et Outils' },
        { id: 'scraper', label: 'Scraper', icon: <Download size={20} />, desc: 'Télécharger les médias' },
        { id: 'kiosk', label: 'Mode Kiosk', icon: <Monitor size={20} />, desc: 'Interface Bornes d\'Arcade' },
        { id: 'config', label: 'Préférences', icon: <Settings size={20} />, desc: 'Options générales' },
        { id: 'emulator', label: 'Émulateurs', icon: <HardDrive size={20} />, desc: 'Gestion des cœurs' },
    ];

    return (
        <div style={{ display: 'flex', height: '100%', gap: '30px', fontFamily: '"Inter", sans-serif' }}>
            {/* SIDEBAR NAVIGATION */}
            <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '10px' }}>
                <div style={{ marginBottom: '20px', padding: '0 10px' }}>
                    <h2 style={{ fontSize: '1.2em', opacity: 0.7, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Menu Admin</h2>
                </div>

                {tabs.map(tab => (
                    <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 20px',
                            background: activeTab === tab.id ? 'linear-gradient(90deg, var(--accent-color), transparent)' : 'transparent',
                            border: 'none', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden',
                            borderLeft: activeTab === tab.id ? '4px solid white' : '4px solid transparent', transition: 'border 0.3s'
                        }}
                    >
                        <div style={{ color: activeTab === tab.id ? 'white' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {tab.icon}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: activeTab === tab.id ? 'white' : '#aaa', fontWeight: activeTab === tab.id ? 'bold' : 'normal', fontSize: '1em' }}>
                                {tab.label}
                            </span>
                            <span style={{ fontSize: '0.75em', color: activeTab === tab.id ? 'rgba(255,255,255,0.7)' : '#666' }}>
                                {tab.desc}
                            </span>
                        </div>
                        {activeTab === tab.id && (
                            <motion.div layoutId="active-dot" style={{ position: 'absolute', right: '15px', opacity: 0.5 }}>
                                <ChevronRight size={16} color="white" />
                            </motion.div>
                        )}
                    </motion.button>
                ))}

                <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '5px' }}>ÉTAT DU SYSTÈME</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status?.retroarch ? '#4ade80' : '#f87171' }}></div>
                        <span style={{ fontSize: '0.9em', color: 'white' }}>RetroArch: {status?.retroarch ? 'Prêt' : 'Manquant'}</span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8em' }}>{tabs.find(t => t.id === activeTab)?.label}</h2>
                        <span style={{ color: '#888' }}>{tabs.find(t => t.id === activeTab)?.desc}</span>
                    </div>
                    {installing && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 45, 85, 0.1)', padding: '8px 20px', borderRadius: '30px', border: '1px solid var(--accent-color)' }}>
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                            <span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{progress.message} ({progress.percent}%)</span>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', position: 'relative' }}>
                    <AnimatePresence mode='wait'>
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2, ease: "easeOut" }} style={{ height: '100%' }}>

                            {activeTab === 'dashboard' && <Dashboard />}
                            {activeTab === 'systems' && <SystemManager />}
                            {activeTab === 'manufacturers' && <ManufacturerManager />}
                            {activeTab === 'scraper' && <ScraperPanel />}
                            {activeTab === 'config' && <ConfigPanel />}
                            {activeTab === 'maintenance' && <MaintenancePanel />}

                            {activeTab === 'kiosk' && (
                                <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                    <h3 style={{ marginTop: 0 }}>Configuration Expérience Kiosk</h3>
                                    <p style={{ color: '#aaa', fontSize: '0.95em', marginBottom: '30px', lineHeight: '1.5' }}>
                                        Personnalisez l'apparence et le comportement du mode plein écran (Arcade).
                                        C'est ici que vous définissez l'ambiance visuelle de votre borne.
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                <label style={{ fontSize: '1.1em', fontWeight: 'bold' }}>Démarrage Automatique</label>
                                                <input
                                                    type="checkbox"
                                                    checked={kioskConfig.enabled}
                                                    onChange={e => handleConfigChange('enabled', e.target.checked)}
                                                    style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                                />
                                            </div>
                                            <p style={{ fontSize: '0.85em', color: '#888' }}>
                                                Si activé, l'application se lancera directement en mode Kiosk, sans passer par le bureau. Idéal pour une borne dédiée.
                                            </p>
                                        </div>

                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>Thème d'Interface</label>
                                            <select
                                                value={kioskConfig.theme}
                                                onChange={e => handleConfigChange('theme', e.target.value)}
                                                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #444', color: 'white', borderRadius: '8px', outline: 'none' }}
                                            >
                                                <option value="neon_arcade">Neon Arcade (Style CoinOps)</option>
                                                <option value="classic_cabinet">Classic Cabinet (Rétro Bois)</option>
                                                <option value="future_glass">Future Glass (Moderne)</option>
                                            </select>
                                        </div>

                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold' }}>Ambiance de Fond</label>
                                            <select
                                                value={(kioskConfig as any).effect || 'none'}
                                                onChange={e => handleConfigChange('effect', e.target.value)}
                                                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #444', color: 'white', borderRadius: '8px', outline: 'none' }}
                                            >
                                                <option value="none">Aucun (Simple)</option>
                                                <option value="stars">Voyage Spatial (Vitesse Lumière)</option>
                                                <option value="nebula">Nébuleuse Cosmique (Fumée)</option>
                                                <option value="grid">Grille Rétro 80's (Synthwave)</option>
                                                <option value="hexagons">Ruche Cyber (Hexagones)</option>
                                                <option value="particles">Particules Zen (Orbes)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '30px', padding: '25px', background: 'rgba(50, 50, 60, 0.3)', border: '1px dashed rgba(255, 255, 255, 0.2)', borderRadius: '12px' }}>
                                        <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}><Download size={16} style={{ display: 'inline', marginRight: '8px' }} />Fonds d'écran Dynamiques (API Pexels)</h4>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <input
                                                type="password"
                                                value={pexelsKey}
                                                onChange={(e) => setPexelsKey(e.target.value)}
                                                placeholder="Entrez votre clé API Pexels ici..."
                                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #444', background: 'rgba(0,0,0,0.3)', color: 'white', fontFamily: 'monospace' }}
                                            />
                                            <button
                                                onClick={savePexelsKey}
                                                style={{ padding: '12px 25px', background: 'var(--accent-color)', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}
                                            >
                                                Enregistrer
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.85em', color: '#888', marginTop: '10px' }}>
                                            Nécessaire pour le téléchargement automatique de vidéos d'ambiance de haute qualité si aucun média n'est trouvé pour un jeu.
                                        </p>
                                    </div>

                                    <div style={{ marginTop: '30px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => window.location.reload()}
                                            style={{ padding: '15px 30px', background: 'transparent', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-color)'; e.currentTarget.style.color = 'black'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent-color)'; }}
                                        >
                                            <span style={{ marginRight: '10px' }}>🔄</span> APPLIQUER LES CHANGEMENTS
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'emulator' && (
                                <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                    <h3 style={{ marginTop: 0, fontSize: '1.5em' }}>Store d'Émulateurs</h3>
                                    <p style={{ color: '#aaa', marginBottom: '30px' }}>
                                        Une sélection des meilleurs émulateurs autonomes (Standalone) pour compléter RetroArch.
                                    </p>

                                    <div style={{ background: 'linear-gradient(145deg, rgba(30,30,40,0.8), rgba(20,20,30,0.9))', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-color)' }}></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '50px', height: '50px', background: '#333', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/RetroArch_Logo_%282020%29.svg/1200px-RetroArch_Logo_%282020%29.svg.png" alt="Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '1.4em' }}>RetroArch</h4>
                                                    <span style={{ fontSize: '0.8em', color: 'var(--accent-color)', fontWeight: 'bold' }}>COEUR DU SYSTÈME</span>
                                                </div>
                                            </div>
                                            <div style={{ padding: '6px 12px', borderRadius: '20px', background: status?.retroarch ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)', color: status?.retroarch ? '#4ade80' : '#f87171', fontSize: '0.75em', fontWeight: 'bold', border: `1px solid ${status?.retroarch ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}` }}>
                                                {status?.retroarch ? 'INSTALLÉ' : 'NON DÉTECTÉ'}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.9em', color: '#ccc', marginBottom: '20px', lineHeight: '1.5', maxWidth: '800px' }}>
                                            La solution tout-en-un recommandée. Gère la majorité des consoles classiques (NES, SNES, Genesis, Arcade, PS1, N64...).
                                        </p>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            {!status?.retroarch ? (
                                                <button onClick={() => handleInstall('stable')} style={{ padding: '12px 25px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Download size={18} /> Installer (Automatique)
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={handleUninstall} style={{ padding: '12px 25px', background: 'rgba(255, 50, 50, 0.1)', color: '#ff5555', border: '1px solid rgba(255, 50, 50, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                        Désinstaller
                                                    </button>
                                                    <button onClick={openRaConfig} style={{ padding: '12px 25px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                                        <Settings size={18} /> Configuration
                                                    </button>
                                                    <button onClick={() => setSelectedSection('cores')} style={{ padding: '12px 25px', background: 'rgba(0, 168, 255, 0.1)', border: '1px solid rgba(0, 168, 255, 0.3)', borderRadius: '8px', cursor: 'pointer', color: '#00a8ff', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                                        <Cpu size={18} /> Gestion Intégrale Cores
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* CORE MANAGER SUB-SECTION (CONDITIONAL) */}
                                    {selectedSection === 'cores' && (
                                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px', animation: 'fadeIn 0.3s' }}>
                                            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h4 style={{ margin: 0 }}>Gestion Avancée des Cœurs Libretro</h4>
                                                <button onClick={() => setSelectedSection('')} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
                                            </div>

                                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2em' }}>
                                                    <RefreshCw size={20} className={installing ? "spin" : ""} color={installing ? "var(--accent-color)" : "white"} />
                                                    Installation Groupée
                                                </h3>
                                                <p style={{ color: '#aaa', fontSize: '0.9em', marginBottom: '15px' }}>
                                                    Scanne l'intégralité du dépôt Libretro et télécharge tous les moteurs compatibles avec RetroMad d'un seul coup.
                                                </p>
                                                <button
                                                    onClick={handleInstallAllCores}
                                                    disabled={installing}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        background: installing ? '#444' : 'linear-gradient(45deg, #2563eb, #3b82f6)',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        cursor: installing ? 'default' : 'pointer',
                                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                                                        boxShadow: installing ? 'none' : '0 4px 15px rgba(37, 99, 235, 0.4)'
                                                    }}
                                                >
                                                    {installing ? (
                                                        <span>INSTALLATION EN COURS... {progress.percent}%</span>
                                                    ) : (
                                                        <>
                                                            <Zap size={18} fill="white" /> TOUT INSTALLER (BATCH)
                                                        </>
                                                    )}
                                                </button>
                                                {installing && (
                                                    <div style={{ marginTop: '15px' }}>
                                                        <div style={{ height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' }}>
                                                            <div style={{ width: `${progress.percent}%`, height: '100%', background: 'var(--success-color)', transition: 'width 0.3s ease' }}></div>
                                                        </div>
                                                        <div style={{ fontSize: '0.8em', color: '#888', textAlign: 'center' }}>{progress.message}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                        {[
                                            { name: 'Dolphin', sys: 'GameCube / Wii', color: '#0085d1', url: 'https://dolphin-emu.org/download/', tag: 'Essentiel' },
                                            { name: 'PCSX2 (Nightly)', sys: 'PlayStation 2', color: '#003791', url: 'https://pcsx2.net/downloads', tag: 'Top Tiers' },
                                            { name: 'DuckStation', sys: 'PlayStation 1', color: '#e07609', url: 'https://github.com/stenzek/duckstation/releases', tag: 'Best PS1' },
                                            { name: 'Redream', sys: 'Dreamcast', color: '#f35a0ce8', url: 'https://redream.io/', tag: 'Premium' },
                                            { name: 'Cemu', sys: 'Wii U', color: '#2d84d1', url: 'https://cemu.info/', tag: 'HD Gaming' },
                                            { name: 'Ryujinx', sys: 'Nintendo Switch', color: '#ff0040', url: 'https://ryujinx.org/download', tag: 'Switch' },
                                        ].map((emu, index) => (
                                            <motion.div key={index} whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                    <div style={{ width: '40px', height: '40px', background: `linear-gradient(135deg, ${emu.color}44, ${emu.color}11)`, border: `1px solid ${emu.color}66`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '0.8em', textTransform: 'uppercase' }}>{emu.name.substring(0, 2)}</div>
                                                    <span style={{ fontSize: '0.65em', padding: '3px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: '#aaa', border: '1px solid rgba(255,255,255,0.05)' }}>{emu.tag}</span>
                                                </div>
                                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1em' }}>{emu.name}</h4>
                                                <div style={{ fontSize: '0.8em', color: emu.color, marginBottom: '15px', fontWeight: 'bold', opacity: 0.8 }}>{emu.sys}</div>
                                                <button onClick={() => window.open(emu.url, '_blank')} style={{ marginTop: 'auto', width: '100%', padding: '10px', background: 'transparent', border: `1px solid ${emu.color}`, color: emu.color, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9em', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = emu.color; e.currentTarget.style.color = 'white'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = emu.color; }}>
                                                    <Download size={14} /> Télécharger
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '30px', textAlign: 'center', color: '#666', fontSize: '0.8em' }}>* Les liens redirigent vers les sites officiels des éditeurs. RetroMad n'héberge pas ces fichiers.</div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* RETROARCH CONFIG MODAL */}
                    <AnimatePresence>
                        {showRaConfig && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowRaConfig(false)}>
                                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()} style={{ width: '600px', background: '#1a1a20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ padding: '10px', background: 'var(--accent-color)', borderRadius: '10px' }}><Settings color="white" size={24} /></div>
                                            <div><h2 style={{ margin: 0, fontSize: '1.4em' }}>Configuration RetroArch</h2><span style={{ color: '#888', fontSize: '0.9em' }}>Modifie directement retroarch.cfg</span></div>
                                        </div>
                                        <button onClick={() => setShowRaConfig(false)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><X size={24} /></button>
                                    </div>
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div><div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Plein Écran au lancement</div><div style={{ fontSize: '0.8em', color: '#888' }}>Force RetroArch à démarrer en plein écran</div></div>
                                            <input type="checkbox" checked={raConfig.video_fullscreen === true} onChange={e => updateRaConfig('video_fullscreen', e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }} />
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div><div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Afficher les FPS</div><div style={{ fontSize: '0.8em', color: '#888' }}>Affiche le compteur d'images par seconde</div></div>
                                            <input type="checkbox" checked={raConfig.fps_show === true} onChange={e => updateRaConfig('fps_show', e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }} />
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Interface du Menu (Driver)</div>
                                            <div style={{ fontSize: '0.8em', color: '#888', marginBottom: '15px' }}>Change l'apparence des menus internes de RetroArch</div>
                                            <select value={raConfig.menu_driver || 'ozone'} onChange={e => updateRaConfig('menu_driver', e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '8px' }}>
                                                <option value="ozone">Ozone (Standard Moderne - Style Switch)</option>
                                                <option value="xmb">XMB (Style PS3 - Cross Media Bar)</option>
                                                <option value="rgui">RGUI (Style Retro Pixel - Très léger)</option>
                                                <option value="glui">GLUI (Style Mobile/Tactile)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                        <button onClick={() => setShowRaConfig(false)} style={{ padding: '12px 20px', background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer' }}>Annuler</button>
                                        <button onClick={saveRaConfig} style={{ padding: '12px 30px', background: 'var(--accent-color)', color: 'white', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}><Save size={18} /> Sauvegarder</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
