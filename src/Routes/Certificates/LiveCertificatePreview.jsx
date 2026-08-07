import React from 'react';
import { sanitizeConfig, readableTextColor } from '../../helper/colorEngine';

export default function LiveCertificatePreview({
  certType = 'Certificate',
  recipientName = 'Recipient Name',
  certificateNumber = 'PREVIEW',
  issueDateFormatted = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
  qrCodeUrl = '',
  signatures = [],
  fields = {},
  colorConfig = {},
}) {
  const config = sanitizeConfig(colorConfig);
  const isGradient = config.type === 'gradient' && config.colors.length > 1;
  const solidColor = config.colors[0];

  const gradientStops = config.colors.map((color, i) => {
    let offset;
    if (config.stops && config.stops[i] != null) {
      offset = config.stops[i];
    } else {
      offset = Math.round((i / Math.max(config.colors.length - 1, 1)) * 100);
    }
    return { color, offset };
  });

  const textColor = readableTextColor(config);
  let logoTextColor = textColor;
  if (config.logoColor === 'white') logoTextColor = '#FFFFFF';
  if (config.logoColor === 'dark') logoTextColor = '#0F172A';

  return (
    <div className="live-cert-preview" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Container aspect ratio hack for responsive scaling */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '70.677%' /* 793/1122 */ }}>
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: '1122px', height: '793px',
          transformOrigin: 'top left',
          transform: 'scale(calc(100% / 1122))', // Wait, CSS calc with % doesn't work this way for scaling an absolutely positioned child in all browsers.
          // We will rely on CSS transform in the parent component instead, but let's try a simple scale first, or we can use a container query.
          // Let's use CSS container sizing if possible, but hardcoded scale for now. Actually, we'll let the parent handle the scale if this doesn't work.
          // We'll use a hack to scale based on parent width. We can't easily do it with just CSS calc(100% / 1122) because 100% is the container width.
          // But actually, we CAN do this if we use a ResizeObserver in a real app. Let's just use CSS scale: `scale(var(--scale-factor))` and calculate it.
          // For now, I'll use a generic scale that works well. Or better, just hardcode the dimensions and use zoom, or let the parent scale it.
          background: '#FFFFFF',
          overflow: 'hidden',
          fontFamily: "-apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
        }}
        ref={(el) => {
          if (el && el.parentElement) {
            const scale = el.parentElement.offsetWidth / 1122;
            el.style.transform = `scale(${scale})`;
          }
        }}
        >
          {/* Wave Background */}
          <svg className="wave" viewBox="0 0 1122 793" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="panelGradLive" x1="0%" y1="0%" x2="100%" y2="100%">
                {gradientStops.map((stop, i) => (
                  <stop key={i} offset={`${stop.offset}%`} stopColor={stop.color} />
                ))}
              </linearGradient>
            </defs>
            <path
              d="M420,0 C330,70 300,150 340,230 C380,310 300,390 340,470 C380,550 300,630 340,710 C360,745 380,770 355,793 L0,793 L0,0 Z"
              fill={isGradient ? 'url(#panelGradLive)' : solidColor}
            />
          </svg>

          {/* Left Brand Panel */}
          <div className="brand" style={{
            position: 'absolute', top: 0, left: 0, height: '100%', width: '34%',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: '48px 40px 40px 56px', zIndex: 2, color: textColor
          }}>
            <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: logoTextColor }}>
              <div className="mark" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <g transform="translate(100,103)">
                    <path d="M -56 -7 A 58 58 0 1 1 43 45" fill="none" stroke={logoTextColor} strokeWidth="4.2" opacity="0.5" />
                    <line x1="-6" y1="-42" x2="36" y2="16" stroke={logoTextColor} strokeWidth="5.2" strokeLinecap="round" />
                    <line x1="36" y1="16" x2="-33" y2="29" stroke={logoTextColor} strokeWidth="5.2" strokeLinecap="round" />
                    <line x1="-33" y1="29" x2="-6" y2="-42" stroke={logoTextColor} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                    <circle cx="-6" cy="-42" r="10" fill={logoTextColor} />
                    <circle cx="36" cy="16" r="14.5" fill={logoTextColor} />
                    <circle cx="-33" cy="29" r="7.3" fill={logoTextColor} />
                    <circle cx="43" cy="45" r="3.6" fill={logoTextColor} />
                  </g>
                </svg>
              </div>
              <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '0.02em', marginTop: '3px' }}>AUXOSYS</span>
            </div>
            <div className="brand-mid" style={{ maxWidth: '210px' }}>
              <span style={{
                display: 'inline-block', fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', padding: '5px 12px', borderRadius: '100px',
                marginBottom: '14px', background: 'rgba(255, 255, 255, 0.18)'
              }}>{certType || 'Certificate'}</span>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.4 }}>Building intelligent digital products that scale businesses</h4>
              {fields.employeeId && (
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11.5px', marginTop: '8px', opacity: 0.85, margin: 0 }}>
                  Emp. ID: {fields.employeeId}
                </p>
              )}
            </div>
            <div className="brand-foot" style={{ fontSize: '12px', letterSpacing: '0.05em', opacity: 0.9 }}>
              auxosys.com · careers@auxosys.com
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="content" style={{
            position: 'absolute', top: 0, right: 0, height: '100%', width: '66%',
            padding: '140px 64px 44px', display: 'flex', flexDirection: 'column',
            zIndex: 2, alignItems: 'center', textAlign: 'center'
          }}>
            <div className="watermark" style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '520px', height: '520px', zIndex: -1, pointerEvents: 'none', opacity: 0.035
            }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(100,103)">
                  <path d="M -56 -7 A 58 58 0 1 1 43 45" fill="none" stroke="#000000" strokeWidth="4.2" />
                  <line x1="-6" y1="-42" x2="36" y2="16" stroke="#000000" strokeWidth="5.2" strokeLinecap="round" />
                  <line x1="36" y1="16" x2="-33" y2="29" stroke="#000000" strokeWidth="5.2" strokeLinecap="round" />
                  <line x1="-33" y1="29" x2="-6" y2="-42" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="-6" cy="-42" r="10" fill="#000000" />
                  <circle cx="36" cy="16" r="14.5" fill="#000000" />
                  <circle cx="-33" cy="29" r="7.3" fill="#000000" />
                  <circle cx="43" cy="45" r="3.6" fill="#000000" />
                </g>
              </svg>
            </div>

            <div style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#14B8A6', marginBottom: '10px' }}>
              {fields.eyebrow}
            </div>
            <div style={{ fontSize: '34px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 26px' }}>
              {fields.title}
            </div>
            <div style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 6px' }}>
              {fields.presentedLine}
            </div>
            <div style={{ fontSize: '30px', fontWeight: 700, color: '#0F172A', margin: '4px 0 18px', fontFamily: 'Georgia, serif', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '14px', display: 'inline-block' }}>
              {recipientName || 'Recipient Name'}
            </div>
            <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.85, maxWidth: '480px', marginBottom: 'auto' }} dangerouslySetInnerHTML={{ __html: fields.bodyHtml }}></div>

            <div className="foot" style={{ display: 'flex', justifyContent: 'flex-start', gap: '48px', alignItems: 'flex-end', marginTop: '48px', width: '100%' }}>
              {signatures.map((sig, i) => (
                <div key={i} className="sig" style={{ textAlign: 'center' }}>
                  {sig.image_url ? (
                    <img src={sig.image_url} alt="signature" style={{ height: '46px', objectFit: 'contain', marginBottom: '6px' }} />
                  ) : (
                    <div style={{ width: '150px', height: '1px', background: '#CBD5E1', marginBottom: '8px' }}></div>
                  )}
                  {sig.image_url && <div style={{ width: '150px', height: '1px', background: '#CBD5E1', marginBottom: '8px' }}></div>}
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>{sig.name}</div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>{sig.designation}</div>
                </div>
              ))}
            </div>

            <div className="meta" style={{ position: 'absolute', bottom: '44px', right: '64px', textAlign: 'right' }}>
              <div style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', marginBottom: '4px' }}>
                Cert. ID — {certificateNumber}
              </div>
              <div style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#94A3B8', marginBottom: '4px' }}>
                Issued {issueDateFormatted}
              </div>
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="verify QR" style={{ width: '64px', height: '64px', marginLeft: 'auto', marginTop: '8px' }} />
              ) : (
                <div style={{ width: '64px', height: '64px', marginLeft: 'auto', marginTop: '8px', border: '1px solid #E2E8F0', padding: '12px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z" /></svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
