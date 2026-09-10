// Deterministic candles so the frames are stable product imagery, not a live feed.
function candles(svgId, pxId, chId, n, start, seed, w, h, up) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  let s = seed; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  let price = start; const bars = [];
  for (let i = 0; i < n; i++) {
    const drift = up ? 0.0004 : -0.0003, o = price, c = o * (1 + drift + (rnd() - 0.5) * 0.02);
    const hi = Math.max(o, c) * (1 + rnd() * 0.008), lo = Math.min(o, c) * (1 - rnd() * 0.008);
    bars.push([o, hi, lo, c]); price = c;
  }
  const min = Math.min(...bars.map(b => b[2])), max = Math.max(...bars.map(b => b[1]));
  const y = v => 18 + (h - 36) * (1 - (v - min) / (max - min));
  const step = w / n, bw = Math.max(2, step * 0.55);
  let out = "";
  for (let i = 0; i < 3; i++) out += `<line x1="0" x2="${w}" y1="${(h / 4) * (i + 1)}" y2="${(h / 4) * (i + 1)}" stroke="#171614" stroke-width="1"/>`;
  bars.forEach(([o, hi, lo, c], i) => {
    const x = i * step + step / 2, col = c >= o ? "#2fbf8f" : "#6b665f";
    out += `<line x1="${x}" x2="${x}" y1="${y(hi)}" y2="${y(lo)}" stroke="${col}" stroke-width="1"/>`;
    out += `<rect x="${x - bw / 2}" y="${y(Math.max(o, c))}" width="${bw}" height="${Math.max(1, Math.abs(y(o) - y(c)))}" fill="${col}"/>`;
  });
  const last = bars[bars.length - 1][3], first = bars[0][0];
  out += `<line x1="0" x2="${w}" y1="${y(last)}" y2="${y(last)}" stroke="#2fbf8f" stroke-opacity=".5" stroke-dasharray="3 5" stroke-width="1"/>`;
  svg.innerHTML = out;
  const px = document.getElementById(pxId), ch = document.getElementById(chId);
  if (px) px.textContent = last.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (ch) { const v = (last / first - 1) * 100; ch.textContent = (v >= 0 ? "+" : "") + v.toFixed(2) + "%"; }
}
candles("c1", "px1", "ch1", 72, 61840, 8, 640, 260, true);
candles("c2", "px2", "ch2", 140, 2418, 8, 1200, 380, true);

// Reveal on scroll, once.
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px" });
document.querySelectorAll(".r, .num").forEach((el) => io.observe(el));

// Load-in, header rule, and a few pixels of parallax on the frames.
requestAnimationFrame(() => document.body.classList.add("in"));
const hdr = document.getElementById("hdr"), frames = [...document.querySelectorAll("[data-parallax]")];
const onScroll = () => {
  if (hdr) hdr.classList.toggle("scrolled", scrollY > 8);
  const vh = innerHeight;
  frames.forEach((f) => { const r = f.getBoundingClientRect(); const p = (r.top + r.height / 2 - vh / 2) / vh; f.style.transform = `translateY(${(-p * 14).toFixed(1)}px)`; });
};
addEventListener("scroll", onScroll, { passive: true }); onScroll();

// Same-site link clicks fade the page out before leaving, on browsers without view transitions.
if (!("startViewTransition" in document)) {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => { location.href = a.href; }, 140);
  });
}
