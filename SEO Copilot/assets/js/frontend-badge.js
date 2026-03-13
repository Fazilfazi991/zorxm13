document.addEventListener('DOMContentLoaded', function() {
    // Animate card bar fill
    const barFill = document.querySelector('.sc-badge-bar-fill');
    if (barFill) {
        const score = parseInt(barFill.dataset.score || 0);
        setTimeout(() => {
            barFill.style.width = score + '%';
        }, 600);
        
        // Color based on score
        if (score >= 80) {
            barFill.style.background = '#10B981';
        } else if (score >= 50) {
            barFill.style.background = '#F59E0B';
        } else {
            barFill.style.background = '#EF4444';
        }
    }

    // Animate SVG ring for icon style
    const ringFill = document.querySelector('.ring-fill');
    if (ringFill) {
        const score = parseInt(ringFill.dataset.score || 0);
        const circumference = 126;
        const offset = circumference - (score / 100 * circumference);
        setTimeout(() => {
            ringFill.style.strokeDashoffset = offset;
        }, 600);
    }
});
