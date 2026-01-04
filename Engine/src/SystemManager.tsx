import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Gamepad2, List, Trash2, RefreshCw, FileJson, Scan, Plus, Wand2, X, FileCog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoreDef {
    id: string;
    name: string;
    lib: string;
    installed?: boolean;
}

const PRESETS = [
    { id: 'nes', name: 'Nintendo Entertainment System', manufacturer: 'Nintendo', extensions: '.nes, .unf, .zip, .7z', coreType: 'nes' },
    { id: 'snes', name: 'Super Nintendo (SNES)', manufacturer: 'Nintendo', extensions: '.sfc, .smc, .zip, .7z', coreType: 'snes' },
    { id: 'n64', name: 'Nintendo 64', manufacturer: 'Nintendo', extensions: '.n64, .z64, .zip, .7z', coreType: 'n64' },
    { id: 'gc', name: 'Nintendo GameCube', manufacturer: 'Nintendo', extensions: '.iso, .rvz, .gcm', coreType: 'gc' },
    { id: 'wii', name: 'Nintendo Wii', manufacturer: 'Nintendo', extensions: '.iso, .wbfs, .rvz', coreType: 'wii' },
    { id: 'gb', name: 'Game Boy', manufacturer: 'Nintendo', extensions: '.gb, .zip, .7z', coreType: 'gb' },
    { id: 'gbc', name: 'Game Boy Color', manufacturer: 'Nintendo', extensions: '.gbc, .zip, .7z', coreType: 'gbc' },
    { id: 'gba', name: 'Game Boy Advance', manufacturer: 'Nintendo', extensions: '.gba, .zip, .7z', coreType: 'gba' },
    { id: 'nds', name: 'Nintendo DS', manufacturer: 'Nintendo', extensions: '.nds, .zip, .7z', coreType: 'nds' },
    { id: '3ds', name: 'Nintendo 3DS', manufacturer: 'Nintendo', extensions: '.3ds, .cia', coreType: '3ds' },
    { id: 'switch', name: 'Nintendo Switch', manufacturer: 'Nintendo', extensions: '.nsp, .xci', coreType: 'switch' },
    { id: 'mastersystem', name: 'Sega Master System', manufacturer: 'Sega', extensions: '.sms, .zip, .7z', coreType: 'mastersystem' },
    { id: 'megadrive', name: 'Sega Mega Drive / Genesis', manufacturer: 'Sega', extensions: '.md, .gen, .bin, .zip, .7z', coreType: 'megadrive' },
    { id: 'saturn', name: 'Sega Saturn', manufacturer: 'Sega', extensions: '.cue, .iso, .ccd, .mds, .chd', coreType: 'saturn' },
    { id: 'dreamcast', name: 'Sega Dreamcast', manufacturer: 'Sega', extensions: '.cdi, .gdi, .chd', coreType: 'dreamcast' },
    { id: 'psx', name: 'Sony PlayStation', manufacturer: 'Sony', extensions: '.cue, .m3u, .ccd, .iso, .chd, .pbp', coreType: 'psx' },
    { id: 'ps2', name: 'Sony PlayStation 2', manufacturer: 'Sony', extensions: '.iso, .bin, .chd, .gz', coreType: 'ps2' },
    { id: 'psp', name: 'Sony PSP', manufacturer: 'Sony', extensions: '.iso, .cso, .pbp', coreType: 'psp' },
    { id: 'xbox', name: 'Microsoft Xbox', manufacturer: 'Microsoft', extensions: '.iso, .xbe', coreType: 'xbox' },
    { id: 'arcade', name: 'Arcade / MAME', manufacturer: 'Arcade', extensions: '.zip, .7z, .chd', coreType: 'arcade' },
    { id: 'neogeo', name: 'Neo Geo', manufacturer: 'SNK', extensions: '.zip, .7z', coreType: 'neogeo' },
    { id: 'atari2600', name: 'Atari 2600', manufacturer: 'Atari', extensions: '.a26, .bin, .zip', coreType: 'atari2600' },
    { id: 'atari7800', name: 'Atari 7800', manufacturer: 'Atari', extensions: '.a78, .bin, .zip', coreType: 'atari7800' },
    { id: 'atarilynx', name: 'Atari Lynx', manufacturer: 'Atari', extensions: '.lnx, .zip', coreType: 'atarilynx' },
    { id: 'atarijaguar', name: 'Atari Jaguar', manufacturer: 'Atari', extensions: '.j64, .jag, .zip', coreType: 'atarijaguar' },
    { id: 'pcengine', name: 'PC Engine / TurboGrafx-16', manufacturer: 'NEC', extensions: '.pce, .cue, .zip, .7z', coreType: 'pcengine' },
    { id: '3do', name: '3DO Interactive Multiplayer', manufacturer: 'Panasonic', extensions: '.iso, .cue, .bin', coreType: '3do' },
    { id: 'colecovision', name: 'ColecoVision', manufacturer: 'Coleco', extensions: '.col, .rom, .zip', coreType: 'colecovision' },
    { id: 'msx', name: 'MSX / MSX2', manufacturer: 'Microsoft', extensions: '.mx1, .mx2, .rom, .zip', coreType: 'msx' },
    { id: 'dos', name: 'MS-DOS', manufacturer: 'Microsoft', extensions: '.exe, .com, .bat, .zip', coreType: 'dos' },
    { id: 'amiga', name: 'Commodore Amiga', manufacturer: 'Commodore', extensions: '.adf, .ipf, .lha, .zip', coreType: 'amiga' },
    { id: 'c64', name: 'Commodore 64', manufacturer: 'Commodore', extensions: '.d64, .t64, .tap, .prg, .zip', coreType: 'c64' },
    { id: 'wonderswan', name: 'WonderSwan / Color', manufacturer: 'Bandai', extensions: '.ws, .wsc, .zip', coreType: 'wonderswan' },
];

