import { useEffect, useRef, useCallback } from 'react';

/**
 * Interface définissant l'état des boutons de la manette.
 */
interface GamepadState {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    a: boolean; // Confirmer
    b: boolean; // Retour
    x: boolean;
    y: boolean; // Options / Menu
    start: boolean; // Select / Launch
    select: boolean;
}

/**
 * Configuration des callbacks pour les événements manette.
 */
interface GamepadHandlers {
    onUp?: () => void;
    onDown?: () => void;
    onLeft?: () => void;
    onRight?: () => void;
    onConfirm?: () => void; // Bouton A / Croix
    onBack?: () => void;    // Bouton B / Cercle
    onMenu?: () => void;    // Bouton Y / Triangle
    onStart?: () => void;   // Start
}

/**
 * Hook personnalisé pour gérer la navigation via Gamepad.
 * Optimisé pour ne pas provoquer de re-rendus excessifs (Polling Loop).
 * 
 * @param handlers - Fonctions à exécuter lors des pressions
 * @param threshold - Seuil pour les sticks analogiques (Deadzone)
 * @param delay - Délai en ms entre deux répétitions (Anti-rebond)
 */
export const useGamepad = (
    handlers: GamepadHandlers,
    threshold: number = 0.5,
    delay: number = 200
) => {
    // Stockage de l'état précédent pour gérer l'appui long vs appui unique
    const lastPressTime = useRef<number>(0);
    const requestRef = useRef<number>();

    // Maintien des références aux handlers pour éviter de casser la loop si le composant parent re-render
    const handlersRef = useRef(handlers);

    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    const scanGamepad = useCallback(() => {
        const gamepads = navigator.getGamepads();
        if (!gamepads || !gamepads[0]) {
            requestRef.current = requestAnimationFrame(scanGamepad);
            return;
        }

        const gp = gamepads[0]; // On prend la manette principale (Joueur 1)
        const now = Date.now();

        // Si le délai depuis la dernière action est trop court, on attend
        if (now - lastPressTime.current < delay) {
            requestRef.current = requestAnimationFrame(scanGamepad);
            return;
        }

        // --- Détection des Inputs ---
        // Axes (Stick Gauche ou D-Pad sur certaines manettes)
        const axisX = gp.axes[0];
        const axisY = gp.axes[1];

        // Boutons (Standard Mapping)
        // 0: A (Sud), 1: B (Est), 2: X (Ouest), 3: Y (Nord)
        // 12: D-Pad Haut, 13: D-Pad Bas, 14: D-Pad Gauche, 15: D-Pad Droite
        // 9: Start, 8: Select

        let actionTriggered = false;

        // Navigation HAUT
        if (axisY < -threshold || gp.buttons[12]?.pressed) {
            if (handlersRef.current.onUp) { handlersRef.current.onUp(); actionTriggered = true; }
        }
        // Navigation BAS
        else if (axisY > threshold || gp.buttons[13]?.pressed) {
            if (handlersRef.current.onDown) { handlersRef.current.onDown(); actionTriggered = true; }
        }
        // Navigation GAUCHE
        else if (axisX < -threshold || gp.buttons[14]?.pressed) {
            if (handlersRef.current.onLeft) { handlersRef.current.onLeft(); actionTriggered = true; }
        }
        // Navigation DROITE
        else if (axisX > threshold || gp.buttons[15]?.pressed) {
            if (handlersRef.current.onRight) { handlersRef.current.onRight(); actionTriggered = true; }
        }
        // Validation (A / Croix)
        else if (gp.buttons[0]?.pressed) {
            if (handlersRef.current.onConfirm) { handlersRef.current.onConfirm(); actionTriggered = true; }
        }
        // Retour (B / Cercle)
        else if (gp.buttons[1]?.pressed) {
            if (handlersRef.current.onBack) { handlersRef.current.onBack(); actionTriggered = true; }
        }
        // Menu (Y / Triangle)
        else if (gp.buttons[3]?.pressed) {
            if (handlersRef.current.onMenu) { handlersRef.current.onMenu(); actionTriggered = true; }
        }
        // Start
        else if (gp.buttons[9]?.pressed) {
            if (handlersRef.current.onStart) { handlersRef.current.onStart(); actionTriggered = true; }
        }

        if (actionTriggered) {
            lastPressTime.current = now;
        }

        requestRef.current = requestAnimationFrame(scanGamepad);
    }, [threshold, delay]); // Dépendances minimales

    useEffect(() => {
        // Démarrage de la boucle
        requestRef.current = requestAnimationFrame(scanGamepad);

        // Nettoyage lors du démontage du composant
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [scanGamepad]);
};
