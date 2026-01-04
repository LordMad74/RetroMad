import { useState } from 'react';
import { Play, Globe, ArrowLeft, Calendar, User, Trash2, Gamepad2, Users, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Game {
    id: string;
    filename: string;
    path: string;
    name: string;
    image?: string;
    thumbnail?: string;
    marquee?: string;
    wheel?: string;
    fanart?: string;
    video?: string;
    description?: string;
    developer?: string;
    publisher?: string;
    releaseDate?: string;
    genre?: string;
    players?: string | number;
    rating?: string | number;
}

export default function GameDetails({ game, onBack, onLaunchNative, onLaunchWeb, onDelete }: {
    game: Game,
    onBack: () => void,
    onLaunchNative: (game: Game) => void,
    onLaunchWeb: (game: Game) => void,
    onDelete: (game: Game) => void
}) {
    const cleanName = (name: string) => {
        return name.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, '').trim();
    };

    const [previewMedia, setPreviewMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 100,
                background: '#0a0a0f',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Background Layers */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -2, background: '#0a0a0f' }} />
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: (game.thumbnail || game.image) ? `url(media://${game.thumbnail || game.image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(60px) brightness(0.3) saturate(1.5)',
                opacity: 0.6,
                zIndex: -1,
                transform: 'scale(1.1)'
            }} />

            {/* Scanline Effect */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
                backgroundSize: '100% 4px, 3px 100%',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: 0.2
            }} />

            {/* Ambient Animated Marquee */}
            {game.marquee && (
                <motion.div
                    animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        top: '5%', left: '5%', right: '5%', bottom: '5%',
                        zIndex: -1,
                        opacity: 0.2,
                        filter: 'blur(5px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                    }}
                >
                    <img src={`media://${game.marquee}`} style={{ width: '80%', height: '80%', objectFit: 'contain', maskImage: 'radial-gradient(circle, black 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 70%)' }} />
                </motion.div>
            )}

            {/* Content Container */}
            <div style={{ flex: 1, padding: '30px 40px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, overflowY: 'auto' }}>

                {/* Header: Back and Delete */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            width: '40px', height: '40px', borderRadius: '20px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <button
                        onClick={() => onDelete(game)}
                        style={{
                            background: 'rgba(255, 45, 85, 0.1)', color: '#ff2d55', border: 'none',
                            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.85em'
                        }}
                    >
                        <Trash2 size={16} /> SUPPRIMER
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                    {/* Left: Artwork Box */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        style={{ position: 'relative', width: '220px', flexShrink: 0 }}
                    >
                        {/* The Cover */}
                        <div style={{
                            width: '100%',
                            aspectRatio: '3/4',
                            background: '#1a1a20',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {(game.thumbnail || game.image) ? (
                                <img src={`media://${game.thumbnail || game.image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                                    <Play size={60} />
                                </div>
                            )}
                        </div>

                        {/* The Wheel (Overlay Tilted) */}
                        {game.wheel && (
                            <motion.div
                                initial={{ scale: 0.6, rotate: 15, opacity: 0 }}
                                animate={{ scale: 1, rotate: 12, opacity: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                                style={{
                                    position: 'absolute',
                                    width: '140%',
                                    top: '-40px',
                                    right: '-100px',
                                    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.8))',
                                    pointerEvents: 'none',
                                    zIndex: 20
                                }}
                            >
                                <img src={`media://${game.wheel}`} style={{ width: '100%', maxHeight: '140px', objectFit: 'contain' }} />
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Right: Info Panels */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h1 style={{ fontSize: '2.8em', fontWeight: '900', margin: 0, letterSpacing: '-1.5px', lineHeight: 1.1, textShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                                {cleanName(game.name)}
                            </h1>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', fontSize: '0.9em' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Sortie"><Calendar size={16} color="var(--accent-color)" /> {game.releaseDate?.substring(0, 4) || 'N/A'}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Développeur"><User size={16} color="var(--accent-color)" /> {game.developer || 'Inconnu'}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Genre"><Gamepad2 size={16} color="var(--accent-color)" /> {game.genre || 'Inconnu'}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Joueurs"><Users size={16} color="var(--accent-color)" /> {game.players || '1'} P</div>
                                {game.rating && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24' }} title="Note">
                                        <Star size={16} fill="#fbbf24" /> {Math.round(parseFloat(game.rating.toString()) * 100)}%
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{
                            fontSize: '1em',
                            lineHeight: '1.5',
                            color: 'rgba(255,255,255,0.7)',
                            background: 'rgba(255,255,255,0.02)',
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {game.description || "Aucune description disponible pour ce jeu."}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                            <button
                                onClick={() => onLaunchNative(game)}
                                style={{
                                    flex: 1, height: '55px', borderRadius: '12px',
                                    background: 'var(--accent-color)', color: 'white',
                                    border: 'none', fontWeight: '900', fontSize: '1.1em',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '10px',
                                    boxShadow: '0 10px 20px rgba(255, 0, 85, 0.3)'
                                }}
                            >
                                <Play size={24} fill="white" /> LANCER LE JEU
                            </button>
                            <button
                                onClick={() => onLaunchWeb(game)}
                                style={{
                                    width: '70px', height: '55px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)', color: 'white',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', transition: 'all 0.3s'
                                }}
                                title="Lancer via WebPlay (Mobile/Tablette)"
                            >
                                <Globe size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Media Thumbnails */}
            <div style={{ padding: '0 40px 30px', display: 'flex', gap: '20px', zIndex: 5, marginTop: 'auto' }}>
                {game.video && (
                    <motion.div
                        whileHover={{ scale: 1.05, translateY: -5 }}
                        onClick={() => setPreviewMedia({ url: `media://${game.video}`, type: 'video' })}
                        style={{
                            width: '280px', aspectRatio: '16/9', borderRadius: '15px', overflow: 'hidden',
                            border: '3px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: '#000', position: 'relative'
                        }}
                    >
                        <video src={`media://${game.video}`} muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ background: 'var(--accent-color)', borderRadius: '50%', padding: '12px' }}><Play size={20} fill="white" /></div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '10px', left: '15px', fontSize: '0.7em', fontWeight: '900', textTransform: 'uppercase', opacity: 0.8 }}>PREVIEW VIDEO</div>
                    </motion.div>
                )}
                {game.image && (
                    <motion.div
                        whileHover={{ scale: 1.05, translateY: -5 }}
                        onClick={() => setPreviewMedia({ url: `media://${game.image}`, type: 'image' })}
                        style={{
                            width: '280px', aspectRatio: '16/9', borderRadius: '15px', overflow: 'hidden',
                            border: '3px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: '#000', position: 'relative'
                        }}
                    >
                        <img src={`media://${game.image}`} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.8 }} />
                        <div style={{ position: 'absolute', bottom: '10px', left: '15px', fontSize: '0.7em', fontWeight: '900', textTransform: 'uppercase', opacity: 0.8 }}>SCREENSHOT</div>
                    </motion.div>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {previewMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewMedia(null)}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.98)', zIndex: 1000, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', padding: '50px', cursor: 'zoom-out'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ maxWidth: '100%', maxHeight: '100%', display: 'flex', boxShadow: '0 0 100px rgba(0,0,0,1)' }}
                        >
                            {previewMedia.type === 'video' ? (
                                <video src={previewMedia.url} autoPlay controls style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '10px' }} />
                            ) : (
                                <img src={previewMedia.url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '10px' }} />
                            )}
                        </motion.div>
                        <div style={{ position: 'absolute', top: '40px', right: '50px', color: 'white', fontSize: '2.5em' }}>×</div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}
