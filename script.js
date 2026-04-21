document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    const darkRed = '#6a0dad';
    const black = '#000000';
    const particles = [];
    const waves = [];
    const vortexes = [];
    
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.1,
            angle: Math.random() * Math.PI * 2,
            pulse: Math.random() * 0.05 + 0.02,
            pulseOffset: Math.random() * Math.PI * 2
        });
    }
    for (let i = 0; i < 5; i++) {
        waves.push({
            amplitude: Math.random() * 200 + 50,
            frequency: Math.random() * 0.005 + 0.002,
            speed: Math.random() * 0.001 + 0.0005,
            offset: Math.random() * Math.PI * 2
        });
    }
    for (let i = 0; i < 3; i++) {
        vortexes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 300 + 100,
            speed: Math.random() * 0.001 + 0.0005,
            rotation: Math.random() * 0.001 + 0.0005,
            angle: 0
        });
    }
    function createGradients() {
        const radialGradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0, 
            canvas.width / 2, canvas.height / 2, canvas.width / 2
        );
        radialGradient.addColorStop(0, darkRed);
        radialGradient.addColorStop(1, black);
        return { radial: radialGradient };
    }
    function drawWave(wave, time) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 5) {
            const y = Math.sin((x * wave.frequency) + (time * wave.speed) + wave.offset) * wave.amplitude + canvas.height / 2;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(186, 85, 211, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    function drawParticle(particle, time) {
        const pulsatingRadius = particle.radius + Math.sin(time * particle.pulse + particle.pulseOffset) * particle.radius * 0.5;
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        vortexes.forEach(vortex => {
            const dx = vortex.x - particle.x;
            const dy = vortex.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < vortex.radius) {
                const force = 1 - (distance / vortex.radius);
                const angle = Math.atan2(dy, dx) + Math.PI / 2 + vortex.angle;
                particle.x += Math.cos(angle) * force * 0.5;
                particle.y += Math.sin(angle) * force * 0.5;
            }
        });
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulsatingRadius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, pulsatingRadius
        );
        gradient.addColorStop(0, darkRed);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    function drawVortex(vortex, time) {
        vortex.angle += vortex.rotation;
        vortex.x += Math.cos(time * vortex.speed) * 0.5;
        vortex.y += Math.sin(time * vortex.speed * 1.5) * 0.5;
        vortex.x = Math.max(vortex.radius / 3, Math.min(canvas.width - vortex.radius / 3, vortex.x));
        vortex.y = Math.max(vortex.radius / 3, Math.min(canvas.height - vortex.radius / 3, vortex.y));
        const gradient = ctx.createRadialGradient(
            vortex.x, vortex.y, 0,
            vortex.x, vortex.y, vortex.radius
        );
        gradient.addColorStop(0, 'rgba(186, 85, 211, 0.2)');
        gradient.addColorStop(0.7, 'rgba(186, 85, 211, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(vortex.x, vortex.y, vortex.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    function animate() {
        const time = Date.now() * 0.001;
        const gradients = createGradients();
        ctx.fillStyle = black;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 0.3 + Math.sin(time * 0.2) * 0.1;
        ctx.fillStyle = gradients.radial;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        waves.forEach(wave => drawWave(wave, time));
        vortexes.forEach(vortex => drawVortex(vortex, time));
        particles.forEach(particle => drawParticle(particle, time));
        ctx.fillStyle = `rgba(0, 0, 0, ${0.05 + Math.sin(time * 0.5) * 0.05})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = `rgba(186, 85, 211, ${0.1 + Math.sin(time * 0.3) * 0.05})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const offset = i * Math.PI / 5;
            ctx.beginPath();
            for (let j = 0; j < canvas.width; j += 20) {
                const x = j;
                const y = Math.sin(j * 0.01 + time + offset) * 100 + canvas.height / 2;
                if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        requestAnimationFrame(animate);
    }
    animate();
});
