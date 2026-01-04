import { useState, useEffect } from 'react';
import GameDetails from './GameDetails';

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

export default function GameList({ system, onBack }: { system: string, onBack: () => void }) {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);

    useEffect(() => {
        loadData();
    }, [system]); // Reload if system changes

    const loadData = async () => {
        setLoading(true);
        // Load Games from DB
        const dbGames = await window.electronAPI.getDbGames(system);
        setGames(dbGames);
        setLoading(false);
    };

    const handleScan = async () => {
        setScanning(true);
        const result = await window.electronAPI.scanSystem(system);
        setScanning(false);
        alert(`Scan terminé: ${result.added} nouveaux jeux (Total: ${result.total})`);
        loadData();
    };

    const handleItemClick = (game: Game) => {
        setSelectedGame(game);
    };

    const handleLaunchNative = async (game: Game) => {
        // Attempt launch
        const result = await window.electronAPI.launchGame(system, game);

        if (!result.success && (result as any).error === 'MISSING_CORE') {
            const missingMsg = `Le moteur pour ${system} est manquant. Voulez-vous le télécharger (2-10 Mo) ?`;
            if (confirm(missingMsg)) {
                const installResult = await window.electronAPI.installCore(system);

                if (!installResult.success) {
                    alert("Échec du téléchargement du moteur: " + (installResult as any).error);
                    return;
                }

                const retry = await window.electronAPI.launchGame(system, game);
                if (!retry.success) {
                    alert("Erreur au lancement après installation: " + (retry as any).error);
                }
            }
        } else if (!result.success) {
            alert("Erreur au lancement: " + (result as any).error);
        }
    };

    const handleLaunchWeb = (game: Game) => {
        // We could use window.dispatchEvent or similar if we don't want to drill props further
        window.dispatchEvent(new CustomEvent('web-play-launch', { detail: { system, game } }));
    };

    const handleDelete = async (game: Game) => {
        if (confirm(`Voulez-vous supprimer "${game.name}" du catalogue ? (Le fichier restera sur le disque)`)) {
            await window.electronAPI.deleteGame(game.id);
            setSelectedGame(null);
            loadData();
        }
    };

    const handleReset = async () => {
        if (confirm(`Voulez-vous vider la liste des jeux pour ${system} ?`)) {
            await window.electronAPI.resetSystem(system);
            loadData();
        }
    };

    const cleanName = (name: string) => {
        return name.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, '').trim();
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedGame && (
                <GameDetails
                    game={selectedGame}
                    onBack={() => setSelectedGame(null)}
                    onLaunchNative={handleLaunchNative}
                    onLaunchWeb={handleLaunchWeb}
                    onDelete={handleDelete}
                />
            )}

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '24px',
                            cursor: 'pointer',
                            marginRight: '20px'
                        }}>
                        ←
                    </button>
                    <h2 style={{ margin: 0 }}>{system} Library ({games.length})</h2>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleReset}
                        style={{
                            padding: '8px 15px',
                            background: 'rgba(255, 45, 85, 0.1)',
                            border: '1px solid rgba(255, 45, 85, 0.2)',
                            color: '#ff2d55',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8em',
                            fontWeight: 'bold'
                        }}>
                        VIDER
                    </button>
                    <button
                        onClick={handleScan}
                        disabled={scanning}
                        style={{
                            padding: '8px 20px',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            color: scanning ? 'gray' : 'white',
                            borderRadius: '4px',
                            cursor: scanning ? 'wait' : 'pointer',
                            fontSize: '0.85em',
                            fontWeight: 'bold'
                        }}>
                        {scanning ? '...' : 'SCAN'}
                    </button>
                </div>
            </div>

            {loading && <p>Chargement de la base de données...</p>}

            {!loading && games.length === 0 && (
                <div style={{
                    padding: '40px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px dashed var(--glass-border)'
                }}>
                    <h3>Aucun jeu dans la base de données</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Placez vos fichiers dans <code>content/Roms/{system}</code><br />
                        et cliquez sur <strong>SCANNER</strong>.
                    </p>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '15px',
                paddingRight: '5px'
            }}>
                {games.map(game => (
                    <div
                        key={game.id}
                        onClick={() => handleItemClick(game)}
                        title={game.description || game.name}
                        style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer',
                            border: '1px solid var(--glass-border)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-color)';
                            e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 45, 85, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--glass-border)';
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
                        }}
                    >
                        <div style={{
                            width: '100%',
                            aspectRatio: '2/3',
                            background: '#1a1a1f',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                        }}>
                            {(game.thumbnail || game.image) ? (
                                <img
                                    src={`media://${game.thumbnail || game.image}`}
                                    alt={game.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.5s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '48px', opacity: 0.3 }}>🎮</span>
                                    <span style={{ fontSize: '12px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>No Image</span>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '4px 0' }}>
                            <div style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '14px',
                                color: '#eee',
                                fontWeight: '600',
                                marginBottom: '2px'
                            }}>
                                {cleanName(game.name)}
                            </div>
                            {(game.developer || game.releaseDate) && (
                                <div style={{ fontSize: '11px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{game.developer?.split(',')[0]}</span>
                                    <span>{game.releaseDate?.substring(0, 4)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
