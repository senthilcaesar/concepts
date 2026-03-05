const NODE_COUNT = 70;
const CONNECTION_DIST = 160;
const REPEL_DIST = 120;

class Node {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.baseRadius = 1.5 + Math.random() * 2;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.015 + Math.random() * 0.025;
    // Random chance to be a "bright" hub node
    this.isHub = Math.random() < 0.12;
    if (this.isHub) this.baseRadius *= 2;
  }

  update(mouse) {
    this.pulsePhase += this.pulseSpeed;

    // Repel from mouse
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < REPEL_DIST && dist > 0) {
      const force = ((REPEL_DIST - dist) / REPEL_DIST) ** 2 * 3;
      this.vx += (dx / dist) * force * 0.08;
      this.vy += (dy / dist) * force * 0.08;
    }

    // Gentle drift damping
    this.vx *= 0.975;
    this.vy *= 0.975;

    // Clamp speed
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > 1.5) {
      this.vx = (this.vx / speed) * 1.5;
      this.vy = (this.vy / speed) * 1.5;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Soft-wrap edges
    if (this.x < 0) this.x = this.width;
    if (this.x > this.width) this.x = 0;
    if (this.y < 0) this.y = this.height;
    if (this.y > this.height) this.y = 0;
  }

  draw(ctx, isLight) {
    const pulse = 0.5 + 0.5 * Math.sin(this.pulsePhase);
    const r = this.baseRadius * (1 + pulse * 0.6);
    const alpha = (this.isHub ? 0.7 : 0.4) + pulse * 0.4;

    const coreColor = isLight
      ? `rgba(176, 141, 87, ${alpha})`
      : this.isHub
        ? `rgba(180, 100, 255, ${alpha})`
        : `rgba(0, 242, 255, ${alpha})`;

    const glowColor = isLight
      ? `rgba(176, 141, 87, ${pulse * 0.12})`
      : this.isHub
        ? `rgba(130, 0, 255, ${pulse * 0.1})`
        : `rgba(0, 242, 255, ${pulse * 0.1})`;

    // Outer glow halo
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 5, 0, Math.PI * 2);
    ctx.fillStyle = glowColor;
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = coreColor;
    ctx.fill();
  }
}

// A short-lived spark travelling along a connection line
class Spark {
  constructor(x1, y1, x2, y2, isLight) {
    this.x1 = x1; this.y1 = y1;
    this.x2 = x2; this.y2 = y2;
    this.progress = 0;
    this.speed = 0.02 + Math.random() * 0.03;
    this.isLight = isLight;
    this.alive = true;
  }

  update() {
    this.progress += this.speed;
    if (this.progress >= 1) this.alive = false;
  }

  draw(ctx) {
    const x = this.x1 + (this.x2 - this.x1) * this.progress;
    const y = this.y1 + (this.y2 - this.y1) * this.progress;
    const alpha = 1 - this.progress;

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = this.isLight
      ? `rgba(212, 160, 23, ${alpha})`
      : `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }
}

export function initConstellation(canvas) {
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0;
  let nodes = [];
  let sparks = [];
  let animId = null;
  const mouse = { x: -9999, y: -9999 };
  let sparkCooldown = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    nodes = Array.from({ length: NODE_COUNT }, () => new Node(width, height));
  }

  function maybeSpawnSpark(isLight) {
    sparkCooldown--;
    if (sparkCooldown > 0) return;
    sparkCooldown = 30 + Math.floor(Math.random() * 60);

    // Pick a random connected pair and launch a spark
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length - 1; i++) {
      const n1 = shuffled[i], n2 = shuffled[i + 1];
      const d = Math.hypot(n1.x - n2.x, n1.y - n2.y);
      if (d < CONNECTION_DIST) {
        sparks.push(new Spark(n1.x, n1.y, n2.x, n2.y, isLight));
        return;
      }
    }
  }

  function drawConnection(n1, n2, dist, isLight) {
    const alpha = (1 - dist / CONNECTION_DIST) * (isLight ? 0.25 : 0.35);

    // Gradient line from node to node
    const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
    const c1 = isLight ? `rgba(176,141,87,${alpha * 1.5})` : n1.isHub ? `rgba(150,50,255,${alpha * 1.5})` : `rgba(0,242,255,${alpha * 1.5})`;
    const c2 = isLight ? `rgba(122,106,83,${alpha})` : n2.isHub ? `rgba(150,50,255,${alpha})` : `rgba(0,200,220,${alpha})`;
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);

    ctx.beginPath();
    ctx.moveTo(n1.x, n1.y);
    ctx.lineTo(n2.x, n2.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = isLight ? 0.6 : 0.8;
    ctx.stroke();
  }

  function animate() {
    const isLight = document.documentElement.classList.contains('light-mode');

    ctx.clearRect(0, 0, width, height);

    // Draw connections first (behind nodes)
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].update(mouse);
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONNECTION_DIST) {
          drawConnection(nodes[i], nodes[j], dist, isLight);
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => n.draw(ctx, isLight));

    // Sparks
    maybeSpawnSpark(isLight);
    sparks = sparks.filter(s => s.alive);
    sparks.forEach(s => { s.update(); s.draw(ctx); });

    animId = requestAnimationFrame(animate);
  }

  // Cleanup helper
  function destroy() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
    window.removeEventListener('mousemove', onMouseMove);
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMouseMove);
  resize();
  animate();

  return { destroy };
}
