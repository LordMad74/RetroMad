import { motion } from 'framer-motion';
import { Download, Cpu, Settings, RefreshCw, Zap, X } from 'lucide-react';

interface EmulatorStoreProps {
    status: { retroarch: boolean } | null;
    installing: boolean;
    progress: { message: string, percent: number };
    onInstall: (version: 'stable' | 'nightly') => void;
    onUninstall: () => void;
    onOpenRaConfig: () => void;
    onInstallAllCores: () => void;
    selectedSection: string;
    setSelectedSection: (val: string) => void;
}

export default function EmulatorStore({ status, installing, progress, onInstall, onUninstall, onOpenRaConfig, onInstallAllCores, selectedSection, setSelectedSection }: EmulatorStoreProps) {
    return (
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
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/RetroArch_Logo_%282020%29.svg/1200px-RetroArch_Logo_%282020%29.svg.png" alt="Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
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
                        <button onClick={() => onInstall('stable')} style={{ padding: '12px 25px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Download size={18} /> Installer (Automatique)
                        </button>
                    ) : (
                        <>
                            <button onClick={onUninstall} style={{ padding: '12px 25px', background: 'rgba(255, 50, 50, 0.1)', color: '#ff5555', border: '1px solid rgba(255, 50, 50, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Désinstaller
                            </button>
                            <button onClick={onOpenRaConfig} style={{ padding: '12px 25px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                <Settings size={18} /> Configuration
                            </button>
                            <button onClick={() => setSelectedSection('cores')} style={{ padding: '12px 25px', background: 'rgba(0, 168, 255, 0.1)', border: '1px solid rgba(0, 168, 255, 0.3)', borderRadius: '8px', cursor: 'pointer', color: '#00a8ff', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                <Cpu size={18} /> Gestion Intégrale Cores
                            </button>
                        </>
                    )}
                </div>
            </div>

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
                            onClick={onInstallAllCores}
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
    );
}
