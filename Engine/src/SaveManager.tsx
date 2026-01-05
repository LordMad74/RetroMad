import { useState, useEffect } from 'react';
import { Database, ShieldCheck, Trash2, Download, History, Archive, HardDrive, AlertCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SaveManager() {
    const [backups, setBackups] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [backingUp, setBackingUp] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadBackups();
    }, []);

    const loadBackups = async () => {
        setLoading(true);
        const list = await window.electronAPI.listBackups();
        setBackups(list || []);
        setLoading(false);
    };

    const handleBackup = async () => {
        setBackingUp(true);
        setMessage('Création de l\'archive locale...');
        const result = await window.electronAPI.backupSaves();
        if (result.success) {
            setMessage(result.message);
            loadBackups();
        } else {
            alert('Erreur: ' + result.error);
        }
        setBackingUp(false);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleDelete = async (name: string) => {
        if (confirm('Supprimer cette archive définitivement ?')) {
            const result = await window.electronAPI.deleteBackup(name);
            if (result.success) loadBackups();
        }
    };

    const handleRestore = async (name: string) => {
        if (confirm(`Restaurer l'archive "${name}" ?\nATTENTION : Cela écrasera vos sauvegardes actuelles !`)) {
            setLoading(true);
            setMessage('Restauration en cours...');
            const result = await window.electronAPI.restoreBackup(name);
            if (result.success) {
                setMessage(result.message);
            } else {
                alert('Erreur: ' + result.error);
            }
            setLoading(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '16px', border: '1px solid var(--glass-border)', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={24} color="#4ade80" /> Gestion des Sauvegardes
                </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '30px', flex: 1, overflow: 'hidden' }}>
                {/* Actions Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <Archive size={32} color="var(--accent-color)" />
                            <h4 style={{ margin: 0 }}>Point de Restauration</h4>
                        </div>
                        <p style={{ fontSize: '0.85em', color: '#888', lineHeight: '1.5', marginBottom: '20px' }}>
                            Créez une archive ZIP contenant tous vos fichiers <strong>.srm</strong> (SRAM) et <strong>.state</strong> (États de sauvegarde) situés dans les dossiers Roms et Saves.
                        </p>
                        <button
                            onClick={handleBackup}
                            disabled={backingUp}
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: backingUp ? '#444' : 'var(--accent-color)',
                                color: 'black',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: backingUp ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: backingUp ? 'none' : '0 4px 15px rgba(255, 45, 85, 0.3)'
                            }}
                        >
                            {backingUp ? <RefreshCw size={18} /> : <Download size={18} />}
                            {backingUp ? 'ARCHIVAGE...' : 'LANCER UN BACKUP'}
                        </button>
                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{ marginTop: '15px', padding: '10px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '8px', fontSize: '0.8em', textAlign: 'center' }}
                                >
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#aaa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={14} /> Note Importante
                        </h4>
                        <p style={{ fontSize: '0.75em', color: '#666', lineHeight: '1.4' }}>
                            Les backups sont stockés localement dans <code>Content/Backups/</code>. Il est conseillé de copier périodiquement ces archives sur un support externe.
                        </p>
                    </div>
                </div>

                {/* History Panel */}
                <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <History size={18} color="#888" />
                        <h4 style={{ margin: 0 }}>Historique des Archives</h4>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                        {loading && backups.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>Chargement...</div>
                        ) : backups.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
                                <Database size={48} style={{ opacity: 0.1, marginBottom: '15px' }} />
                                <p>Aucun backup trouvé.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {backups.map((b, i) => (
                                    <motion.div
                                        key={b.name}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        style={{
                                            padding: '15px 20px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            border: '1px solid rgba(255,255,255,0.02)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <HardDrive size={20} color="#888" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{b.name}</div>
                                                <div style={{ fontSize: '0.75em', color: '#666' }}>{b.date} • {b.size}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleRestore(b.name)}
                                                style={{ padding: '8px', background: 'transparent', border: 'none', color: '#4ade80', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.1)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                title="Restaurer cette archive"
                                            >
                                                <RotateCcw size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(b.name)}
                                                style={{ padding: '8px', background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,77,0.1)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                title="Supprimer l'archive"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple helper icon
function RefreshCw({ size }: { size?: number }) {
    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
            <Database size={size || 18} />
        </motion.div>
    );
}
