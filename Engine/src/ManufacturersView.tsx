import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ManufacturersViewProps {
    onSelect: (manufacturerName: string) => void;
}

export default function ManufacturersView({ onSelect }: ManufacturersViewProps) {
    const [manufacturers, setManufacturers] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await window.electronAPI.getManufacturers();
                setManufacturers(data || []);
            } catch (e) {
                console.error("Failed to load manufacturers", e);
            }
        };
        load();
    }, []);

    if (manufacturers.length === 0) {
        return (
            <div style={{ textAlign: 'center', color: '#aaa', marginTop: '50px' }}>
                <h3>Aucun constructeur trouvé.</h3>
                <p>Ajoutez-en via le menu Admin.</p>
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ color: 'var(--accent-color)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Choisir un Constructeur
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px'
            }}>
                {manufacturers.map((man, i) => (
                    <motion.div
                        key={man.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => onSelect(man.name)}
                        whileHover={{ scale: 1.05, borderColor: 'var(--accent-color)', boxShadow: '0 0 15px var(--accent-color)' }}
                        style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            position: 'relative',
                            aspectRatio: '4/3',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {/* Background with slight tint */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: man.logo ? `url(${man.logo}) center/cover` : 'linear-gradient(45deg, #222, #333)',
                            opacity: 0.2,
                            filter: 'blur(3px)'
                        }} />

                        {/* Logo centered */}
                        <div style={{ zIndex: 2, width: '70%', height: '60%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {man.logo ? (
                                <img src={man.logo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px black)' }} />
                            ) : (
                                <span style={{ fontSize: '3em' }}>🎮</span>
                            )}
                        </div>

                        {/* Name at bottom */}
                        <div style={{
                            zIndex: 2,
                            marginTop: '15px',
                            fontWeight: 'bold',
                            fontSize: '1.2em',
                            textTransform: 'uppercase',
                            textShadow: '0 2px 4px black'
                        }}>
                            {man.name}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
