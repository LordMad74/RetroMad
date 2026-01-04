const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

// SET CANVAS SIZE
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// MATRIX CONFIG
const chars = '01010110KATAKANAABCEFHIJKLMNOPQRSTUVWXYZ'; // Ajout caractères style Matrix
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];

// INITIALIZE DROPS
for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

function draw() {
    // BLACK BG WITH OPACITY FADE
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0F0'; // GREEN TEXT
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));

        // Random white glitch
        if (Math.random() > 0.98) ctx.fillStyle = '#FFF';
        else ctx.fillStyle = '#0F0';

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(draw, 33);

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
