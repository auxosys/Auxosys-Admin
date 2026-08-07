import React, { useMemo } from 'react';

/** Mirrors backend/src/services/colorEngine.js toCssBackground() exactly. */
export function toCssBackground(config) {
  if (!config || !Array.isArray(config.colors) || config.colors.length === 0) {
    return '#14B8A6';
  }
  if (config.type !== 'gradient' || config.colors.length === 1) {
    return config.colors[0];
  }
  const stopList = config.colors
    .map((color, i) => {
      const pct = config.stops && config.stops[i] != null
        ? config.stops[i]
        : Math.round((i / (config.colors.length - 1)) * 100);
      return `${color} ${pct}%`;
    })
    .join(', ');
  return config.mode === 'radial'
    ? `radial-gradient(circle at 30% 20%, ${stopList})`
    : `linear-gradient(${config.angle ?? 135}deg, ${stopList})`;
}

const PRESETS = [
  { label: 'Auxosys Teal', config: { type: 'solid', colors: ['#14B8A6'] } },
  { label: 'Auxosys Ink', config: { type: 'solid', colors: ['#0F172A'] } },
  { label: 'Soft Teal', config: { type: 'solid', colors: ['#EAFAF7'] } },
  { label: 'Ocean', config: { type: 'gradient', mode: 'linear', angle: 135, colors: ['#0EA5E9', '#14B8A6'] } },
  { label: 'Sunset', config: { type: 'gradient', mode: 'linear', angle: 120, colors: ['#F97316', '#EF4444', '#EC4899'] } },
  { label: 'Royal', config: { type: 'gradient', mode: 'linear', angle: 135, colors: ['#4C1D95', '#7C3AED', '#0EA5E9'] } },
  { label: 'Gold', config: { type: 'gradient', mode: 'linear', angle: 135, colors: ['#B8860B', '#F0C64C', '#B8860B'] } },
  { label: 'Midnight', config: { type: 'gradient', mode: 'radial', colors: ['#1E293B', '#0F172A', '#020617', '#14B8A6'] } },
];

/**
 * <ColorEngine value={colorConfig} onChange={setColorConfig} />
 * value shape: { type: 'solid'|'gradient', mode?: 'linear'|'radial', angle?: number, colors: string[] }
 */
export default function ColorEngine({ value, onChange }) {
  const config = value || { type: 'solid', colors: ['#14B8A6'] };
  const isGradient = config.type === 'gradient';
  const preview = useMemo(() => toCssBackground(config), [config]);

  const setColors = (colors) => onChange({ ...config, colors });
  const addColor = () => {
    if (config.colors.length >= 6) return;
    setColors([...config.colors, '#94A3B8']);
  };
  const removeColor = (i) => {
    if (config.colors.length <= 1) return;
    setColors(config.colors.filter((_, idx) => idx !== i));
  };
  const updateColor = (i, hex) => {
    const next = [...config.colors];
    next[i] = hex;
    setColors(next);
  };

  return (
    <div className="color-engine">
      <style>{`
        .color-engine { display: flex; flex-direction: column; gap: 14px; }
        .ce-swatch {
          height: 64px; border-radius: 10px; border: 1px solid #E2E8F0;
        }
        .ce-mode-toggle { display: flex; gap: 8px; }
        .ce-mode-btn {
          flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #E2E8F0;
          background: #FFFFFF; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer;
        }
        .ce-mode-btn.active { background: #0F172A; border-color: #0F172A; color: #FFFFFF; }
        .ce-colors { display: flex; flex-direction: column; gap: 8px; }
        .ce-color-row { display: flex; align-items: center; gap: 8px; }
        .ce-color-row input[type="color"] { width: 36px; height: 36px; border: none; border-radius: 8px; padding: 0; cursor: pointer; }
        .ce-color-row input[type="text"] {
          flex: 1; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 10px; font-size: 13px;
          font-family: monospace; color: #0F172A;
        }
        .ce-remove { background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 16px; padding: 4px 8px; }
        .ce-add-btn {
          border: 1px dashed #CBD5E1; border-radius: 8px; padding: 8px; background: none;
          font-size: 13px; font-weight: 600; color: #475569; cursor: pointer;
        }
        .ce-angle-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #475569; }
        .ce-angle-row input[type="range"] { flex: 1; }
        .ce-presets { display: flex; flex-wrap: wrap; gap: 8px; }
        .ce-preset {
          width: 40px; height: 40px; border-radius: 8px; border: 1.5px solid #E2E8F0;
          cursor: pointer; padding: 0;
        }
        .ce-preset:hover { border-color: #14B8A6; }
        .ce-label { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #64748B; margin-bottom: 4px; display: block; }
      `}</style>

      <div className="ce-swatch" style={{ background: preview }} />

      <div className="ce-mode-toggle">
        <button
          type="button"
          className={`ce-mode-btn ${!isGradient ? 'active' : ''}`}
          onClick={() => onChange({ type: 'solid', colors: [config.colors[0]] })}
        >
          Solid
        </button>
        <button
          type="button"
          className={`ce-mode-btn ${isGradient ? 'active' : ''}`}
          onClick={() =>
            onChange({
              type: 'gradient',
              mode: config.mode || 'linear',
              angle: config.angle ?? 135,
              colors: config.colors.length > 1 ? config.colors : [config.colors[0], '#0C8074'],
            })
          }
        >
          Gradient (2-6 colors)
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <span className="ce-label" style={{ display: 'inline-block', textAlign: 'center', marginBottom: '8px' }}>Colors</span>
        <div className="ce-colors" style={{ justifyContent: 'center' }}>
          {config.colors.map((color, i) => (
            <div className="ce-color-row" key={i}>
              <input type="color" value={color} onChange={(e) => updateColor(i, e.target.value)} />
              <input type="text" value={color} onChange={(e) => updateColor(i, e.target.value)} />
              {isGradient && config.colors.length > 1 && (
                <button type="button" className="ce-remove" onClick={() => removeColor(i)}>×</button>
              )}
            </div>
          ))}
        </div>
        {isGradient && config.colors.length < 6 && (
          <button type="button" className="ce-add-btn" style={{ marginTop: 8, width: '100%' }} onClick={addColor}>
            + Add color ({config.colors.length}/6)
          </button>
        )}
      </div>

      {isGradient && (
        <>
          <div className="ce-mode-toggle">
            <button
              type="button"
              className={`ce-mode-btn ${config.mode !== 'radial' ? 'active' : ''}`}
              onClick={() => onChange({ ...config, mode: 'linear' })}
            >
              Linear
            </button>
            <button
              type="button"
              className={`ce-mode-btn ${config.mode === 'radial' ? 'active' : ''}`}
              onClick={() => onChange({ ...config, mode: 'radial' })}
            >
              Radial
            </button>
          </div>
          {config.mode !== 'radial' && (
            <div className="ce-angle-row">
              <span>Angle</span>
              <input
                type="range" min="0" max="360" value={config.angle ?? 135}
                onChange={(e) => onChange({ ...config, angle: Number(e.target.value) })}
              />
              <span>{config.angle ?? 135}°</span>
            </div>
          )}
        </>
      )}

      <div style={{ textAlign: 'center' }}>
        <span className="ce-label" style={{ display: 'inline-block', textAlign: 'center', marginBottom: '8px' }}>Presets</span>
        <div className="ce-presets" style={{ justifyContent: 'center' }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="ce-preset"
              title={p.label}
              style={{ background: toCssBackground(p.config) }}
              onClick={() => onChange(p.config)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
