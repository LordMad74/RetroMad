import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KioskBackground from './KioskBackground';

// Themes definitions
const THEMES = {
    neon_arcade: {
        name: "Neon Arcade",
        bg: "linear-gradient(135deg, #120024 0%, #32004a 100%)",
        accent: "#ff00ff",
        font: "'Orbitron', sans-serif"
    },
    classic_cabinet: {
        name: "Classic Cabinet",
        bg: "url('media://fanarts/default_cabinet.png'), #1a1a1a",
        accent: "#ffd700",
        font: "'Press Start 2P', monospace"
    },
    future_glass: {
        name: "Future Glass",
        bg: "#000",
        accent: "#00ffff",
        font: "sans-serif"
    }
};

export default function KioskMode({ config, onExit }: { config: any, onExit: () => void }) {
    const themeName = config.theme || 'neon_arcade';
    const backgroundEffect = config.effect || 'none';
    const [allSystems, setAllSystems] = useState<any[]>([]);
    const [systems, setSystems] = useState<any[]>([]);
    const [manufacturers, setManufacturers] = useState<any[]>([]);
    const [selectedManufacturerIndex, setSelectedManufacturerIndex] = useState(0);
    const [selectedSystemIndex, setSelectedSystemIndex] = useState(0);
    const [selectedGameIndex, setSelectedGameIndex] = useState(0);
    const [view, setView] = useState<'manufacturers' | 'systems' | 'games'>('systems');
    const [games, setGames] = useState<any[]>([]);
    const [wikiData, setWikiData] = useState<any>(null);
    const [manWikiData, setManWikiData] = useState<any>(null);
    const [pexelsData, setPexelsData] = useState<string | null>(null);

    // Theme resolving
    const baseTheme = THEMES[themeName as keyof typeof THEMES] || THEMES['neon_arcade'];
    const theme = {
        ...baseTheme,
        accent: config.accentColor || baseTheme.accent,
        font: config.fontFamily || baseTheme.font
    };

    // Map system IDs to readable names if needed
    const systemMap: Record<string, string> = {
        'nes': 'Nintendo Entertainment System',
        'snes': 'Super Nintendo',
        'megadrive': 'Sega Mega Drive',
        'psx': 'Sony PlayStation',
        'n64': 'Nintendo 64',
        'master_system': 'Sega Master System',
        'gba': 'Game Boy Advance',
        'gbc': 'Game Boy Color',
        'gb': 'Game Boy',
        'arcade': 'Arcade Classics'
    };

    useEffect(() => {
        loadSystems();
    }, []);

    // --- NEW FEATURES ---
    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef<NodeJS.Timeout | null>(null);
    const [isIdle, setIsIdle] = useState(false);
    const idleTimer = useRef<NodeJS.Timeout | null>(null);

    // Audio Refs
    const audioNav = useRef(new Audio('media://sounds/navigation.wav'));
    const audioSelect = useRef(new Audio('media://sounds/select.wav'));
    const audioBack = useRef(new Audio('media://sounds/back.wav'));

    const playSfx = (type: 'nav' | 'select' | 'back') => {
        // Simple fire and forget
        const audio = type === 'nav' ? audioNav.current : type === 'select' ? audioSelect.current : audioBack.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => { }); // Catch error if file missing or user interaction policy
        }
    };

    // IDLE TIMER (Attract Mode Trigger)
    useEffect(() => {
        const resetIdle = () => {
            setIsIdle(false);
            if (idleTimer.current) clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(() => setIsIdle(true), 60000); // 1 min idle
        };

        window.addEventListener('keydown', resetIdle);
        window.addEventListener('mousemove', resetIdle);
        resetIdle();

        return () => {
            window.removeEventListener('keydown', resetIdle);
            window.removeEventListener('mousemove', resetIdle);
            if (idleTimer.current) clearTimeout(idleTimer.current);
        };
    }, []);

    // ATTRACT MODE BEHAVIOR
    useEffect(() => {
        if (!isIdle) return;

        const interval = setInterval(() => {
            if (view === 'games' && games.length > 0) {
                // Random game jump
                const r = Math.floor(Math.random() * games.length);
                setSelectedGameIndex(r);
            } else if (view === 'systems' && systems.length > 0) {
                // Random system jump
                setSelectedSystemIndex(Math.floor(Math.random() * systems.length));
            }
        }, 8000); // Change every 8 seconds

        return () => clearInterval(interval);
    }, [isIdle, view, games, systems]);


    // VIDEO DELAY LOGIC
    useEffect(() => {
        setShowVideo(false);
        if (videoRef.current) clearTimeout(videoRef.current);

        videoRef.current = setTimeout(() => {
            setShowVideo(true);
        }, 2000); // Wait 2s before showing video

        return () => {
            if (videoRef.current) clearTimeout(videoRef.current);
        };
    }, [selectedGameIndex, view]);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // ADMIN SHORTCUTS
            if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
                onExit();
                return;
            }

            if (e.key === 'Escape') {
                playSfx('back');
                if (view === 'games') {
                    setView('systems');
                } else if (view === 'systems') {
                    if (manufacturers.length > 0) {
                        setView('manufacturers');
                    } else {
                        if (confirm("Sortir du mode Kiosk ?")) onExit();
                    }
                } else if (view === 'manufacturers') {
                    if (confirm("Sortir du mode Kiosk ?")) onExit();
                }
            }

            if (view === 'manufacturers') {
                if (e.key === 'ArrowRight') { setSelectedManufacturerIndex(prev => (prev + 1) % manufacturers.length); playSfx('nav'); }
                if (e.key === 'ArrowLeft') { setSelectedManufacturerIndex(prev => (prev - 1 + manufacturers.length) % manufacturers.length); playSfx('nav'); }
                if (e.key === 'Enter') { handleSelectManufacturer(manufacturers[selectedManufacturerIndex]); playSfx('select'); }
            } else if (view === 'systems') {
                if (e.key === 'ArrowRight') { setSelectedSystemIndex(prev => (prev + 1) % systems.length); playSfx('nav'); }
                if (e.key === 'ArrowLeft') { setSelectedSystemIndex(prev => (prev - 1 + systems.length) % systems.length); playSfx('nav'); }
                if (e.key === 'Enter') { handleSelectSystem(systems[selectedSystemIndex]); playSfx('select'); }
            } else if (view === 'games') {
                if (e.key === 'ArrowDown') { setSelectedGameIndex(prev => (prev + 1) % games.length); playSfx('nav'); }
                if (e.key === 'ArrowUp') { setSelectedGameIndex(prev => (prev - 1 + games.length) % games.length); playSfx('nav'); }
                if (e.key === 'ArrowRight') { setSelectedGameIndex(prev => (prev + 1) % games.length); playSfx('nav'); }
                if (e.key === 'ArrowLeft') { setSelectedGameIndex(prev => (prev - 1 + games.length) % games.length); playSfx('nav'); }
                if (e.key === 'Enter') { handleLaunchGame(games[selectedGameIndex]); playSfx('select'); }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [systems, manufacturers, selectedSystemIndex, selectedManufacturerIndex, view, games, selectedGameIndex]);

    // Fetch Wiki Data when system changes
    useEffect(() => {
        const fetchWiki = async () => {
            if (view === 'systems' && systems[selectedSystemIndex]) {
                const sys = systems[selectedSystemIndex];
                const sysId = sys.id;

                setWikiData(null);
                setPexelsData(null);

                try {
                    const info = await window.electronAPI.getWikiInfo(sysId);
                    if (info) setWikiData(info);

                    if (!sys.image) {
                        const pexelsQuery = `abstract neon retro gaming ${sys.name}`;
                        const pexelsImage = await window.electronAPI.searchPexelsImage(pexelsQuery);
                        if (pexelsImage && pexelsImage.src) {
                            setPexelsData(pexelsImage.src.original);
                        }
                    }
                } catch (e) { console.error(e); }
            }
        };
        const timer = setTimeout(fetchWiki, 500);
        return () => clearTimeout(timer);
    }, [selectedSystemIndex, systems, view]);

    // Fetch Manufacturer Wiki Data
    useEffect(() => {
        const fetchManWiki = async () => {
            if (view === 'manufacturers' && manufacturers[selectedManufacturerIndex]) {
                const man = manufacturers[selectedManufacturerIndex];
                setManWikiData(null);
                try {
                    const info = await window.electronAPI.getWikiInfo(man.name);
                    if (info) setManWikiData(info);
                } catch (e) { console.error(e); }
            }
        };
        const timer = setTimeout(fetchManWiki, 500);
        return () => clearTimeout(timer);
    }, [selectedManufacturerIndex, manufacturers, view]);

    const loadSystems = async () => {
        const sys = await window.electronAPI.getConfiguredSystems();
        const mans = await window.electronAPI.getManufacturers();
        setAllSystems(sys || []);

        const usedMans = new Set(sys.map((s: any) => s.manufacturer).filter(Boolean));
        const activeMans = (mans || []).filter((m: any) => usedMans.has(m.name));

        if (activeMans.length > 0) {
            setManufacturers(activeMans);
            setView('manufacturers');
        } else {
            setSystems(sys || []);
            setView('systems');
        }
    };

    const handleSelectSystem = async (sys: any) => {
        if (!sys) return;
        const g = await window.electronAPI.getDbGames(sys.id);
        setGames(g);
        setSelectedGameIndex(0);
        setView('games');
    };

    const handleLaunchGame = (game: any) => {
        if (!game) return;
        const currentSystem = systems[selectedSystemIndex];
        window.electronAPI.launchGame(currentSystem.id, game);
    };

    const handleSelectManufacturer = (man: any) => {
        const filtered = allSystems.filter(s => s.manufacturer === man.name);
        setSystems(filtered);
        setSelectedSystemIndex(0);
        setView('systems');
    };

    // --- RENDER HELPERS ---

    const SYSTEM_METADATA: Record<string, any> = {
        'nes': { description: "La console 8-bit légendaire de Nintendo qui a sauvé l'industrie.", year: '1983', manufacturer: 'Nintendo', specs: '8-Bit / 2KB RAM' },
        'snes': { description: "Le cerveau de la bête. Graphismes 16-bit et Mode 7 révolutionnaires.", year: '1990', manufacturer: 'Nintendo', specs: '16-Bit / Mode 7' },
        'megadrive': { description: "Genesis does what Nintendon't. La vitesse et l'attitude Sega.", year: '1988', manufacturer: 'Sega', specs: '16-Bit / Blast Processing' },
        'psx': { description: "La révolution 3D. Premier grand succès de Sony dans le jeu vidéo.", year: '1994', manufacturer: 'Sony', specs: '32-Bit / CD-ROM' },
        'arcade': { description: "L'âge d'or du jeu vidéo. Insert Coin !", year: '1970+', manufacturer: 'Divers', specs: 'Arcade Boards' }
    };

    const renderSystemWheel = () => {
        if (systems.length === 0) return <div style={{ color: 'white' }}>No Systems Found</div>;
        const current = systems[selectedSystemIndex];
        let meta = SYSTEM_METADATA[current.id.toLowerCase()] || { description: "Console Retrogaming", year: 'N/A', manufacturer: 'Unknown' };
        if (wikiData) {
            meta = {
                ...meta,
                description: wikiData.description || meta.description,
                year: wikiData.year !== 'N/A' ? wikiData.year : meta.year,
            };
        }
        const bgImage = current.image || pexelsData || wikiData?.image;

        return (
            <div style={{
                width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
                background: 'radial-gradient(circle at center, #3e004e 0%, #111 90%)'
            }}>
                <KioskBackground effect={backgroundEffect} />
                <motion.div key={current.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: bgImage ? `url(${bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.6, filter: bgImage ? 'blur(8px) brightness(0.7)' : 'none', transform: 'scale(1.1)' }} />
                    <div className="particles" style={{ position: 'absolute', width: '100%', height: '100%' }} />
                </motion.div>

                {config.scanlines && (
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%', zIndex: 10 }} />
                )}

                <div style={{ position: 'absolute', top: '8%', left: '0', width: '100%', height: '50vmin', perspective: '100vw', zIndex: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {systems.map((sys, i) => {
                        const length = systems.length;
                        let offset = (i - selectedSystemIndex);
                        while (offset <= -length / 2) offset += length;
                        while (offset > length / 2) offset -= length;
                        const isVisible = Math.abs(offset) <= 2;
                        const isCenter = offset === 0;
                        if (!isVisible) return null;

                        return (
                            <motion.div key={sys.id} animate={{ x: `${offset * 25}vw`, z: Math.abs(offset) * -200, rotateY: offset * 25, scale: 1 - Math.abs(offset) * 0.2, opacity: 1 - Math.abs(offset) * 0.4, zIndex: 100 - Math.abs(offset) }}
                                transition={{ type: 'spring', stiffness: 120, damping: 14, mass: 1 }}
                                style={{
                                    position: 'absolute',
                                    width: isCenter ? '44vmin' : '28vmin',
                                    height: isCenter ? '33vmin' : '21vmin',
                                    background: isCenter ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0,0,0,0.5)',
                                    border: `2px solid ${isCenter ? theme.accent : '#333'}`,
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: isCenter ? `0 0 80px ${theme.accent}66, inset 0 0 150px ${theme.accent}aa` : 'none',
                                    backdropFilter: 'blur(5px)',
                                    fontSize: '1vmin'
                                }}>
                                {(() => {
                                    const logoUrl = sys.logo || (isCenter ? wikiData?.thumbnail : null);
                                    return (
                                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {logoUrl && (
                                                <img
                                                    src={logoUrl}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        transform: 'scale(1.2)',
                                                        filter: isCenter ? 'brightness(1.1)' : 'grayscale(80%) brightness(0.6)',
                                                        transition: 'filter 0.5s',
                                                        zIndex: 0,
                                                        WebkitMaskImage: 'radial-gradient(ellipse 88% 82% at center, black 55%, transparent 100%)',
                                                        maskImage: 'radial-gradient(ellipse 88% 82% at center, black 55%, transparent 100%)'
                                                    }}
                                                />
                                            )}
                                            <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '100.5%', padding: '10vmin 0 2vmin 0', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)', borderRadius: '0 0 20px 20px' }}>
                                                <div style={{ fontSize: isCenter ? '4vmin' : '2.5vmin', color: 'white', textShadow: `0 0 20px ${theme.accent}, 0 0 5px black`, fontWeight: 'bold', fontFamily: theme.font, textAlign: 'center', letterSpacing: '0.5vmin' }}>{sys.name.toUpperCase()}</div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={current.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                        style={{ position: 'absolute', bottom: '12%', left: '50%', x: '-50%', width: '80%', maxWidth: '900px', textAlign: 'center', zIndex: 25, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px', background: 'rgba(0,0,0,0.6)', padding: '5px 20px', borderRadius: '30px', border: `1px solid ${theme.accent}66`, boxShadow: `0 0 15px ${theme.accent}33` }}>
                            <h3 style={{ margin: 0, color: theme.accent, fontSize: '1.2em', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: theme.font }}>{wikiData?.title ? wikiData.title.toUpperCase() : current.name}</h3>
                            <span style={{ color: '#888' }}>|</span>
                            <span style={{ color: '#ccc', fontSize: '0.9em', fontWeight: 'bold' }}>{meta.year}</span>
                        </div>
                        <p style={{ fontSize: '1em', color: '#eee', lineHeight: '1.5', textShadow: '0 2px 2px black', background: 'rgba(0,0,0,0.7)', padding: '15px 25px', borderRadius: '15px', backdropFilter: 'blur(5px)', borderTop: `1px solid rgba(255,255,255,0.1)`, maxHeight: '15vh', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>"{meta.description}"</p>
                        <div style={{ marginTop: '5px', display: 'inline-block', padding: '2px 10px', border: '1px solid #444', borderRadius: '10px', fontSize: '0.7em', color: '#888', background: 'rgba(0,0,0,0.8)' }}>{meta.specs}</div>
                    </motion.div>
                </AnimatePresence>
                <div style={{ position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center', zIndex: 30, opacity: 0.6 }}>
                    <p style={{ fontSize: '1em', textTransform: 'uppercase', letterSpacing: '3px' }}>Sélectionner &bull; Entrer | Sortie: Ctrl+Shift+Q</p>
                </div>
            </div>
        );
    };

    const renderCoinOpsStyle = () => {
        const currentSystem = systems[selectedSystemIndex];
        const currentGame = games[selectedGameIndex];

        if (view === 'systems' || !currentSystem) return renderSystemWheel();
        if (!games.length) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>Aucun jeu trouvé</div>;

        return (
            <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
                <AnimatePresence mode='popLayout'>
                    <motion.div key={currentGame.fanart || currentGame.image || 'default'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: currentGame.fanart ? `url(media://${currentGame.fanart})` : (currentGame.image ? `url(media://${currentGame.image})` : 'none'), backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3) blur(5px)', zIndex: 1 }}>
                        {(!currentGame.fanart && !currentGame.image) && <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #111, #220033)' }} />}
                    </motion.div>
                </AnimatePresence>

                {/* VIDEO LAYER - FADE IN */}
                {currentGame.video && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: showVideo || isIdle ? 1 : 0 }}
                        transition={{ duration: 1 }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}
                    >
                        {/* If idle, remove mute to attract ? No, keep silent or user preference */}
                        <video src={`media://${currentGame.video}`} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isIdle ? 1 : 0.4 }} />
                    </motion.div>
                )}

                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%', pointerEvents: 'none' }} />

                {/* HIDE UI IN IDLE MODE */}
                <motion.div
                    animate={{ opacity: isIdle ? 0 : 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, display: 'flex' }}
                >
                    <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 20 }}>
                        <div style={{ marginBottom: '20px', minHeight: '120px', display: 'flex', alignItems: 'center' }}>
                            <AnimatePresence mode='wait'>
                                {currentGame.wheel || currentGame.marquee ? (
                                    <motion.img key={currentGame.wheel || currentGame.marquee} initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: -20, position: 'absolute' }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} src={currentGame.wheel ? `media://${currentGame.wheel}` : `media://${currentGame.marquee}`} style={{ maxWidth: '450px', maxHeight: '180px', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))' }} />
                                ) : (
                                    <motion.h1 key={currentGame.name} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0, position: 'absolute' }} style={{ fontFamily: theme.font, fontSize: '3.5em', textShadow: `0 0 20px ${theme.accent}`, margin: 0, color: 'white', textTransform: 'uppercase' }}>{currentGame.name}</motion.h1>
                                )}
                            </AnimatePresence>
                        </div>
                        <div style={{ position: 'relative', background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(10px)', padding: '25px', borderRadius: '20px', border: `1px solid ${theme.accent}44`, boxShadow: `0 10px 30px rgba(0,0,0,0.5)`, maxWidth: '750px', animation: 'fadeIn 0.5s ease-out' }}>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
                                <span style={{ padding: '5px 15px', background: theme.accent, color: '#000', fontWeight: '900', borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.9em', boxShadow: `0 0 15px ${theme.accent}66` }}>{systemMap[currentSystem.id] || currentSystem.name}</span>
                                <span style={{ padding: '5px 15px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', fontWeight: 'bold' }}>{currentGame.releaseDate ? currentGame.releaseDate.substring(0, 4) : 'N/A'}</span>
                                <span style={{ padding: '5px 15px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}>{currentGame.genre || 'Arcade'}</span>
                                {currentGame.players && <span style={{ padding: '5px 15px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#ccc' }}>{currentGame.players.includes('Player') ? currentGame.players : `${currentGame.players} Players`}</span>}
                                {currentGame.rating && <span style={{ padding: '0 10px', color: '#FFD700', fontSize: '1.2em' }}>{'★'.repeat(Math.min(5, Math.round(parseFloat(currentGame.rating) * 5)))}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '25px' }}>
                                <div style={{ width: '240px', height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000', flexShrink: 0, boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
                                    {currentGame.video ? <video src={`media://${currentGame.video}`} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={currentGame.image ? `media://${currentGame.image}` : `media://${currentGame.thumbnail}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <motion.p key={currentGame.description} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ margin: 0, fontSize: '1.05em', lineHeight: '1.6', color: '#ddd', textShadow: '0 1px 2px black', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 7, WebkitBoxOrient: 'vertical' }}>{currentGame.description || "Aucune description disponible pour ce jeu."}</motion.p>
                            </div>
                            {currentGame.thumbnail && <motion.div key={currentGame.thumbnail} initial={{ opacity: 0, x: 50, rotateY: -90 }} animate={{ opacity: 1, x: 0, rotateY: -15 }} transition={{ delay: 0.3, type: 'spring', stiffness: 100 }} style={{ position: 'absolute', right: '-80px', bottom: '20px', width: '160px', height: 'auto', zIndex: 30, filter: 'drop-shadow(5px 10px 20px rgba(0,0,0,0.8))', transformStyle: 'preserve-3d', perspective: '1000px' }}><img src={`media://${currentGame.thumbnail}`} style={{ width: '100%', borderRadius: '5px' }} onError={(e) => e.currentTarget.style.display = 'none'} /></motion.div>}
                        </div>
                    </motion.div>
                    <div style={{ width: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.8))' }} />
                        <div style={{ position: 'absolute', width: '100%', height: '100px', background: `linear-gradient(90deg, ${theme.accent}00, ${theme.accent}22)`, borderRight: `5px solid ${theme.accent}`, right: 0 }} />
                        {/* WHEEL LIST - SAME AS BEFORE, JUST WRAPPED IN MOTION DIV FOR IDLE FADE OUT */}
                        <div style={{ position: 'relative', width: '100%', height: '800px', perspective: '1000px' }}>
                            {(() => {
                                const windowRadius = Math.min(4, Math.floor((games.length - 1) / 2));
                                const wheelItems = [];
                                for (let i = -windowRadius; i <= windowRadius; i++) {
                                    const idx = (selectedGameIndex + i + games.length) % games.length;
                                    wheelItems.push({ ...games[idx], offset: i, key: games[idx].path });
                                }
                                return wheelItems.map((item) => {
                                    const yOff = item.offset * 140;
                                    const xOff = Math.abs(item.offset) * 40;
                                    const scale = 1 - Math.abs(item.offset) * 0.2;
                                    const opacity = Math.max(0, 1 - Math.abs(item.offset) * 0.5);
                                    const zIndex = 100 - Math.abs(item.offset);
                                    return (
                                        <motion.div
                                            key={item.key}
                                            initial={false}
                                            animate={{ y: -50 + yOff, x: -xOff, scale: scale, opacity: opacity, zIndex: zIndex, rotateY: item.offset === 0 ? 0 : (config.wheelTilt || 0) }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                            style={{ position: 'absolute', top: '50%', right: '20px', textAlign: 'right', width: '300px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', transformOrigin: 'right center', perspective: '1000px' }}
                                        >
                                            {item.wheel ? <img src={`media://${item.wheel}`} style={{ maxHeight: '120%', maxWidth: '100%', objectFit: 'contain', filter: `drop-shadow(2px 2px 2px black) drop-shadow(0 0 ${item.offset === 0 ? (config.glowIntensity ? config.glowIntensity / 10 : 10) : 0}px ${theme.accent})` }} /> : <span style={{ fontFamily: theme.font, fontSize: '1.5em', fontWeight: 'bold', textShadow: `2px 2px 4px black, 0 0 ${item.offset === 0 ? 15 : 0}px ${theme.accent}`, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>}
                                        </motion.div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </motion.div>

                {config.scanlines && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%', pointerEvents: 'none' }} />
                )}

                {isIdle && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', bottom: '50px', width: '100%', textAlign: 'center', zIndex: 50, color: theme.accent, textShadow: '0 0 10px black' }}>
                        <h2>ATTRACT MODE</h2>
                        <p>Appuyez sur une touche pour reprendre</p>
                    </motion.div>
                )}

                <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 20, opacity: 0.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <kbd style={{ background: '#fff', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>ENTER</kbd> Jouer | Sortie: Ctrl+Shift+Q
                    </div>
                </div>
            </div>
        );
    };

    const renderManufacturerWheel = () => {
        if (manufacturers.length === 0) return <div style={{ color: 'white' }}>No Manufacturers</div>;
        const current = manufacturers[selectedManufacturerIndex];
        const bgImage = current.logo;

        return (
            <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at center, #3e004e 0%, #111 90%)' }}>
                <KioskBackground effect={backgroundEffect} />
                <motion.div key={current.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: bgImage ? `url(${bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5, filter: 'blur(20px) brightness(0.6)', transform: 'scale(1.1)' }} />
                    <div className="particles" style={{ position: 'absolute', width: '100%', height: '100%' }} />
                </motion.div>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%', pointerEvents: 'none' }} />

                <div style={{ position: 'absolute', top: '8%', left: '0', width: '100%', height: '50vmin', perspective: '100vw', zIndex: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {manufacturers.map((man, i) => {
                        const length = manufacturers.length;
                        let offset = (i - selectedManufacturerIndex);
                        while (offset <= -length / 2) offset += length;
                        while (offset > length / 2) offset -= length;
                        const isVisible = Math.abs(offset) <= 2;
                        const isCenter = offset === 0;
                        if (!isVisible) return null;

                        return (
                            <motion.div key={man.id} animate={{ x: `${offset * 25}vw`, z: Math.abs(offset) * -200, rotateY: offset * 25, scale: 1 - Math.abs(offset) * 0.2, opacity: 1 - Math.abs(offset) * 0.4, zIndex: 100 - Math.abs(offset) }} transition={{ type: 'spring', stiffness: 120, damping: 14, mass: 1 }}
                                style={{ position: 'absolute', width: isCenter ? '44vmin' : '28vmin', height: isCenter ? '33vmin' : '21vmin', background: isCenter ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0,0,0,0.5)', border: `2px solid ${isCenter ? theme.accent : '#333'}`, borderRadius: '20px', overflow: 'hidden', boxShadow: isCenter ? `0 0 80px ${theme.accent}66, inset 0 0 150px ${theme.accent}aa` : 'none', backdropFilter: 'blur(5px)', fontSize: '1vmin' }}>
                                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                    {man.logo ? (
                                        <img
                                            src={man.logo}
                                            style={{
                                                maxWidth: '90%',
                                                maxHeight: '90%',
                                                objectFit: 'contain',
                                                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
                                                WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)',
                                                maskImage: 'radial-gradient(ellipse 85% 80% at center, black 50%, transparent 100%)'
                                            }}
                                        />
                                    ) : (
                                        <h2 style={{ color: 'white' }}>{man.name}</h2>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                <AnimatePresence mode="wait">
                    <motion.div key={current.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                        style={{ position: 'absolute', bottom: '15%', left: '50%', x: '-50%', width: '80%', textAlign: 'center', zIndex: 25 }}>
                        <h1 style={{ fontFamily: theme.font, color: theme.accent, fontSize: '3em', textShadow: `0 0 20px ${theme.accent}` }}>{current.name}</h1>
                        {manWikiData && (
                            <p style={{ color: '#ccc', maxWidth: '600px', margin: '0 auto', background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '10px' }}>{manWikiData.description}</p>
                        )}
                    </motion.div>
                </AnimatePresence>
                <div style={{ position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center', zIndex: 30, opacity: 0.6 }}>
                    <p style={{ fontSize: '1em', textTransform: 'uppercase', letterSpacing: '3px' }}>Sélectionner &bull; Entrer | Sortie: Ctrl+Shift+Q</p>
                </div>
            </div>
        );
    };

    if (view === 'manufacturers') return renderManufacturerWheel();
    return renderCoinOpsStyle();
}
