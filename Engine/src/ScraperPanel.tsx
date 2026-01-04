import { useState, useEffect, useRef } from 'react';

export default function ScraperPanel() {
    const [systems, setSystems] = useState<any[]>([]);
    const [selectedSystem, setSelectedSystem] = useState('');
    const [isScraping, setIsScraping] = useState(false);

    // Options
    const [options, setOptions] = useState({
        covers: true,
        screenshots: true,
        wheels: true,
        videos: false,
        refresh: false,
        forceFilename: false
    });

    // Credentials & Config (with localStorage persistence)
    const [creds, setCreds] = useState(() => {
        const saved = localStorage.getItem('scraper_creds');
        return saved ? JSON.parse(saved) : {
            user: '',
            pass: '',
            threads: 1,
            region: 'eu',
            lang: 'fr'
        };
    });

    const [logs, setLogs] = useState<string[]>([]);
    const logRef = useRef<HTMLDivElement>(null);

    // Save creds when changed
    useEffect(() => {
        localStorage.setItem('scraper_creds', JSON.stringify(creds));
    }, [creds]);

    // Auto-scroll logs
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs]);

    useEffect(() => {
        loadSystems();

        // Listen for logs with cleanup to prevent duplicates
        const cleanup = window.electronAPI.onScraperStatus((data) => {
            // Allow generic 'log' messages or messages for current system
            if (data.system !== 'log' && data.system !== selectedSystem && selectedSystem !== '') return;

            setLogs(prev => [...prev.slice(-19), data.message]); // Keep last 20 lines

            if (data.running) {
                setIsScraping(true);
            } else {
                setIsScraping(false);
                if (data.success) {
                    alert("Scraping terminé ! Importation des données...");
                    handleImport(selectedSystem);
                }
            }
        });

        // Cleanup listener on unmount or deps change
        return () => { if (cleanup) cleanup(); };

    }, [selectedSystem]);

    const loadSystems = async () => {
        const sys = await window.electronAPI.getConfiguredSystems();
        setSystems(sys);
        if (sys.length > 0 && !selectedSystem) setSelectedSystem(sys[0].id);
    };

    const handleScrape = async () => {
        if (!selectedSystem) return;
        if (!confirm(`Lancer le scraper pour ${selectedSystem} ? Cela peut prendre du temps.`)) return;

        setIsScraping(true);

        try {
            // Pass options and credentials to backend
            const payload = { ...options, ...creds };
            const res = await window.electronAPI.startScraper(selectedSystem, payload);
            if (!res.success) {
                alert("Erreur: " + res.error);
                setIsScraping(false);
            }
        } catch (e: any) {
            alert("Erreur lancement: " + e.message);
            setIsScraping(false);
        }
    };

    const handleImport = async (sysId: string) => {
        const res = await window.electronAPI.importGamelist(sysId);
        if (res.success) {
            alert(`Base de données mise à jour : ${res.updated} jeux enrichis.`);
        } else {
            alert("Erreur import: " + res.error);
        }
    };

    return (
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <h3>Scraper (Récupération des Jaquettes)</h3>
            <p style={{ fontSize: '0.9em', color: '#aaa' }}>Utilise Skyscraper pour télécharger les médias manquants.</p>

            {/* Credentials Section */}
            <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9em' }}>Compte ScreenScraper & Options</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="Utilisateur"
                        value={creds.user}
                        onChange={e => setCreds({ ...creds, user: e.target.value })}
                        style={{ padding: '5px', background: '#222', border: '1px solid #444', color: 'white' }}
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={creds.pass}
                        onChange={e => setCreds({ ...creds, pass: e.target.value })}
                        style={{ padding: '5px', background: '#222', border: '1px solid #444', color: 'white' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.8em' }}>Threads:</span>
                        <input
                            type="number"
                            min="1" max="5"
                            value={creds.threads}
                            onChange={e => setCreds({ ...creds, threads: parseInt(e.target.value) || 1 })}
                            style={{ width: '50px', padding: '5px', background: '#222', border: '1px solid #444', color: 'white' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select
                            value={creds.region}
                            onChange={e => setCreds({ ...creds, region: e.target.value })}
                            style={{ flex: 1, padding: '5px', background: '#222', border: '1px solid #444', color: 'white' }}
                        >
                            <option value="eu">Europe (EU)</option>
                            <option value="us">USA (US)</option>
                            <option value="jp">Japan (JP)</option>
                            <option value="wor">World (WOR)</option>
                        </select>
                        <select
                            value={creds.lang}
                            onChange={e => setCreds({ ...creds, lang: e.target.value })}
                            style={{ flex: 1, padding: '5px', background: '#222', border: '1px solid #444', color: 'white' }}
                        >
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="de">Deutsch</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={options.covers} onChange={e => setOptions({ ...options, covers: e.target.checked })} />
                    Covers (Boîtes)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={options.screenshots} onChange={e => setOptions({ ...options, screenshots: e.target.checked })} />
                    Screenshots
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={options.wheels} onChange={e => setOptions({ ...options, wheels: e.target.checked })} />
                    Wheels (Logos)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={options.videos} onChange={e => setOptions({ ...options, videos: e.target.checked })} />
                    Vidéos (Lourd)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#ffaaa5' }}>
                    <input type="checkbox" checked={options.refresh} onChange={e => setOptions({ ...options, refresh: e.target.checked })} />
                    Forcer Re-téléchargement
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={options.forceFilename} onChange={e => setOptions({ ...options, forceFilename: e.target.checked })} />
                    Forcer Nom Fichier
                </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <select
                    value={selectedSystem}
                    onChange={e => setSelectedSystem(e.target.value)}
                    disabled={isScraping}
                    style={{ flex: 1, padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    {systems.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                </select>

                <button
                    onClick={handleScrape}
                    disabled={isScraping || !selectedSystem}
                    style={{
                        padding: '10px 20px',
                        background: isScraping ? '#555' : 'var(--accent-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isScraping ? 'wait' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {isScraping ? 'EN COURS...' : 'LANCER SCRAPING'}
                </button>
            </div>

            {/* Logs Console */}
            <div
                ref={logRef}
                style={{
                    background: 'rgba(0,0,0,0.8)',
                    color: '#4dbdff',
                    fontFamily: '"Fira Code", monospace',
                    padding: '15px',
                    borderRadius: '8px',
                    height: '250px',
                    overflowY: 'auto',
                    fontSize: '11px',
                    border: '1px solid #222',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                    lineHeight: '1.5'
                }}
            >
                {logs.length === 0 && <span style={{ color: '#444' }}>Terminal prêt. En attente de commande...</span>}
                {logs.map((l, i) => {
                    let color = '#4dbdff';
                    if (l.includes('Done!')) color = '#4ade80';
                    if (l.includes('Error') || l.includes('failed')) color = '#f87171';
                    if (l.includes('Starting')) color = '#fbbf24';

                    return (
                        <div key={i} style={{
                            color,
                            borderLeft: `2px solid ${color === '#4dbdff' ? 'transparent' : color}`,
                            paddingLeft: color === '#4dbdff' ? 0 : '10px',
                            marginBottom: '2px',
                            opacity: l.startsWith('---') ? 0.3 : 1
                        }}>
                            {l}
                        </div>
                    );
                })}
            </div>
            {isScraping && <div style={{ marginTop: '5px', height: '2px', background: 'var(--accent-color)', width: '100%', animation: 'pulse 1s infinite' }}></div>}
        </div>
    );
}
