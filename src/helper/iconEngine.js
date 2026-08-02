/* ============================================================
   AUXOSYS 3D-GLASS ICON ENGINE
   Single source of truth — imported by the browser (app.js)
   and by the Node backend (server.js).

   Public API:
     PALETTES                     → named color palettes
     listIcons()                  → [{ id, name, category, keywords }]
     buildIcon(id, options)       → full <svg>…</svg> string
       options = { size=256, palette='aurora', grain=true, shadow=true, uid }
   ============================================================ */

/* ---------- 1. PALETTES ----------
   Each palette is the iridescent "glass" gradient ramp:
   a → b → c are the surface stops (light → mid → cool),
   edge is the deep shadow tint used on lower edges + drop shadow. */
export const PALETTES = {
  aurora: { a: '#E6FF6E', b: '#8CE9C8', c: '#49CFE0', d: '#7CC6EC', edge: '#17A79A' }, // volt→mint→teal→sky
  volt:   { a: '#EAFF7A', b: '#C4F06A', c: '#8FE04F', d: '#6FD07A', edge: '#3E7A2E' }, // green-forward
  teal:   { a: '#BFF6EE', b: '#63D8CC', c: '#2BD1BE', d: '#38B4C8', edge: '#0F7A70' }, // teal glass
  ice:    { a: '#F0FBFF', b: '#CDEBF6', c: '#9FD6E8', d: '#B7D9F0', edge: '#5C93B0' }, // cool blue glass
  grape:  { a: '#EBDDFE', b: '#C6A9F5', c: '#9A6CF3', d: '#7C5CF5', edge: '#4B2E9E' }, // violet glass
};

/* ---------- 2. GLASS MATERIAL ----------
   Returns the <defs> block. Every gradient/filter id is suffixed
   with `uid` so many icons can coexist on one page without clashing. */
function material(uid, palette, { grain, shadow }) {
  const p = palette;
  return `
  <defs>
    <linearGradient id="surf-${uid}" x1="12%" y1="4%" x2="88%" y2="98%">
      <stop offset="0%"  stop-color="${p.a}"/>
      <stop offset="38%" stop-color="${p.b}"/>
      <stop offset="72%" stop-color="${p.c}"/>
      <stop offset="100%" stop-color="${p.d}"/>
    </linearGradient>

    <radialGradient id="sheen-${uid}" cx="34%" cy="24%" r="52%">
      <stop offset="0%"  stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="depth-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="55%" stop-color="${p.edge}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${p.edge}" stop-opacity="0.5"/>
    </linearGradient>

    ${grain ? `
    <filter id="grain-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="11" result="noise"/>
      <feColorMatrix in="noise" type="matrix"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0" result="whiteNoise"/>
      <feComposite in="whiteNoise" in2="SourceAlpha" operator="in" result="clipped"/>
      <feBlend in="SourceGraphic" in2="clipped" mode="soft-light"/>
    </filter>` : ''}

    ${shadow ? `
    <filter id="drop-${uid}" x="-40%" y="-30%" width="180%" height="170%">
      <feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="${p.edge}" flood-opacity="0.35"/>
    </filter>` : ''}
  </defs>`;
}

/* Helper: wrap an icon's raw shapes in the standard glass treatment.
   `body` should paint the base silhouette using fill="url(#surf-UID)".
   We then overlay the sheen + depth automatically via a duplicated mask. */
function glass(uid, shapes, { grain, shadow }) {
  const grainAttr = grain ? ` filter="url(#grain-${uid})"` : '';
  const shadowAttr = shadow ? ` filter="url(#drop-${uid})"` : '';
  return `<g${shadowAttr}><g${grainAttr}>${shapes}</g></g>`;
}

/* ---------- 3. ICON LIBRARY ----------
   Each entry: metadata + shapes(uid) returning the silhouette markup.
   Silhouettes are drawn on a 256×256 canvas, roughly centered. */
