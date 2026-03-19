(function() {
  const scriptSrc = document.currentScript.src;
  const MEMBERS_URL = scriptSrc.replace('webring.js', 'members.json');
  const HOME_URL = scriptSrc.replace('webring.js', 'index.html');
  const RING_NAME = "ringring";

  function seededRandom(seed) {
    let s = seed;
    return function() {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  function getDailySeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  function shuffle(arr, seed) {
    const a = [...arr];
    const rand = seededRandom(seed);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getCurrentSiteIndex(members) {
    const normalize = (url) => {
      try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/$/, "");
      } catch { return url; }
    };
    const current = normalize(window.location.href);
    return members.findIndex((m) => normalize(m.url) === current);
  }

  function render(members) {
    const el = document.getElementById("webring");
    if (!el) return;

    const shadow = el.attachShadow({ mode: "open" });
    const seed = getDailySeed();
    const ordered = shuffle(members, seed);
    const idx = getCurrentSiteIndex(ordered);

    const isMember = idx !== -1;
    const prev = isMember ? ordered[(idx - 1 + ordered.length) % ordered.length] : null;
    const next = isMember ? ordered[(idx + 1) % ordered.length] : null;

    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          --accent: #c8f060;
          display: inline-block;
          font-family: 'IBM Plex Mono', monospace;
        }
        .container {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          padding: 10px 20px;
          border: 1px solid rgba(128, 128, 128, 0.5);
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s ease;
          opacity: 1.0;
          color: inherit;
        }
        @media (prefers-color-scheme: dark) {
            .container { 
              color: #e8e8e0; 
              background: #151515; 
              border-color: #333; 
            }
          }
          @media (prefers-color-scheme: light) {
            .container { 
              color: #1a1a18; 
              background: #ffffff; 
              border-color: #ddd; 
              box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            }
          }
        .container:hover {
          opacity: 1;
          border-color: var(--accent);
          background: rgba(200, 240, 96, 0.05);
        }
        a { color: inherit; text-decoration: none; transition: color 0.2s; font-weight: 500; }
        a:hover { color: var(--accent); }
        .sep { width: 1px; height: 12px; background: currentColor; opacity: 0.2; }
        .ring-name { font-weight: 600; text-transform: lowercase; font-size: 13px; letter-spacing: 0.05em; opacity: 0.5; }
      </style>
      <nav class="container" aria-label="webring">
        ${isMember ? `
          <a href="${prev.url}" title="${prev.name}" rel="prev">←</a>
          <div class="sep"></div>
          <a href="${HOME_URL}" class="ring-name">${RING_NAME}</a>
          <div class="sep"></div>
          <a href="${next.url}" title="${next.name}" rel="next">→</a>
        ` : `
          <a href="${HOME_URL}" class="ring-name">${RING_NAME}</a>
          <div class="sep"></div>
          <a href="${ordered[0].url}">discover →</a>
        `}
      </nav>
    `;
  }

  fetch(MEMBERS_URL)
    .then(r => r.json())
    .then(render)
    .catch(() => {
      const el = document.getElementById("webring");
      if (el) el.style.display = "none";
    });
})();
