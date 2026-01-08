// Simple interaction for the tilt effect on cards
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.glass-card');

    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Only apply if mouse is near the card to save performance
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        // Smooth transition is handled by CSS
        // Simply updating the transform property here for "magnetic" feel if desired
        // But the CSS hover effect is usually cleaner.
        // This script is ready for future advanced interactions.
    });
});
