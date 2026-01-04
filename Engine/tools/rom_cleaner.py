import os
import re
import argparse
import sys
from pathlib import Path

# Force UTF-8 output for Windows consoles/pipes to handle emojis and special chars
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        # Python versions < 3.7 might not have reconfigure
        pass

"""
RetroMad ROM Cleaner
--------------------
Nettoie les noms de fichiers ROMs en supprimant les tags inutiles.
Ex: "Super Mario World (USA) [!].sfc" -> "Super Mario World.sfc"
"""

def clean_filename(filename):
    # Extension preservation
    name, ext = os.path.splitext(filename)
    
    # Patterns to remove
    patterns = [
        r'\s*\(.*?\)',          # Remove content in parenthesis e.g. (USA), (En,Fr,De)
        r'\s*\[.*?\]',          # Remove content in brackets e.g. [!]
        r'\s*v\d+(\.\d+)*',     # Remove version numbers e.g. v1.0
        r'\s*Rev\s*\w+',        # Remove revisions e.g. Rev A
        r'\s*Beta\s*\d*',       # Remove Beta tags
        r'\s*Proto\s*\d*',      # Remove Proto tags
        r'\s*Demo',             # Remove Demo tags
        r'\s*Sample',           # Remove Sample tags
    ]
    
    clean_name = name
    for pattern in patterns:
        clean_name = re.sub(pattern, '', clean_name, flags=re.IGNORECASE)
    
    # Clean up whitespace
    clean_name = clean_name.strip()
    
    # Remove multiple spaces
    clean_name = re.sub(r'\s+', ' ', clean_name)
    
    return clean_name + ext

def process_directory(directory, allowed_extensions=None, execute=False):
    print(f"\U0001f50d Analyse de : {directory}")
    
    changes_count = 0
    p = Path(directory)
    
    if not p.exists():
        print(f"❌ Répertoire introuvable : {directory}")
        return

    # Recursive walk
    for file_path in p.rglob('*'):
        if file_path.is_file():
            # Check extension if provided
            if allowed_extensions and file_path.suffix.lower() not in allowed_extensions:
                continue
                
            original_name = file_path.name
            new_name = clean_filename(original_name)
            
            if new_name != original_name:
                parent = file_path.parent
                new_path = parent / new_name
                
                # Check for collision
                if new_path.exists():
                    print(f"⚠️  Conflit ignoré : {original_name} -> {new_name} (Le fichier existe déjà)")
                    continue
                
                prefix = "📝 [SIMULATION]" if not execute else "✅ [RENOMMÉ]"
                print(f"{prefix} {original_name}  -->  {new_name}")
                
                if execute:
                    try:
                        file_path.rename(new_path)
                        changes_count += 1
                    except Exception as e:
                        print(f"❌ Erreur lors du renommage de {original_name}: {e}")
                else:
                    changes_count += 1

    if changes_count == 0:
        print("✨ Aucun fichier à nettoyer trouvé.")
    else:
        action = "renommés" if execute else "identifiés pour renommage"
        print(f"--- Bilan : {changes_count} fichiers {action} ---")

def main():
    parser = argparse.ArgumentParser(description="Nettoyeur de ROMs RetroMad")
    parser.add_argument("directory", help="Dossier à scanner")
    parser.add_argument("--force", action="store_true", help="Appliquer les changements (Mode écriture)")
    
    args = parser.parse_args()
    
    # Common ROM extensions to safety filter (optional, currently scanning all files)
    # ext_list = ['.zip', '.7z', '.iso', '.bin', '.cue', '.nes', '.sfc', '.smc', '.md', '.gba', '.gbc', '.gb', '.pce']
    ext_list = None 

    process_directory(args.directory, ext_list, args.force)

if __name__ == "__main__":
    main()
