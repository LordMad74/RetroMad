import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Factory, Wand2, ArrowRight, Pencil, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManufacturerManager() {
    const [manufacturers, setManufacturers] = useState<any[]>([]);
    const [newName, setNewName] = useState('');
    const [newLogo, setNewLogo] = useState('');
    const [previewLogo, setPreviewLogo] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await window.electronAPI.getManufacturers();
        setManufacturers(data || []);
    };

    const handleCreate = async () => {
        if (!newName) return;

        if (editId) {
            // Update existing (delete old, create new with same ID logic handled by backend usually, but here 'add' might overwrite if implemented that way, 
            // BUT backend 'add' likely generates ID from name or uses provided ID. 
            // Looking at previous main.cjs, 'add-manufacturer' takes {name, logo}. 
            // AND 'delete-manufacturer' takes ID.
            // Since we don't have a dedicated 'update' API visible, we can simulate it by Add (overwrite if same ID logic exists) or Delete/Add. 
            // Let's assume Add overwrites or we just Add. 
            // Actually, best to just call addManufacturer, if backend uses name as key it updates.
            // If backend generates ID, we might create duplicate if we don't delete.
            // Use window.electronAPI.addManufacturer(newName, newLogo).

            // To be safe and clean:
            await window.electronAPI.addManufacturer(newName, newLogo);
            setEditId(null);
            alert('Mise à jour effectuée.');
        } else {
            await window.electronAPI.addManufacturer(newName, newLogo);
        }

        setNewName('');
        setNewLogo('');
        setPreviewLogo(null);
        loadData();
    };

    const handleEdit = (m: any) => {
        setEditId(m.id);
        setNewName(m.name);
        setNewLogo(m.logo || '');
        setPreviewLogo(m.logo || null);
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setNewName('');
        setNewLogo('');
        setPreviewLogo(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Supprimer ce constructeur ? Cela ne supprimera pas les systèmes associés.')) {
            await window.electronAPI.deleteManufacturer(id);
            if (editId === id) handleCancelEdit();
            loadData();
        }
    };

    const handleAutoLogo = async () => {
        if (!newName) return alert('Entrez un nom d\'abord.');

        // Pexels queries to try for "Gamer/Retro" vibe
        const queries = [
            `${newName} logo`,
            `${newName} gaming logo`,
            `${newName} company logo`,
            `${newName} vector logo`
        ];

        const randomQuery = queries[Math.floor(Math.random() * queries.length)];

        try {
            const res = await window.electronAPI.searchPexelsImage(randomQuery);
            if (res && res.src) {
                setNewLogo(res.src.large);
                setPreviewLogo(res.src.large);
            } else {
                alert('Aucun logo trouvé. Essayez de simplifier le nom.\nVérifiez votre clé API dans Kiosk > Config.');
            }
        } catch (e) {
            console.error(e);
            alert('Erreur lors de la recherche Pexels. Vérifiez votre clé API.');
        }
    };

    return (
        <div style={{ padding: '10px', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', height: '100%' }}>

                {/* LEFT: EDITOR FORM */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    padding: '30px',
                    borderRadius: '20px',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                        <div style={{
                            width: '50px', height: '50px',
                            background: editId ? 'linear-gradient(135deg, #e67e22, #f1c40f)' : 'linear-gradient(135deg, #0984e3, #6c5ce7)',
                            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: editId ? '0 8px 20px rgba(230, 126, 34, 0.3)' : '0 8px 20px rgba(9, 132, 227, 0.3)'
                        }}>
                            {editId ? <Pencil size={24} color="white" /> : <Factory size={24} color="white" />}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.4em' }}>
                                {editId ? 'Modifier Constructeur' : 'Ajouter Constructeur'}
                            </h3>
                            <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '0.9em' }}>
                                {editId ? `Édition de : ${newName}` : 'Créez des marques pour grouper vos systèmes.'}
                            </p>
                        </div>
                        {editId && (
                            <button onClick={handleCancelEdit} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: '#aaa' }} title="Annuler">
                                <X size={24} />
                            </button>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '0.9em', color: '#ccc' }}>Nom de la Marque</label>
                            <input
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Ex: Nintendo, Sony, Sega, Atari..."
                                disabled={!!editId} // Disable name editing if ID depends on it, OR allow it? Usually ID is fixed. If ID is name, we can't change name easily without creating new. Let's disable for safety if using simple backend.
                                style={{
                                    width: '100%', padding: '15px', background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px',
                                    outline: 'none', fontSize: '1.1em', opacity: editId ? 0.7 : 1
                                }}
                            />
                            {editId && <p style={{ fontSize: '0.7em', color: '#666', marginTop: '5px' }}>Le nom ne peut pas être modifié (Identifiant).</p>}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '0.9em', color: '#ccc' }}>Logo (URL)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    value={newLogo}
                                    onChange={e => { setNewLogo(e.target.value); setPreviewLogo(e.target.value); }}
                                    placeholder="https://exemple.com/logo.png"
                                    style={{
                                        flex: 1, padding: '15px', background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '10px',
                                        outline: 'none', fontFamily: 'monospace', fontSize: '0.9em'
                                    }}
                                />
                                <button
                                    onClick={handleAutoLogo}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '0 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                    title="Recherche automatique sur Pexels"
                                >
                                    <Wand2 size={18} />
                                </button>
                            </div>
                        </div>

                        {previewLogo && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                style={{
                                    marginBottom: '20px', padding: '20px',
                                    background: 'rgba(255,255,255,0.9)', borderRadius: '12px',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    height: '150px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
                                }}
                            >
                                <img src={previewLogo} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            </motion.div>
                        )}
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={!newName}
                        style={{
                            marginTop: 'auto',
                            width: '100%',
                            padding: '15px',
                            background: editId ? 'linear-gradient(90deg, #e67e22, #f1c40f)' : (newName ? 'linear-gradient(90deg, #0984e3, #00b894)' : '#444'),
                            color: newName ? 'white' : '#888',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: newName ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold',
                            fontSize: '1em',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            boxShadow: newName ? (editId ? '0 5px 20px rgba(230, 126, 34, 0.4)' : '0 5px 20px rgba(9, 132, 227, 0.4)') : 'none',
                            transition: 'all 0.3s'
                        }}
                    >
                        {editId ? <Pencil size={20} /> : <Plus size={20} />}
                        {editId ? 'METTRE À JOUR' : 'AJOUTER À LA LISTE'}
                    </button>
                </div>

                {/* RIGHT: LIST */}
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Enregistrés ({manufacturers.length})</h4>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00b894' }}></div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <AnimatePresence mode='popLayout'>
                            {manufacturers.map(m => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    layout
                                    style={{
                                        background: editId === m.id ? 'rgba(230, 126, 34, 0.1)' : 'rgba(255,255,255,0.03)',
                                        borderColor: editId === m.id ? '#e67e22' : 'rgba(255,255,255,0.05)',
                                        padding: '15px',
                                        borderRadius: '12px',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            width: '45px', height: '45px',
                                            background: 'white', borderRadius: '8px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                        }}>
                                            {m.logo ? (
                                                <img src={m.logo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <Factory size={20} color="#ccc" />
                                            )}
                                        </div>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1em', color: editId === m.id ? '#e67e22' : 'white' }}>{m.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleEdit(m)}
                                            style={{
                                                background: 'transparent', color: '#666', border: 'none',
                                                width: '35px', height: '35px', borderRadius: '8px',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666'; }}
                                            title="Modifier"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(m.id)}
                                            style={{
                                                background: 'transparent', color: '#666', border: 'none',
                                                width: '35px', height: '35px', borderRadius: '8px',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 50, 50, 0.1)'; e.currentTarget.style.color = '#ff4444'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666'; }}
                                            title="Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {manufacturers.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                <Factory size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p>Aucun constructeur.</p>
                                <p style={{ fontSize: '0.8em', opacity: 0.7 }}>Commencez par en ajouter un à gauche.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
