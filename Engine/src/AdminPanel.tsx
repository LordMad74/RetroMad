import { useState, useEffect } from 'react';
import { Settings, Cpu, Download, Factory, X, Save, ShieldAlert, Activity, RefreshCw, Zap, Gamepad, Palette, LayoutGrid, HardDrive, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfigPanel from './ConfigPanel';
import SystemManager from './SystemManager';
import ManufacturerManager from './ManufacturerManager';
import ScraperPanel from './ScraperPanel';
import MaintenancePanel from './MaintenancePanel';
import Dashboard from './Dashboard';
import GamepadTester from './GamepadTester';
import SaveManager from './SaveManager';
import ThemeEditor from './ThemeEditor';
import RetroArchSettings from './RetroArchSettings';
import KioskSettings from './KioskSettings';
import EmulatorStore from './EmulatorStore';

export default function AdminPanel() {
    const [status, setStatus] = useState<{ retroarch: boolean } | null>(null);
    const [installing, setInstalling] = useState(false);
    const [progress, setProgress] = useState({ message: '', percent: 0 });
    const [activeTab, setActiveTab] = useState<'dashboard' | 'systems' | 'scraper' | 'config' | 'emulator' | 'retroarch' | 'kiosk' | 'manufacturers' | 'maintenance' | 'gamepad' | 'saves' | 'design'>('dashboard');
    const [kioskConfig, setKioskConfig] = useState({ enabled: false, theme: 'neon_arcade', effect: 'none' });
    const [pexelsKey, setPexelsKey] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    // RetroArch Config State
    const [showRaConfig, setShowRaConfig] = useState(false);
    const [raConfig, setRaConfig] = useState<any>({});

    // Update State
    const [updateInfo, setUpdateInfo] = useState<any>(null);
    const [checkingUpdates, setCheckingUpdates] = useState(false);

    useEffect(() => {
        checkStatus();
        loadConfig();
        checkForUpdates();

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

    const checkForUpdates = async () => {
        if (!window.electronAPI.checkUpdates) return;
        setCheckingUpdates(true);
        try {
            const info = await window.electronAPI.checkUpdates();
            setUpdateInfo(info);
        } catch (e) {
            console.error('Update check failed', e);
        } finally {
            setCheckingUpdates(false);
        }
    };

    const tabs = [
        // GÉNERAL
        { id: 'dashboard', label: 'Dashboard', icon: <Activity size={20} />, desc: 'Vue d\'ensemble', category: 'Général' },
        { id: 'config', label: 'Préférences', icon: <Settings size={20} />, desc: 'Options générales', category: 'Général' },

        // BIBLIOTHÈQUE
        { id: 'systems', label: 'Systèmes', icon: <Cpu size={20} />, desc: 'Gérer les consoles', category: 'Bibliothèque' },
        { id: 'manufacturers', label: 'Constructeurs', icon: <Factory size={20} />, desc: 'Marques et logos', category: 'Bibliothèque' },
        { id: 'scraper', label: 'Scraper', icon: <Download size={20} />, desc: 'Récupérer les médias', category: 'Bibliothèque' },

        // ÉMULATION
        { id: 'emulator', label: 'Emulateurs', icon: <HardDrive size={20} />, desc: 'Gestion des moteurs', category: 'Émulation' },
        { id: 'retroarch', label: 'RetroArch+', icon: <Zap size={20} />, desc: 'Shaders & Succès', category: 'Émulation' },
        { id: 'saves', label: 'Sauvegardes', icon: <Save size={20} />, desc: 'Backup & Cloud', category: 'Émulation' },

        // INTERFACE
        { id: 'kiosk', label: 'Mode Kiosk', icon: <Monitor size={20} />, desc: 'Bornes d\'Arcade', category: 'Interface' },
        { id: 'design', label: 'Design UI', icon: <Palette size={20} />, desc: 'Look de l\'app', category: 'Interface' },

        // OUTILS
        { id: 'gamepad', label: 'Contrôleurs', icon: <Gamepad size={20} />, desc: 'Test manettes', category: 'Outils' },
        { id: 'maintenance', label: 'Maintenance', icon: <ShieldAlert size={20} />, desc: 'Nettoyage & Logs', category: 'Outils' },
    ];

    const categories = ['Général', 'Bibliothèque', 'Émulation', 'Interface', 'Outils'];

    return (
        <div style={{ display: 'flex', height: '100%', gap: '30px', fontFamily: '"Inter", sans-serif' }}>
            {/* SIDEBAR NAVIGATION */}
            <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '10px' }}>
                <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 10px' }}>
                    <LayoutGrid size={24} color="var(--accent-color)" />
                    <h2 style={{ fontSize: '1.4em', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>AD<span style={{ color: 'var(--accent-color)' }}>MIN</span></h2>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                    {categories.map(cat => (
                        <div key={cat} style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.65em', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', paddingLeft: '15px' }}>
                                {cat}
                            </div>
                            {tabs.filter(t => t.category === cat).map(tab => (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px',
                                        background: activeTab === tab.id ? 'rgba(255, 45, 85, 0.1)' : 'transparent',
                                        border: 'none', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', position: 'relative',
                                        marginBottom: '2px'
                                    }}
                                >
                                    <div style={{ color: activeTab === tab.id ? 'var(--accent-color)' : '#666', display: 'flex', alignItems: 'center' }}>
                                        {tab.icon}
                                    </div>
                                    <span style={{ color: activeTab === tab.id ? 'white' : '#999', fontWeight: activeTab === tab.id ? '600' : '400', fontSize: '0.9em' }}>
                                        {tab.label}
                                    </span>
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="active-nav" style={{ position: 'absolute', left: 0, width: '3px', height: '20px', background: 'var(--accent-color)', borderRadius: '0 4px 4px 0' }} />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    ))}
                </div>

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
                    {checkingUpdates && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
                            <RefreshCw size={14} className="spin" />
                            <span style={{ fontSize: '0.8em' }}>Vérification des mises à jour...</span>
                        </div>
                    )}

                    {installing && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 45, 85, 0.1)', padding: '8px 20px', borderRadius: '30px', border: '1px solid var(--accent-color)' }}>
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                            <span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{progress.message} ({progress.percent}%)</span>
                        </div>
                    )}

                    {updateInfo?.updateAvailable && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                background: 'linear-gradient(90deg, #2563eb, #111)',
                                padding: '8px 20px', borderRadius: '30px', border: '1px solid #3b82f6',
                                cursor: 'pointer',
                                boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)'
                            }}
                            onClick={() => window.open(updateInfo.url, '_blank')}
                        >
                            <RefreshCw size={16} className="spin" />
                            <span style={{ fontSize: '0.85em', fontWeight: 'bold' }}>VERSION {updateInfo.latest} DISPONIBLE !</span>
                        </motion.div>
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
                            {activeTab === 'gamepad' && <GamepadTester />}
                            {activeTab === 'saves' && <SaveManager />}
                            {activeTab === 'retroarch' && <RetroArchSettings />}
                            {activeTab === 'design' && <ThemeEditor />}

                            {activeTab === 'kiosk' && (
                                <KioskSettings
                                    config={kioskConfig}
                                    onConfigChange={handleConfigChange}
                                    pexelsKey={pexelsKey}
                                    onPexelsKeyChange={setPexelsKey}
                                    onSavePexelsKey={savePexelsKey}
                                />
                            )}

                            {activeTab === 'emulator' && (
                                <EmulatorStore
                                    status={status}
                                    installing={installing}
                                    progress={progress}
                                    onInstall={handleInstall}
                                    onUninstall={handleUninstall}
                                    onOpenRaConfig={openRaConfig}
                                    onInstallAllCores={handleInstallAllCores}
                                    selectedSection={selectedSection}
                                    setSelectedSection={setSelectedSection}
                                />
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