export default function SystemManager() {
    const [systems, setSystems] = useState<any[]>([]);
    const [cores, setCores] = useState<Record<string, CoreDef[]>>({});

    // New System Form
    const [newSysId, setNewSysId] = useState('');
    const [newSysName, setNewSysName] = useState('');
    const [newSysImage, setNewSysImage] = useState('');
    const [newSysLogo, setNewSysLogo] = useState('');
    const [newSysManufacturer, setNewSysManufacturer] = useState('');
    const [newSysExtensions, setNewSysExtensions] = useState('');

    const [manufacturers, setManufacturers] = useState<any[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedCoreType, setSelectedCoreType] = useState('nes');
    const [selectedCore, setSelectedCore] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const sys = await window.electronAPI.getConfiguredSystems();
        const c = await window.electronAPI.getAvailableCores();
        const mans = await window.electronAPI.getManufacturers();
        setSystems(sys);
        setCores(c);
        setManufacturers(mans || []);
        if (c['nes'] && c['nes'].length > 0) setSelectedCore(c['nes'][0].id);
    };

    const handleCreate = async () => {
        if (!newSysId || !newSysName) return alert('Veuillez remplir tous les champs');

        // Check Manufacturer
        if (newSysManufacturer && !manufacturers.find(m => m.name === newSysManufacturer)) {
            if (confirm(`Le constructeur "${newSysManufacturer}" n'existe pas. Voulez-vous le créer automatiquement ?`)) {
                await window.electronAPI.addManufacturer(newSysManufacturer, '');
            } else {
                return; // Abort if user declines
            }
        }

        let exts: string[] | null = null;
        if (newSysExtensions.trim()) {
            exts = newSysExtensions.split(',')
                .map(e => e.trim())
                .filter(e => e.length > 0)
                .map(e => e.startsWith('.') ? e : `.${e}`);
        }

        // @ts-ignore
        await window.electronAPI.createSystem(newSysId, newSysName, selectedCore, newSysImage, newSysLogo, newSysManufacturer, exts);

        alert('Système sauvegardé avec succès !');

        // Reload to get new manufacturer list if added
        const mans = await window.electronAPI.getManufacturers();
        setManufacturers(mans || []);

        setNewSysId('');
        setNewSysName('');
        setNewSysImage('');
        setNewSysLogo('');
        setNewSysManufacturer('');
        setNewSysExtensions('');
        loadData();
    };

    const handleDeleteSystem = async () => {
        if (!newSysId) return;
        if (confirm(`⚠️ DANGER ⚠️\n\nVoulez-vous vraiment supprimer définitivement le système "${newSysId}" ainsi que sa configuration ?\n\nLe dossier des ROMs sera renommé en "_DELETED_..." pour sécurité.`)) {
            await window.electronAPI.deleteSystem(newSysId);
            setNewSysId('');
            setNewSysName('');
            setNewSysImage('');
            setNewSysLogo('');
            setNewSysManufacturer('');
            setNewSysExtensions('');
            loadData();
            alert('Système supprimé.');
        }
    };

    const handleApplyPreset = (presetId: string) => {
        const preset = PRESETS.find(p => p.id === presetId);
        if (!preset) return;

        setNewSysId(preset.id);
        setNewSysName(preset.name);
        setNewSysExtensions(preset.extensions);
        setNewSysManufacturer(preset.manufacturer); // This will populate the text input, but dropdown might need matching logic if controlled, but here it's an input/select mix? 
        // Wait, manufacturer is a Select in the UI. We need to handle IF preset manufacturer is not in list later?
        // Actually the Select value binds to newSysManufacturer. If the value isn't in options, it might show blank or custom if editable.
        // My Select is standard HTML select. It won't show values not in options.
        // I need to check if I can add it dynamically or if I should change input type.
        // Ideally, if preset manufacturer doesn't exist, I should probably just set the state string. 
        // But the select ONLY shows existing ones. 
        // To fix this: I'll check if preset manufacturer exists in `manufacturers`. If not, I'll temporarily add it to list or just set state (which won't show in select).
        // Better approach: Make the manufacturer field an editable combobox or add "Autre/Nouveau" option.
        // For now, let's just set the state. If it matches an option, it selects it. If not, it might look empty.

        // Let's optimize: When applying preset, if manufacturer missing, maybe alert user? Na, too intrusive.
        // Let's just set it.

        // Update core selection based on preset
        if (cores[preset.coreType] && cores[preset.coreType].length > 0) {
            setSelectedCoreType(preset.coreType);
            setSelectedCore(cores[preset.coreType][0].id);
        } else if (preset.coreType) {
            setSelectedCoreType(preset.coreType);
            setSelectedCore('');
        }
    };

    const handleSelectSystem = (sys: any) => {
        setNewSysId(sys.id);
        setNewSysName(sys.name);
        setNewSysImage(sys.image || '');
        setNewSysLogo(sys.logo || '');
        setNewSysManufacturer(sys.manufacturer || '');

        if (sys.extensions && Array.isArray(sys.extensions)) {
            setNewSysExtensions(sys.extensions.join(', '));
        } else {
            setNewSysExtensions('');
        }

        if (sys.core) {
            setSelectedCore(sys.core);
            let foundCoreType = '';
            for (const type in cores) {
                if (cores[type].some(c => c.id === sys.core)) {
                    foundCoreType = type;
                    break;
                }
            }
            if (foundCoreType) {
                setSelectedCoreType(foundCoreType);
            } else {
                setSelectedCoreType(Object.keys(cores)[0] || 'nes');
            }
        } else {
            setSelectedCore('');
            setSelectedCoreType(Object.keys(cores)[0] || 'nes');
        }
    };

    const handleAutoImage = async () => {
        if (!newSysName) return alert('Entrez un nom de système d\'abord !');
        try {
            const query = `${newSysName} console retro neon`;
            const img = await window.electronAPI.searchPexelsImage(query);
            if (img && img.src) setNewSysImage(img.src.large);
            else alert('Aucune image trouvée. Vérifiez votre clé API Pexels dans Admin > Mode Kiosk.');
        } catch (e) {
            alert('Erreur Pexels. Avez-vous configuré la Clé API dans Admin > Mode Kiosk ?');
        }
    };

    const handleAutoLogo = async () => {
        if (!newSysName) return alert('Entrez un nom de système d\'abord !');
        try {
            const query = `${newSysName} console isolated gaming machine`;
            const img = await window.electronAPI.searchPexelsImage(query);
            if (img && img.src) setNewSysLogo(img.src.large);
            else alert('Aucun logo trouvé. Vérifiez votre clé API Pexels dans Admin > Mode Kiosk.');
        } catch (e) {
            alert('Erreur Pexels. Avez-vous configuré la Clé API dans Admin > Mode Kiosk ?');
        }
    };

    return (
        <div style={{ padding: '10px', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', height: '100%' }}>

                {/* LEFT: EDITOR FORM */}
                <div style={{ overflowY: 'auto', paddingRight: '10px' }}>

                    <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '30px',
                        borderRadius: '20px',
                        border: '1px solid var(--glass-border)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                            <div style={{
                                width: '50px', height: '50px',
                                background: 'linear-gradient(135deg, var(--accent-color), #a06cd5)',
                                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 20px rgba(255,45,85,0.3)'
                            }}>
                                <Gamepad2 size={24} color="white" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4em' }}>
                                    {newSysId && systems.find(s => s.id === newSysId) ? 'Modifier le Système' : 'Nouveau Système'}
                                </h3>
                                <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '0.9em' }}>
                                    Configurez les détails, extensions et médias.
                                </p>
                            </div>
                            {newSysId && (
                                <button
                                    onClick={() => { setNewSysId(''); setNewSysName(''); setNewSysImage(''); setSelectedCore(''); setSelectedCoreType(Object.keys(cores)[0] || 'nes'); setNewSysExtensions(''); }}
                                    style={{ marginLeft: 'auto', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', border: 'none', cursor: 'pointer', color: '#aaa' }}
                                    title="Réinitialiser"
                                >
                                    <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
                                </button>
                            )}
                        </div>

                        {/* PRESET SELECTOR */}
                        {!systems.find(s => s.id === newSysId) && (
                            <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.3)', borderRadius: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9em', color: '#60a5fa' }}>⚡ Pré-configuration Rapide</label>
                                <select
                                    onChange={(e) => handleApplyPreset(e.target.value)}
                                    defaultValue=""
                                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(37, 99, 235, 0.3)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    <option value="" disabled>-- Choisir un modèle de console --</option>
                                    {PRESETS.map(p => {
                                        // Check installation status
                                        const sysCores = cores[p.coreType] || [];
                                        const isInstalled = sysCores.length > 0 && sysCores.some(c => c.installed);
                                        const warn = !isInstalled ? '⚠️ (Non Installé)' : '';

                                        return (
                                            <option key={p.id} value={p.id} style={{ color: !isInstalled ? '#ffaa00' : 'white' }}>
                                                {p.name} {warn}
                                            </option>
                                        );
                                    })}
                                </select>
                                <div style={{ marginTop: '5px', fontSize: '0.75em', color: '#aaa' }}>
                                    ⚠️ Les consoles marquées "Non Installé" nécessitent d'installer le pack Core dans Config.
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9em', color: '#ccc' }}>ID Unique (Dossier)</label>
                                <input
                                    type="text"
                                    value={newSysId}
                                    onChange={e => setNewSysId(e.target.value.replace(/[^a-z0-9_-]/gi, ''))}
                                    placeholder="ex: snes"
                                    style={{
                                        width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px',
                                        outline: 'none', fontFamily: 'monospace'
                                    }}
                                    disabled={!!systems.find(s => s.id === newSysId)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9em', color: '#ccc' }}>Nom Affiché</label>
                                <input
                                    type="text"
                                    value={newSysName}
                                    onChange={e => setNewSysName(e.target.value)}
                                    placeholder="ex: Super Nintendo"
                                    style={{
                                        width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* EXTENSIONS FIELD */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9em', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileCog size={16} /> Extensions Autorisées
                            </label>
                            <input
                                type="text"
                                value={newSysExtensions}
                                onChange={e => setNewSysExtensions(e.target.value)}
                                placeholder="ex: .nes, .zip, .7z (Laisser vide pour défaut)"
                                style={{
                                    width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                    outline: 'none', fontFamily: 'monospace', color: '#a0aec0'
                                }}
                            />
                            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.8em' }}>Séparez par des virgules. Si vide, les extensions par défaut de l'émulateur seront utilisées.</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9em', color: '#ccc' }}>Constructeur</label>

                            {/* Allow editing manufacturer manually if not in list */}
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    list="manufacturer-list"
                                    value={newSysManufacturer}
                                    onChange={e => setNewSysManufacturer(e.target.value)}
                                    placeholder="Sélectionner ou saisir..."
                                    style={{
                                        width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px',
                                        outline: 'none'
                                    }}
                                />
                                <datalist id="manufacturer-list">
                                    {manufacturers.map(m => (
                                        <option key={m.id} value={m.name} />
                                    ))}
                                </datalist>
                            </div>
                            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.8em' }}>Si le constructeur n'existe pas, il sera créé à la sauvegarde.</p>
                        </div>

                        {/* MEDIA SECTION */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <ImageIcon size={14} style={{ display: 'inline', marginRight: '8px' }} />Médias & Visuels
                            </label>

                            {/* Background Image */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85em', color: '#aaa' }}>Fond d'écran (Background)</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={newSysImage}
                                        onChange={e => setNewSysImage(e.target.value)}
                                        placeholder="URL de l'image..."
                                        style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid #444', color: '#ddd', borderRadius: '6px' }}
                                    />
                                    <button
                                        onClick={handleAutoImage}
                                        style={{ padding: '8px 15px', background: 'purple', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                        title="Pexels Magic"
                                    >
                                        <Wand2 size={16} />
                                    </button>
                                </div>
                                {newSysImage && (
                                    <div style={{ marginTop: '10px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #444', position: 'relative' }}>
                                        <img src={newSysImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onClick={() => setPreviewImage(newSysImage)} />
                                    </div>
                                )}
                            </div>

                            {/* Logo Image */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85em', color: '#aaa' }}>Logo / Console (PNG)</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={newSysLogo}
                                        onChange={e => setNewSysLogo(e.target.value)}
                                        placeholder="URL du logo..."
                                        style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid #444', color: '#ddd', borderRadius: '6px' }}
                                    />
                                    <button
                                        onClick={handleAutoLogo}
                                        style={{ padding: '8px 15px', background: '#0984e3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                        title="Pexels Magic"
                                    >
                                        <Wand2 size={16} />
                                    </button>
                                </div>
                                {newSysLogo && (
                                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px dashed #555' }}>
                                        <img src={newSysLogo} style={{ maxHeight: '60px', objectFit: 'contain' }} onClick={() => setPreviewImage(newSysLogo)} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CORE SELECTION */}
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <RefreshCw size={14} style={{ display: 'inline', marginRight: '8px' }} />Configuration Émulateur
                            </label>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85em', color: '#aaa' }}>Famille</label>
                                    <select
                                        value={selectedCoreType}
                                        onChange={e => {
                                            setSelectedCoreType(e.target.value);
                                            if (cores[e.target.value]) setSelectedCore(cores[e.target.value][0].id);
                                        }}
                                        style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '6px' }}
                                    >
                                        {Object.keys(cores).map(k => <option key={k} value={k}>{k.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85em', color: '#aaa' }}>Core Libretro</label>
                                    <select
                                        value={selectedCore}
                                        onChange={e => setSelectedCore(e.target.value)}
                                        style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '6px' }}
                                    >
                                        {cores[selectedCoreType]?.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} {c.installed ? '✅' : '(Non Installé)'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleCreate}
                                style={{
                                    flex: 1, padding: '15px',
                                    background: 'linear-gradient(90deg, var(--accent-color), #ff4757)',
                                    color: 'white', border: 'none', borderRadius: '10px',
                                    cursor: 'pointer', fontWeight: 'bold', fontSize: '1em',
                                    boxShadow: '0 4px 15px rgba(255, 45, 85, 0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                }}
                            >
                                <Save size={20} />
                                {systems.find(s => s.id === newSysId) ? 'ENREGISTRER' : 'CRÉER LE SYSTÈME'}
                            </button>

                            {/* DELETE BUTTON */}
                            {newSysId && systems.find(s => s.id === newSysId) && (
                                <button
                                    onClick={handleDeleteSystem}
                                    style={{
                                        padding: '15px',
                                        background: 'linear-gradient(90deg, #e74c3c, #c0392b)',
                                        color: 'white', border: 'none', borderRadius: '10px',
                                        cursor: 'pointer', fontWeight: 'bold', fontSize: '1em',
                                        boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                    title="Supprimer définitivement"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>

                    </div>

                    {/* DANGER ZONE FOR EXISTING SYSTEMS */}
                    {newSysId && systems.find(s => s.id === newSysId) && (
                        <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ marginTop: 0, fontSize: '0.9em', color: '#888', textTransform: 'uppercase', marginBottom: '15px' }}>Outils de Maintenance</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <button
                                    onClick={async () => {
                                        const res = await window.electronAPI.scanSystem(newSysId);
                                        alert(`${res.added} nouveaux jeux ajoutés !`);
                                    }}
                                    style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <Scan size={16} /> Scanner Roms
                                </button>
                                <button
                                    onClick={async () => {
                                        const res = await window.electronAPI.importGamelist(newSysId);
                                        if (res.success) alert(`Succès : ${res.updated} jeux mis à jour !`);
                                        else alert(`Erreur : ${res.error}`);
                                    }}
                                    style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', color: '#4dbdff', border: '1px solid rgba(77, 189, 255, 0.3)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <FileJson size={16} /> Importer XML
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm(`Voulez-vous vraiment vider la liste des jeux pour ${newSysId} ?`)) {
                                            await window.electronAPI.resetSystem(newSysId);
                                            alert('Système réinitialisé.');
                                        }
                                    }}
                                    style={{ gridColumn: 'span 2', padding: '12px', background: 'rgba(255, 51, 85, 0.1)', color: '#ff3355', border: '1px solid rgba(255, 51, 85, 0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <Trash2 size={16} /> Réinitialiser la Base de Jeux
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* RIGHT: LIST OF SYSTEMS */}
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Vos Systèmes ({systems.length})</h4>
                        <List size={18} color="#666" />
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                        {systems.map(s => (
                            <motion.div
                                key={s.id}
                                onClick={() => handleSelectSystem(s)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    padding: '15px',
                                    background: s.id === newSysId ? 'linear-gradient(90deg, rgba(255, 45, 85, 0.2), transparent)' : 'rgba(255,255,255,0.03)',
                                    borderRadius: '10px',
                                    marginBottom: '10px',
                                    borderLeft: `3px solid ${s.id === newSysId ? 'var(--accent-color)' : 'transparent'}`,
                                    border: s.id === newSysId ? '1px solid rgba(255, 45, 85, 0.3)' : '1px solid transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px'
                                }}
                            >
                                <div style={{
                                    width: '30px', height: '30px',
                                    background: '#222',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {s.logo ? <img src={s.logo} style={{ width: '80%', height: '80%', objectFit: 'contain' }} /> : <Gamepad2 size={14} color="#666" />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.95em', color: s.id === newSysId ? 'white' : '#ddd' }}>{s.name}</div>
                                    <div style={{ fontSize: '0.75em', color: '#666' }}>{s.id} • {s.core || 'Auto'}</div>
                                </div>
                            </motion.div>
                        ))}
                        {systems.length === 0 && (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                                <Gamepad2 size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p>Aucun système configuré.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PREVIEW MODAL */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewImage(null)}
                        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, cursor: 'zoom-out', backdropFilter: 'blur(5px)' }}
                    >
                        <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            src={previewImage}
                            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
                        />
                        <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', zIndex: 100000 }}><X size={20} color="black" /></button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
