const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const chars = '01010101ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"\'#&_(),.;:?!\\|{}<>[]^~';
const fontSize = 16;
const columns = Math.floor(canvas.width / fontSize);
const drops = [];

for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100; // Random starting positions for more natural rain
}

function draw() {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + 'px "Share Tech Mono"';

    for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));

        // Dynamic coloring
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head of the drop is white
        if (Math.random() > 0.98) {
            ctx.fillStyle = '#fff';
        } else {
            ctx.fillStyle = '#00ff41';
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

let lastTime = 0;
const fps = 30;
const interval = 1000 / fps;

function animate(timestamp) {
    if (timestamp - lastTime > interval) {
        draw();
        lastTime = timestamp;
    }
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
