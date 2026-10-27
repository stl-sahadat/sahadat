/**
 * Constellation Field - Particle Drift (High-Performance 60 FPS Edition)
 * Zero-Jank, Hardware-Accelerated Particle & Laser Graph
 * Authentic ThreeUI WebGL/Canvas 2D Replication tailored to Md Sahadat Hossain's electric violet aesthetic.
 */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConstellationField);
  } else {
    initConstellationField();
  }

  function initConstellationField() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    const container = canvas.parentElement || document.body;

    let width = 0;
    let height = 0;
    let animationFrameId = null;
    let isTabVisible = true;
    let isFastScrolling = false;
    let scrollTimer = null;

    // Interactive pointer coordinates (screen space)
    const mouse = { x: -1000, y: -1000, active: false };

    // Particles containers
    let nodes = [];
    let beams = [];
    let stars = [];

    // ASCII Glyph alphabet from ThreeUI Particle Drift
    const chars = '0123456789ABCDEF@#$%&*()'.split('');

    // Responsive configuration tailored for 60-120 FPS high performance
    function getConfig() {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      return {
        isMobile,
        nodeCount: isMobile ? 22 : isTablet ? 34 : 46,
        beamCount: isMobile ? 8 : isTablet ? 12 : 16,
        starCount: isMobile ? 16 : 26,
        linkDistance: isMobile ? 95 : 125,
        mouseRadius: isMobile ? 120 : 160,
        beamSpeedMin: isMobile ? 2.5 : 3.5,
        beamSpeedMax: isMobile ? 5.5 : 7.5,
        nodeDriftSpeed: 0.35
      };
    }

    let config = getConfig();

    const beamColors = [
      'rgba(192, 132, 252, 0.45)', // Electric Violet
      'rgba(157, 78, 221, 0.40)',  // Signature Violet
      'rgba(96, 165, 250, 0.40)',  // Sky Blue
      'rgba(244, 63, 94, 0.35)'    // Rose Ambient Accent
    ];

    function createNode(spawnX, spawnY) {
      return {
        x: spawnX !== undefined ? spawnX : Math.random() * (width || window.innerWidth),
        y: spawnY !== undefined ? spawnY : Math.random() * (height || window.innerHeight),
        vx: (Math.random() - 0.5) * 0.22,
        vy: Math.random() * config.nodeDriftSpeed + 0.1,
        char: chars[Math.floor(Math.random() * chars.length)]
      };
    }

    function createBeam(spawnX, spawnY) {
      return {
        x: spawnX !== undefined ? spawnX : Math.random() * (width || window.innerWidth),
        y: spawnY !== undefined ? spawnY : Math.random() * (height || window.innerHeight),
        length: Math.random() * 90 + 60,
        speed: Math.random() * (config.beamSpeedMax - config.beamSpeedMin) + config.beamSpeedMin,
        color: beamColors[Math.floor(Math.random() * beamColors.length)]
      };
    }

    function createStar(spawnX, spawnY) {
      return {
        x: spawnX !== undefined ? spawnX : Math.random() * (width || window.innerWidth),
        y: spawnY !== undefined ? spawnY : Math.random() * (height || window.innerHeight),
        vy: Math.random() * 0.12 + 0.04,
        radius: Math.random() * 1.0 + 0.5,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.003 + 0.001
      };
    }

    // High performance 1x buffer sizing for zero GPU fillrate bottlenecks
    function handleResize() {
      width = Math.max(container.clientWidth || window.innerWidth, 320);
      height = Math.max(container.clientHeight || window.innerHeight, 320);

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      config = getConfig();
      initParticles();
    }

    function initParticles() {
      nodes = [];
      for (let i = 0; i < config.nodeCount; i++) nodes.push(createNode());

      beams = [];
      for (let i = 0; i < config.beamCount; i++) beams.push(createBeam());

      stars = [];
      for (let i = 0; i < config.starCount; i++) stars.push(createStar());
    }

    // Scroll throttle: yield frame execution during rapid scrolling for silky 60 FPS
    window.addEventListener('scroll', () => {
      isFastScrolling = true;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isFastScrolling = false;
      }, 120);
    }, { passive: true });

    let lastFrameTime = 0;

    // Main Hardware-Accelerated 60 FPS Render Loop
    function render(time) {
      if (!isTabVisible) {
        animationFrameId = null;
        return;
      }

      // During active fast scroll, throttle particle canvas to prioritize DOM scroll compositor
      if (isFastScrolling && (time - lastFrameTime < 32)) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Celestial Ambient Micro-Stars (Single path draw batch)
      ctx.fillStyle = 'rgba(192, 132, 252, 0.45)';
      ctx.beginPath();
      const starCount = stars.length;
      for (let i = 0; i < starCount; i++) {
        const s = stars[i];
        s.y += s.vy;
        if (s.y > height + 10) { s.y = -10; s.x = Math.random() * width; }
        ctx.moveTo(s.x + s.radius, s.y);
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      }
      ctx.fill();

      // 2. Upward Streaming Beams
      const beamCount = beams.length;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < beamCount; i++) {
        const b = beams[i];
        b.y -= b.speed;
        if (b.y + b.length < -20) {
          b.y = height + Math.random() * 50;
          b.x = Math.random() * width;
        }
        ctx.strokeStyle = b.color;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x, b.y + b.length);
        ctx.stroke();
      }

      // 3. Proximity Network Mesh (Single path draw batch - zero draw call overhead!)
      const nodeCount = nodes.length;
      const linkDist = config.linkDistance;
      const linkDistSq = linkDist * linkDist;

      ctx.strokeStyle = 'rgba(192, 132, 252, 0.16)';
      ctx.lineWidth = 0.65;
      ctx.beginPath();

      for (let i = 0; i < nodeCount; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodeCount; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          if (Math.abs(dx) >= linkDist) continue;
          const dy = n1.y - n2.y;
          if (Math.abs(dy) >= linkDist) continue;

          if (dx * dx + dy * dy < linkDistSq) {
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
          }
        }
      }
      ctx.stroke();

      // 4. Interactive ASCII Nodes & Pointer Physics
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(220, 195, 255, 0.65)';

      const mouseRadius = config.mouseRadius;
      const hasMouse = mouse.x > -500 && mouse.y > -500;

      for (let i = 0; i < nodeCount; i++) {
        const n = nodes[i];
        n.y += n.vy;
        n.x += n.vx;

        if (n.y > height + 20) { n.y = -20; n.x = Math.random() * width; }
        else if (n.y < -20) { n.y = height + 20; }
        if (n.x > width + 20) { n.x = -20; }
        else if (n.x < -20) { n.x = width + 20; }

        if (hasMouse) {
          const mdx = mouse.x - n.x;
          const mdy = mouse.y - n.y;
          if (Math.abs(mdx) < mouseRadius && Math.abs(mdy) < mouseRadius) {
            const dist = Math.hypot(mdx, mdy);
            if (dist < mouseRadius) {
              ctx.strokeStyle = `rgba(192, 132, 252, ${(1 - dist / mouseRadius) * 0.45})`;
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
            }
          }
        }

        ctx.fillText(n.char, n.x, n.y);
      }

      animationFrameId = requestAnimationFrame(render);
    }

    function updatePointer(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
      mouse.active = true;
    }

    window.addEventListener('mousemove', (e) => updatePointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; mouse.active = false; });
    window.addEventListener('resize', handleResize, { passive: true });

    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      }
    });

    handleResize();
    animationFrameId = requestAnimationFrame(render);
  }
})();
