import { useState, useEffect, useRef } from 'react';
import { Eraser, Trash2, ShieldAlert, Terminal } from 'lucide-react';

export default function MaintenancePanel() {
    const [systems, setSystems] = useState<any[]>([]);
    const [selectedSystemId, setSelectedSystemId] = useState<string>('all');
    const [isProcessing, setIsProcessing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        loadSystems();
    }, []);

    const loadSystems = async () => {
        const sys = await window.electronAPI.getConfiguredSystems();
        setSystems(sys || []);
    };

    const logBuffer = useRef<string[]>([]);
    const flushHandle = useRef<NodeJS.Timeout | null>(null);

    // Initialisation et nettoyage du buffer
    useEffect(() => {
        return () => {
            if (flushHandle.current) clearTimeout(flushHandle.current);
        };
    }, []);

    const flushLogs = () => {
        if (logBuffer.current.length > 0) {
            const newLogs = [...logBuffer.current];
            logBuffer.current = []; // Reset buffer
            setLogs(prev => [...prev, ...newLogs]);
        }
        flushHandle.current = null;
    };

    const runCleaner = async (execute: boolean) => {
        setIsProcessing(true);
        setLogs(['Démarrage de l\'analyse...', execute ? '⚠️ MODE ÉCRITURE (Modifications activées)' : 'ℹ️ MODE SIMULATION (Aucun changement)', '---']);

        // Reset buffer
        logBuffer.current = [];

        try {
            await window.electronAPI.cleanRoms(selectedSystemId, execute, (logLine: string) => {
                logBuffer.current.push(logLine);

                // Si pas de flush en attente, on en planifie un
                if (!flushHandle.current) {
                    flushHandle.current = setTimeout(flushLogs, 100);
                }
            });

            // Force flush restant à la fin
            if (flushHandle.current) clearTimeout(flushHandle.current);
            flushLogs();

            if (execute) {
                setLogs(prev => [...prev, '---', '✅ Nettoyage des fichiers terminé.', '🔄 Mise à jour de la base de données...']);

                if (selectedSystemId !== 'all') {
                    // RESET DB SYSTEM
                    setLogs(prev => [...prev, `🗑️ Suppression des anciennes entrées pour ${selectedSystemId}...`]);
                    await window.electronAPI.resetSystem(selectedSystemId);

                    // RESCAN
                    setLogs(prev => [...prev, `🔍 Re-scan des nouveaux fichiers pour ${selectedSystemId}...`]);
                    const res = await window.electronAPI.scanSystem(selectedSystemId);

                    setLogs(prev => [...prev, `✨ Succès ! ${res.added} jeux ajoutés à la base (Total trouvé: ${res.total}).`]);
                    setLogs(prev => [...prev, '⚠️ Vous devrez peut-être re-télécharger les médias (Scraper) si les noms ont changé.']);
                } else {
                    setLogs(prev => [...prev, '⚠️ Scan automatique global non supporté. Veuillez scanner vos systèmes manuellement dans l\'onglet Systèmes.']);
                }
            } else {
                setLogs(prev => [...prev, '---', 'ℹ️ Simulation terminée.']);
            }

        } catch (error) {
            setLogs(prev => [...prev, `❌ Erreur: ${error}`]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '16px', border: '1px solid var(--glass-border)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Eraser size={24} color="#f59e0b" />
                        Maintenance & Nettoyage
                    </h3>
                    <p style={{ color: '#aaa', margin: 0 }}>
                        Nettoyez les noms de vos ROMs (suppression des tags [!], (USA), etc.) pour une liste de jeux plus propre.
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', color: '#ccc' }}>Cible</label>
                    <select
                        value={selectedSystemId}
                        onChange={e => setSelectedSystemId(e.target.value)}
                        disabled={isProcessing}
                        style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #444', color: 'white', borderRadius: '8px' }}
                    >
                        <option value="all">Tous les systèmes</option>
                        {systems.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                    </select>
                </div>

                <button
                    onClick={() => runCleaner(false)}
                    disabled={isProcessing}
                    style={{
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white',
                        borderRadius: '12px', cursor: isProcessing ? 'default' : 'pointer', fontWeight: 'bold',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', opacity: isProcessing ? 0.5 : 1
                    }}
                >
                    <ShieldAlert size={20} />
                    SIMULATION
                    <span style={{ fontSize: '0.7em', fontWeight: 'normal', color: '#aaa' }}>Voir sans toucher</span>
                </button>

                <button
                    onClick={() => {
                        if (confirm("Êtes-vous sûr de vouloir renommer vos fichiers ? Cette action est irréversible.\n\nLa base de données sera automatiquement mise à jour.")) {
                            runCleaner(true);
                        }
                    }}
                    disabled={isProcessing}
                    style={{
                        background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5',
                        borderRadius: '12px', cursor: isProcessing ? 'default' : 'pointer', fontWeight: 'bold',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', opacity: isProcessing ? 0.5 : 1
                    }}
                >
                    <Trash2 size={20} />
                    NETTOYER
                    <span style={{ fontSize: '0.7em', fontWeight: 'normal' }}>Renommer & M.À.J</span>
                </button>
            </div>

            {/* Terminal Output */}
            <div style={{
                flex: 1,
                background: '#111',
                borderRadius: '12px',
                border: '1px solid #333',
                padding: '15px',
                fontFamily: 'monospace',
                fontSize: '0.9em',
                color: '#ddd',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #333', marginBottom: '10px', color: '#666' }}>
                    <Terminal size={14} /> Terminal
                    {isProcessing && <span style={{ color: 'var(--accent-color)', marginLeft: 'auto' }}>Exécution en cours...</span>}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
                    {/* Using flex-direction column-reverse to keep scroll at bottom automatically if we reverse mapped array, but standard map with auto-scroll is safer or simpler. Here we just rely on normal order. */}
                    <div>
                        {logs.map((line, i) => (
                            <div key={i} style={{
                                color: line.includes('❌') ? '#f87171' : (line.includes('✅') || line.includes('✨') ? '#4ade80' : (line.startsWith('📝') || line.includes('🔍') ? '#fbbf24' : '#ccc')),
                                borderBottom: line === '---' ? '1px solid #333' : 'none',
                                paddingBottom: line === '---' ? '5px' : '0',
                                marginBottom: line === '---' ? '10px' : '4px'
                            }}>
                                {line}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