const ICONS = {
  /* ---- map / location pin (donut teardrop) ---- */
  pin: {
    name: 'Location Pin', category: 'Places',
    keywords: ['map', 'location', 'marker', 'place', 'gps'],
    shapes: (u) => `
      <defs>
        <mask id="pinhole-${u}">
          <path d="M128 226 C82 158 66 146 66 104 A62 62 0 1 1 190 104 C190 146 174 158 128 226 Z" fill="#fff"/>
          <circle cx="128" cy="100" r="25" fill="#000"/>
        </mask>
      </defs>
      <path d="M128 226 C82 158 66 146 66 104 A62 62 0 1 1 190 104 C190 146 174 158 128 226 Z"
            fill="url(#surf-${u})" mask="url(#pinhole-${u})"/>
      <path d="M128 226 C82 158 66 146 66 104 A62 62 0 1 1 190 104 C190 146 174 158 128 226 Z"
            fill="url(#depth-${u})" mask="url(#pinhole-${u})"/>
      <path d="M128 226 C82 158 66 146 66 104 A62 62 0 1 1 190 104 C190 146 174 158 128 226 Z"
            fill="url(#sheen-${u})" mask="url(#pinhole-${u})"/>
      <ellipse cx="104" cy="66" rx="26" ry="16" fill="#fff" opacity="0.35"/>`,
  },

  /* ---- cash bundle ---- */
  cash: {
    name: 'Cash Bundle', category: 'Finance',
    keywords: ['money', 'cash', 'pay', 'salary', 'dollar', 'earn'],
    shapes: (u) => `
      <!-- lower stacked bills -->
      <g>
        <rect x="44" y="150" width="168" height="20" rx="6" fill="url(#surf-${u})"/>
        <rect x="44" y="150" width="168" height="20" rx="6" fill="url(#depth-${u})"/>
        <rect x="50" y="134" width="156" height="18" rx="6" fill="url(#surf-${u})"/>
        <rect x="50" y="134" width="156" height="18" rx="6" fill="url(#depth-${u})"/>
      </g>
      <!-- top bill -->
      <rect x="52" y="86" width="152" height="52" rx="8" fill="url(#surf-${u})"/>
      <rect x="52" y="86" width="152" height="52" rx="8" fill="url(#depth-${u})"/>
      <!-- banknote band -->
      <rect x="116" y="86" width="24" height="52" fill="${'#1FB9A8'}" opacity="0.45"/>
      <!-- center oval + $ marks -->
      <ellipse cx="128" cy="112" rx="20" ry="13" fill="#fff" opacity="0.5"/>
      <text x="70"  y="118" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0E7A70" opacity="0.7">$</text>
      <text x="176" y="118" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0E7A70" opacity="0.7">$</text>
      <!-- gloss -->
      <rect x="52" y="86" width="152" height="52" rx="8" fill="url(#sheen-${u})"/>`,
  },

  /* ---- laptop (slight iso) ---- */
  laptop: {
    name: 'Laptop', category: 'Tech',
    keywords: ['computer', 'laptop', 'work', 'remote', 'device', 'code'],
    shapes: (u) => `
      <!-- base slab -->
      <path d="M40 176 L216 176 L232 200 L24 200 Z" fill="url(#surf-${u})"/>
      <path d="M40 176 L216 176 L232 200 L24 200 Z" fill="url(#depth-${u})"/>
      <!-- keyboard hint -->
      <path d="M64 182 L192 182 L200 194 L56 194 Z" fill="#0F8C82" opacity="0.25"/>
      <!-- screen back + bezel -->
      <rect x="58" y="60" width="140" height="112" rx="8" fill="url(#surf-${u})"/>
      <rect x="58" y="60" width="140" height="112" rx="8" fill="url(#depth-${u})"/>
      <rect x="70" y="72" width="116" height="88" rx="4" fill="#BFEFE6" opacity="0.55"/>
      <!-- screen gloss streak -->
      <path d="M78 150 L150 74 L168 74 L96 150 Z" fill="#ffffff" opacity="0.35"/>
      <rect x="58" y="60" width="140" height="112" rx="8" fill="url(#sheen-${u})"/>`,
  },

  /* ---- cloud ---- */
  cloud: {
    name: 'Cloud', category: 'Tech',
    keywords: ['cloud', 'saas', 'storage', 'server', 'sync'],
    shapes: (u) => `
      <path d="M78 168 A40 40 0 0 1 82 90 A48 48 0 0 1 172 96 A34 34 0 0 1 178 168 Z"
            fill="url(#surf-${u})"/>
      <path d="M78 168 A40 40 0 0 1 82 90 A48 48 0 0 1 172 96 A34 34 0 0 1 178 168 Z"
            fill="url(#depth-${u})"/>
      <ellipse cx="112" cy="108" rx="34" ry="18" fill="#fff" opacity="0.35"/>
      <path d="M78 168 A40 40 0 0 1 82 90 A48 48 0 0 1 172 96 A34 34 0 0 1 178 168 Z"
            fill="url(#sheen-${u})"/>`,
  },

  /* ---- rocket ---- */
  rocket: {
    name: 'Rocket', category: 'General',
    keywords: ['rocket', 'launch', 'startup', 'boost', 'ship'],
    shapes: (u) => `
      <path d="M128 40 C160 66 172 108 172 148 L148 172 L108 172 L84 148 C84 108 96 66 128 40 Z"
            fill="url(#surf-${u})"/>
      <path d="M128 40 C160 66 172 108 172 148 L148 172 L108 172 L84 148 C84 108 96 66 128 40 Z"
            fill="url(#depth-${u})"/>
      <circle cx="128" cy="104" r="18" fill="#BFEFE6" opacity="0.7"/>
      <path d="M84 148 L60 176 L92 168 Z" fill="url(#surf-${u})"/>
      <path d="M172 148 L196 176 L164 168 Z" fill="url(#surf-${u})"/>
      <path d="M112 172 L128 210 L144 172 Z" fill="#F5A94C" opacity="0.7"/>
      <path d="M128 40 C160 66 172 108 172 148 L148 172 L108 172 L84 148 C84 108 96 66 128 40 Z"
            fill="url(#sheen-${u})"/>`,
  },

  /* ---- bar chart ---- */
  chart: {
    name: 'Bar Chart', category: 'Finance',
    keywords: ['chart', 'graph', 'analytics', 'stats', 'data', 'growth'],
    shapes: (u) => `
      <rect x="56"  y="132" width="30" height="56" rx="6" fill="url(#surf-${u})"/>
      <rect x="56"  y="132" width="30" height="56" rx="6" fill="url(#depth-${u})"/>
      <rect x="100" y="96"  width="30" height="92" rx="6" fill="url(#surf-${u})"/>
      <rect x="100" y="96"  width="30" height="92" rx="6" fill="url(#depth-${u})"/>
      <rect x="144" y="68"  width="30" height="120" rx="6" fill="url(#surf-${u})"/>
      <rect x="144" y="68"  width="30" height="120" rx="6" fill="url(#depth-${u})"/>
      <rect x="56"  y="132" width="30" height="56" rx="6" fill="url(#sheen-${u})"/>
      <rect x="100" y="96"  width="30" height="92" rx="6" fill="url(#sheen-${u})"/>
      <rect x="144" y="68"  width="30" height="120" rx="6" fill="url(#sheen-${u})"/>`,
  },

  /* ---- brain / AI ---- */
  brain: {
    name: 'Brain', category: 'Tech',
    keywords: ['brain', 'ai', 'ml', 'intelligence', 'think', 'neural'],
    shapes: (u) => `
      <path d="M112 56 A34 34 0 0 0 76 92 A30 30 0 0 0 72 148 A32 32 0 0 0 118 178 L118 56 Z
               M144 56 A34 34 0 0 1 180 92 A30 30 0 0 1 184 148 A32 32 0 0 1 138 178 L138 56 Z"
            fill="url(#surf-${u})"/>
      <path d="M112 56 A34 34 0 0 0 76 92 A30 30 0 0 0 72 148 A32 32 0 0 0 118 178 L118 56 Z
               M144 56 A34 34 0 0 1 180 92 A30 30 0 0 1 184 148 A32 32 0 0 1 138 178 L138 56 Z"
            fill="url(#depth-${u})"/>
      <ellipse cx="104" cy="92" rx="20" ry="12" fill="#fff" opacity="0.3"/>
      <path d="M112 56 A34 34 0 0 0 76 92 A30 30 0 0 0 72 148 A32 32 0 0 0 118 178 L118 56 Z
               M144 56 A34 34 0 0 1 180 92 A30 30 0 0 1 184 148 A32 32 0 0 1 138 178 L138 56 Z"
            fill="url(#sheen-${u})"/>`,
  },

  /* ---- cube / package ---- */
  cube: {
    name: 'Cube', category: 'General',
    keywords: ['cube', 'box', 'package', '3d', 'product', 'block'],
    shapes: (u) => `
      <path d="M128 52 L196 92 L196 164 L128 204 L60 164 L60 92 Z" fill="url(#surf-${u})"/>
      <path d="M128 52 L196 92 L128 132 L60 92 Z" fill="#ffffff" opacity="0.28"/>
      <path d="M128 132 L196 92 L196 164 L128 204 Z" fill="url(#depth-${u})"/>
      <path d="M128 52 L196 92 L196 164 L128 204 L60 164 L60 92 Z" fill="url(#sheen-${u})"/>`,
  },
};

