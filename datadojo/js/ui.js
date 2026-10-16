/**
 * UI helpers: escaping, mini-markdown, toast, modal, confetti, progress ring.
 */
window.UI = (() => {
  const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC_MAP[c]);

  /** Markdown mini (aman): `code`, **bold**, _italic_, list "- ", baris baru. */
  function md(text) {
    const lines = esc(text).split('\n');
    let html = '';
    let inList = false;
    lines.forEach((line) => {
      const formatted = line
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|\s)_([^_]+)_(?=\s|$|[.,])/g, '$1<em>$2</em>');
      const listMatch = /^\s*(-|\d+\.)\s+(.*)$/.exec(formatted);
      if (listMatch) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${listMatch[2]}</li>`;
        return;
      }
      if (inList) { html += '</ul>'; inList = false; }
      html += formatted.trim() ? `<p>${formatted}</p>` : '';
    });
    if (inList) html += '</ul>';
    return html;
  }

  function toast(message, type = 'info', timeout = 3200) {
    const root = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, timeout);
  }

  function modal(html, { onClose } = {}) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="modal-backdrop"><div class="modal">${html}</div></div>`;
    const close = () => { root.innerHTML = ''; onClose?.(); };
    root.querySelector('.modal-backdrop').addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop') || e.target.closest('[data-close]')) close();
    });
    return close;
  }

  /** SVG progress ring. value 0..1 */
  function ring(value, { size = 64, stroke = 7, color = 'var(--primary)', label = '' } = {}) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - Math.max(0, Math.min(1, value)));
    return `<div class="ring" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="var(--border-subtle)" stroke-width="${stroke}" fill="none"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${color}" stroke-width="${stroke}" fill="none"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
      </svg><span>${esc(label || Math.round(value * 100) + '%')}</span></div>`;
  }

  // ---------- Confetti ----------
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animating = false;
  const COLORS = ['#7c5cff', '#22d3ee', '#f2c811', '#22c55e', '#ec4899', '#f97316'];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function confetti(count = 140) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2.5,
        vx: (Math.random() - 0.5) * 16,
        vy: Math.random() * -14 - 4,
        size: Math.random() * 7 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 0
      });
    }
    if (!animating) { animating = true; requestAnimationFrame(tick); }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.life / 160);
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });
    particles = particles.filter((p) => p.y < canvas.height + 40 && p.life < 160);
    if (particles.length) requestAnimationFrame(tick);
    else { animating = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  return { esc, md, toast, modal, ring, confetti };
})();
