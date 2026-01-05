import { useState, useEffect } from 'react';
import { Activity, Gamepad2, Cpu, Database, Server, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const [webServerInfo, setWebServerInfo] = useState<any>(null);
    const [stats, setStats] = useState({
        systems: 0,
        games: 0,
        manufacturers: 0,
        coresInstalled: 0,
        retroArchInstalled: false,
        webServerActive: false
    });

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 10000); // Auto refresh
        return () => clearInterval(interval);
    }, []);

    const loadStats = async () => {
        try {
            const systems = await window.electronAPI.getConfiguredSystems();
            const manufacturers = await window.electronAPI.getManufacturers();
            const cores = await window.electronAPI.getAvailableCores();
            const raStatus = await window.electronAPI.getEmuStatus();
            const web = await window.electronAPI.getWebServerStatus();

            let totalGames = 0;
            for (const sys of systems) {
                // This might be heavy, eventually backend should provide aggregate stats
                // For now we do a quick check
                const games = await window.electronAPI.listGames(sys.id);
                totalGames += games.length;
            }

            let coresCount = 0;
            for (const key in cores) {
                coresCount += cores[key].filter((c: any) => c.installed).length;
            }

            setStats({
                systems: systems.length,
                games: totalGames,
                manufacturers: manufacturers.length,
                coresInstalled: coresCount,
                retroArchInstalled: raStatus.retroarch,
                webServerActive: web.running
            });
            setWebServerInfo(web);
        } catch (e) {
            console.error("Dashboard stats error", e);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            style={{
                background: 'var(--bg-secondary)',
                padding: '25px',
                borderRadius: '16px',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
                <Icon size={80} color={color} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: `${color}20` }}>
                    <Icon size={24} color={color} />
                </div>
                <span style={{ fontSize: '0.9em', color: '#aaa', fontWeight: '600' }}>{title}</span>
            </div>

            <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: 'white' }}>
                {value}
            </div>

            {subtext && <div style={{ fontSize: '0.8em', color: '#666' }}>{subtext}</div>}
        </motion.div>
    );

    return (
        <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity color="var(--accent-color)" /> Tableau de Bord
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <StatCard
                    title="Systèmes Configurés"
                    value={stats.systems}
                    icon={Gamepad2}
                    color="#f53b57"
                    subtext="Consoles actives"
                />
                <StatCard
                    title="Jeux Détectés"
                    value={stats.games}
                    icon={Database}
                    color="#3c40c6"
                    subtext="Dans la bibliothèque"
                />
                <StatCard
                    title="Cœurs Installés"
                    value={stats.coresInstalled}
                    icon={Cpu}
                    color="#0fb9b1"
                    subtext="Émulateurs Libretro"
                />
                <StatCard
                    title="Constructeurs"
                    value={stats.manufacturers}
                    icon={Server}
                    color="#ffa801"
                    subtext="Marques référencées"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* SYSTEM HEALTH */}
                <div style={{ background: 'var(--bg-secondary)', padding: '25px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1em' }}>État du Système</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stats.retroArchInstalled ? '#4cd137' : '#e84118' }}></div>
                                <span>Moteur RetroArch</span>
                            </div>
                            <span style={{ color: stats.retroArchInstalled ? '#4cd137' : '#e84118', fontWeight: 'bold' }}>
                                {stats.retroArchInstalled ? 'OPÉRATIONNEL' : 'MANQUANT'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stats.webServerActive ? '#4cd137' : '#e84118' }}></div>
                                <span>Serveur Web Local (API)</span>
                            </div>
                            <span style={{ color: stats.webServerActive ? '#4cd137' : '#e84118', fontWeight: 'bold' }}>
                                {stats.webServerActive ? 'EN LIGNE' : 'HORS LIGNE'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* REMOTE CONTROL SECTION */}
                <div style={{ background: 'var(--bg-secondary)', padding: '25px', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <h3 style={{ marginTop: 0, marginBottom: '5px', fontSize: '1.1em' }}>Contrôle à Distance</h3>
                        <p style={{ fontSize: '0.8em', color: '#888', margin: 0 }}>Scannez pour contrôler RetroMad depuis votre mobile.</p>
                    </div>

                    {stats.webServerActive ? (
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px' }}>
                            <div style={{ background: 'white', padding: '10px', borderRadius: '8px', display: 'flex' }}>
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(webServerInfo?.fallbackUrl || '')}`}
                                    alt="QR Code"
                                    style={{ width: '100px', height: '100px' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9em', fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '5px' }}>MOBILE PORTAL</div>
                                <code style={{ fontSize: '0.8em', color: '#666', wordBreak: 'break-all' }}>{webServerInfo?.fallbackUrl}</code>
                                <div style={{ marginTop: '10px', fontSize: '0.75em', color: '#aaa', lineHeight: '1.4' }}>
                                    Assurez-vous que votre téléphone est sur le même réseau Wi-Fi.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#444' }}>
                            Le serveur web doit être activé dans les préférences.
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'center', color: '#666', fontSize: '0.8em' }}>
                <Clock size={12} style={{ display: 'inline', marginRight: '5px' }} />
                Dernière mise à jour: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
}
