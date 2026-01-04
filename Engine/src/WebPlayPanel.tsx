import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Monitor, Smartphone, Tablet, Globe, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WebPlayPanel() {
    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            const res = await (window as any).electronAPI.getWebServerStatus();
            setStatus(res);
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!status) return <div>Chargement du serveur réseau...</div>;

    return (
        <div style={{
            maxWidth: '850px',
            margin: '0 auto',
            padding: '25px 30px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto 15px' }}>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            position: 'absolute', top: -10, left: -10, right: -10, bottom: -10,
                            borderRadius: '20px', background: 'var(--accent-color)', filter: 'blur(12px)',
                            zIndex: -1
                        }}
                    />
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '18px',
                        background: 'var(--accent-color)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 25px rgba(255, 45, 85, 0.4)'
                    }}>
                        <Wifi size={32} color="white" />
                    </div>
                </div>
                <h2 style={{ fontSize: '2.2em', margin: '0 0 5px', fontWeight: '900', letterSpacing: '-1px' }}>Web Play Network</h2>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    color: '#4dbdff', fontSize: '0.8em', fontWeight: 'bold', textTransform: 'uppercase',
                    letterSpacing: '2px', marginBottom: '12px'
                }}>
                    <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ width: '6px', height: '6px', background: '#4dbdff', borderRadius: '50%' }}
                    />
                    📡 DIFFUSÉ SUR LE RÉSEAU
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05em', maxWidth: '500px', margin: '0 auto' }}>
                    Jouez à vos jeux depuis n'importe quel appareil connecté à votre Wi-Fi.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' }}>
                {/* Left: Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{
                        padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '15px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <h4 style={{ margin: '0 0 10px', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9em' }}>
                            Connexion Rapide
                        </h4>
                        <ol style={{ margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9em' }}>
                            <li>Scannez le QR Code (méthode fiable).</li>
                            <li>Ou tapez l'adresse IP sur votre gsm :</li>
                        </ol>

                        <div style={{
                            marginTop: '15px', padding: '12px', background: 'rgba(255,45,85,0.1)',
                            borderRadius: '10px', color: 'var(--accent-color)', fontWeight: 'bold',
                            textAlign: 'center', border: '1px dashed var(--accent-color)'
                        }}>
                            <div style={{ fontSize: '1.2em' }}>{status.fallbackUrl}</div>
                            <button
                                onClick={() => window.open(status.fallbackUrl, '_blank')}
                                style={{
                                    marginTop: '8px', padding: '6px 12px', background: 'var(--accent-color)',
                                    border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer',
                                    fontWeight: 'bold', fontSize: '0.75em'
                                }}
                            >
                                TESTER SUR CE PC
                            </button>
                        </div>

                        <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ margin: 0, fontSize: '0.8em', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                                Nom du serveur :<br />
                                <span style={{ color: 'rgba(255,255,255,0.6)' }}>http://{status.hostname}:{status.port}</span>
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', opacity: 0.3 }}>
                        <Smartphone size={24} />
                        <Tablet size={24} />
                        <Monitor size={24} />
                    </div>
                </div>

                {/* Right: QR Code */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        background: 'white', padding: '15px', borderRadius: '15px',
                        width: 'fit-content', margin: '0 auto', boxShadow: '0 15px 40px rgba(0,0,0,0.5)'
                    }}
                >
                    <QRCodeSVG value={status.fallbackUrl} size={180} level="H" includeMargin={true} />
                </motion.div>
            </div>

            <div style={{
                marginTop: '30px', padding: '15px', borderRadius: '12px',
                background: 'rgba(77, 189, 255, 0.05)', border: '1px solid rgba(77, 189, 255, 0.1)',
                color: '#4dbdff', display: 'flex', alignItems: 'center', gap: '12px'
            }}>
                <Globe size={20} />
                <p style={{ margin: 0, fontSize: '0.8em', opacity: 0.8 }}>
                    <strong>Note :</strong> Émulation via WebAssembly. Les performances dépendent de votre gsm ou tablette.
                </p>
            </div>
        </div>
    );
}
