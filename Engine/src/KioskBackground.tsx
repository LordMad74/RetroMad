import React from 'react';
import { motion } from 'framer-motion';

type EffectType = 'stars' | 'nebula' | 'grid' | 'particles' | 'hexagons' | 'none';

interface KioskBackgroundProps {
    effect: EffectType;
}

export default function KioskBackground({ effect }: KioskBackgroundProps) {

    // --- EFFECT: STARS (WARP SPEED) ---
    if (effect === 'stars') {
        return (
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', background: 'transparent', perspective: '500px' }}>
                <div id="stars"></div>
                <div id="stars2"></div>
                <div id="stars3"></div>
                <style>{`
                    #stars, #stars2, #stars3 {
                        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                        background: transparent;
                    }
                    #stars { width: 2px; height: 2px; border-radius: 50%; box-shadow: ${generateBoxShadow(400, 1)}; animation: animStar 40s linear infinite; opacity: 0.8; }
                    #stars2 { width: 3px; height: 3px; border-radius: 50%; box-shadow: ${generateBoxShadow(150, 2)}; animation: animStar 80s linear infinite; opacity: 0.6; }
                    #stars3 { width: 4px; height: 4px; border-radius: 50%; box-shadow: ${generateBoxShadow(50, 3)}; animation: animStar 120s linear infinite; opacity: 0.8; }

                    @keyframes animStar {
                        from { transform: translateY(0px) rotate(0deg); }
                        to { transform: translateY(-2000px) rotate(5deg); }
                    }
                `}</style>
            </div>
        );
    }

    // --- EFFECT: NEBULA (SMOKE) ---
    if (effect === 'nebula') {
        return (
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', background: '#1a0022' }}>
                <div className="fog-container">
                    <div className="fog-img fog-img-first" />
                    <div className="fog-img fog-img-second" />
                </div>
                <style>{`
                    .fog-container {
                        position: absolute; width: 100%; height: 100%; overflow: hidden;
                    }
                    .fog-img {
                        position: absolute; height: 100vh; width: 300vw;
                        background: url('https://raw.githubusercontent.com/danielstuart14/CSS_FOG_ANIMATION/master/fog1.png') repeat-x;
                        background-size: contain;
                        animation: fog 60s linear infinite;
                    }
                    .fog-img-second {
                        background: url('https://raw.githubusercontent.com/danielstuart14/CSS_FOG_ANIMATION/master/fog2.png') repeat-x;
                        background-size: contain;
                        animation: fog 40s linear infinite;
                        margin-left: -200px;
                        opacity: 0.5;
                    }
                    @keyframes fog {
                        0% { transform: translate3d(0, 0, 0); }
                        100% { transform: translate3d(-200vw, 0, 0); }
                    }
                `}</style>
            </div>
        );
    }

    // --- EFFECT: RETRO GRID ---
    if (effect === 'grid') {
        return (
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', background: 'transparent', perspective: '1000px' }}>
                <div className="retro-sun" />
                <div className="retro-grid" />
                <style>{`
                    .retro-sun {
                        position: absolute;
                        bottom: 35%; /* Raise sun slightly */
                        left: 50%;
                        transform: translateX(-50%);
                        width: 40vh;
                        height: 40vh;
                        background: linear-gradient(to bottom, #fcff00 0%, #ff005d 100%);
                        border-radius: 50%;
                        box-shadow: 0 0 60px #ff005d;
                        opacity: 0.4;
                    }
                    .retro-grid {
                        position: absolute;
                        top: 50%; /* Horizon line */
                        left: -100%; /* Wide enough to not see edges when rotating */
                        width: 300%;
                        height: 200%;
                        background-image: 
                            linear-gradient(rgba(255, 0, 255, 0.7) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(255, 0, 255, 0.7) 1px, transparent 1px);
                        background-size: 60px 60px;
                        transform: rotateX(75deg);
                        transform-origin: top center;
                        animation: gridMove 3s infinite linear;
                        opacity: 0.6;
                        /* Fade out towards horizon (top of the grid element) */
                        mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 100%);
                    }
                    @keyframes gridMove {
                        0% { background-position: 0px 0px; }
                        100% { background-position: 0px 60px; }
                    }
                `}</style>
            </div>
        );
    }

    // --- EFFECT: HEXAGONS (CYBER HIVE) ---
    if (effect === 'hexagons') {
        return (
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', background: 'transparent' }}>
                <div className="hex-layer" />
                <style>{`
                    .hex-layer {
                        position: absolute;
                        top: -50%; left: -50%;
                        width: 200%; height: 200%;
                        background-image: 
                            radial-gradient(circle, transparent 20%, #000 120%),
                            linear-gradient(30deg, #445 12%, transparent 12.5%, transparent 87%, #445 87.5%, #445),
                            linear-gradient(150deg, #445 12%, transparent 12.5%, transparent 87%, #445 87.5%, #445),
                            linear-gradient(30deg, #445 12%, transparent 12.5%, transparent 87%, #445 87.5%, #445),
                            linear-gradient(150deg, #445 12%, transparent 12.5%, transparent 87%, #445 87.5%, #445);
                        background-size: 80px 140px;
                        background-position: 0 0, 0 0, 40px 70px, 40px 70px, 0 0;
                        opacity: 0.15;
                        transform: perspective(500px) rotateX(45deg);
                        animation: hexScroll 10s linear infinite;
                        mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
                    }
                    @keyframes hexScroll {
                        0% { background-position: 0 0, 0 0, 40px 70px, 40px 70px, 0 0; }
                        100% { background-position: 0 140px, 0 140px, 40px 210px, 40px 210px, 0 140px; }
                    }
                `}</style>
            </div>
        );
    }

    // --- EFFECT: ZEN PARTICLES ---
    if (effect === 'particles') {
        return (
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', background: 'transparent' }}>
                <div id="particles1"></div>
                <div id="particles2"></div>
                <style>{`
                    #particles1, #particles2 {
                        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                        background: transparent;
                        border-radius: 50%;
                    }
                    #particles1 { 
                        box-shadow: ${generateBoxShadow(50, 2)};
                        animation: floatUp 30s linear infinite;
                        opacity: 0.6;
                        color: rgba(255, 255, 255, 0.8);
                    }
                    #particles2 { 
                        box-shadow: ${generateBoxShadow(20, 5)};
                        animation: floatUp 45s linear infinite;
                        opacity: 0.3;
                        filter: blur(3px);
                        color: rgba(200, 200, 255, 0.5);
                    }
                    @keyframes floatUp {
                        from { transform: translateY(100vh) rotate(0deg); }
                        to { transform: translateY(-100vh) rotate(50deg); }
                    }
                `}</style>
            </div>
        );
    }

    return null;
}

// Helper to generate star fields
function generateBoxShadow(n: number, size: number) {
    let value = `${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
    for (let i = 2; i <= n; i++) {
        value += `, ${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
    }
    return value;
}