/* ---------- 4. CONTROLLER ---------- */
export function listIcons() {
  return Object.entries(ICONS).map(([id, def]) => ({
    id, name: def.name, category: def.category, keywords: def.keywords,
  }));
}

let _counter = 0;
export function buildIcon(id, options = {}) {
  const def = ICONS[id];
  if (!def) throw new Error(`Unknown icon: ${id}`);
  const {
    size = 256,
    palette = 'aurora',
    grain = true,
    shadow = true,
    uid = `${id}-${(_counter++).toString(36)}`,
  } = options;
  const pal = typeof palette === 'object' ? palette : (PALETTES[palette] || PALETTES.aurora);

  const defs = material(uid, pal, { grain, shadow });
  const body = glass(uid, def.shapes(uid), { grain, shadow });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 256 256" role="img" aria-label="${def.name}">${defs}${body}</svg>`;
}

/* ---------- 5. LUCIDE ADAPTER ---------- */
export function buildLucideIcon(iconContents, options = {}) {
  const {
    size = 256,
    palette = 'aurora',
    grain = true,
    shadow = true,
    uid = `lucide-${(_counter++).toString(36)}`,
  } = options;
  
  const pal = typeof palette === 'object' ? palette : (PALETTES[palette] || PALETTES.aurora);
  const defs = material(uid, pal, { grain, shadow });
  
  // Lucide icons are strokes, so we apply the surf and depth gradients to the stroke
  // instead of fill, and set fill to none. We use a thicker stroke width.
  const styledShapes = `
    <g stroke="url(#surf-${uid})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      ${iconContents}
    </g>
    <g stroke="url(#depth-${uid})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      ${iconContents}
    </g>
    <g stroke="url(#sheen-${uid})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      ${iconContents}
    </g>
  `;

  const body = glass(uid, styledShapes, { grain, shadow });

  // Lucide icons use a 24x24 viewBox originally.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" role="img">${defs}${body}</svg>`;
}

/* Node/browser dual export */
const iconEngine = { PALETTES, listIcons, buildIcon, buildLucideIcon };
export default iconEngine;
