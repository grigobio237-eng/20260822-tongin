/**
 * Lightweight canvas-based confetti particle animation
 * 0 external dependencies, high-performance canvas particle burst
 */
export function fireConfetti() {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const colors = [
    '#F59E0B', '#D97706', '#FBBF24', // Gold / Amber
    '#1E3A8A', '#2563EB', '#60A5FA', // Navy / Royal Blue
    '#10B981', '#059669',             // Emerald
    '#EC4899', '#EF4444'              // Coral / Pink
  ];

  interface Particle {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    vx: number;
    vy: number;
    rotation: number;
    vRotation: number;
    alpha: number;
  }

  const particles: Particle[] = [];
  const particleCount = 120;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: width / 2 + (Math.random() - 0.5) * 200,
      y: height * 0.4 + (Math.random() - 0.5) * 100,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 18,
      vy: Math.random() * -14 - 4,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 14,
      alpha: 1
    });
  }

  const startTime = Date.now();
  const duration = 3500; // 3.5s

  function frame() {
    if (!ctx) return;
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const fadeProgress = Math.max(0, (elapsed - 2200) / 1300);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.vRotation;
      p.alpha = Math.max(0, 1 - fadeProgress);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
