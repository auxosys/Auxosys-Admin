import React, { useState, useEffect, useMemo, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { icons } from 'lucide-react';
import { listIcons, buildIcon, buildLucideIcon, PALETTES } from '../helper/iconEngine';

const IconStudio = () => {
  // We'll support both original 3D-Glass icons and Lucide icons
  const originalIcons = useMemo(() => listIcons(), []);
  
  // Lucide icons list
  const lucideIconNames = useMemo(() => Object.keys(icons), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIconName, setSelectedIconName] = useState('pin');
  const [isLucide, setIsLucide] = useState(false); // false = original, true = lucide

  const [size, setSize] = useState(256);
  const [grain, setGrain] = useState(true);
  const [shadow, setShadow] = useState(true);

  // Custom Palette state
  const [palette, setPalette] = useState({ ...PALETTES.aurora });
  
  // Update state if preset is chosen
  const handlePresetChange = (presetName) => {
    if (PALETTES[presetName]) {
      setPalette({ ...PALETTES[presetName] });
    }
  };

  const handleColorChange = (key, value) => {
    setPalette(prev => ({ ...prev, [key]: value }));
  };

  // Filter Lucide Icons based on search query
  const filteredLucideIcons = useMemo(() => {
    if (!searchQuery) return lucideIconNames.slice(0, 50); // Show first 50 by default to prevent lag
    const lowerQuery = searchQuery.toLowerCase();
    return lucideIconNames.filter(name => name.toLowerCase().includes(lowerQuery)).slice(0, 50);
  }, [searchQuery, lucideIconNames]);

  const svgString = useMemo(() => {
    if (!selectedIconName) return '';
    try {
      if (!isLucide) {
        return buildIcon(selectedIconName, { size, palette, grain, shadow });
      } else {
        const IconComponent = icons[selectedIconName];
        if (!IconComponent) return '';
        const fullSvg = renderToStaticMarkup(<IconComponent size={24} strokeWidth={2} />);
        const match = fullSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
        const innerContents = match ? match[1] : '';
        return buildLucideIcon(innerContents, { size, palette, grain, shadow });
      }
    } catch (e) {
      console.error(e);
      return '';
    }
  }, [selectedIconName, isLucide, size, palette, grain, shadow]);

  const handleDownloadSVG = () => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedIconName}-custom.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectOriginal = (id) => {
    setSelectedIconName(id);
    setIsLucide(false);
  };

  const selectLucide = (name) => {
    setSelectedIconName(name);
    setIsLucide(true);
  };

  // Helper to render a small preview of lucide icon
  const renderLucidePreview = (name) => {
    const IconComponent = icons[name];
    if (!IconComponent) return null;
    return <IconComponent size={32} className="text-teal-600 mb-2" strokeWidth={1.5} />;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 flex-shrink-0">Icon Studio</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
        {/* LEFT COL: Icon Gallery */}
        <div className="lg:col-span-1 border rounded-xl p-4 bg-white shadow-sm flex flex-col min-h-0">
          <h2 className="text-lg font-semibold mb-3 text-slate-800">Select Icon</h2>
          
          <input 
            type="text" 
            placeholder="Search 1400+ icons..." 
            className="w-full px-3 py-2 border rounded-md mb-4 text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <div className="overflow-y-auto flex-1 pr-2 space-y-6">
            {/* Original Solid Icons (Only show if search is empty) */}
            {!searchQuery && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Original 3D Blocks</h3>
                <div className="grid grid-cols-2 gap-3">
                  {originalIcons.map(icon => (
                    <button
                      key={icon.id}
                      onClick={() => selectOriginal(icon.id)}
                      className={`p-3 border rounded-lg transition-all flex flex-col items-center gap-2 ${!isLucide && selectedIconName === icon.id ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200' : 'hover:bg-slate-50 border-slate-200'}`}
                      title={icon.name}
                    >
                      <div
                        className="w-10 h-10"
                        dangerouslySetInnerHTML={{ __html: buildIcon(icon.id, { size: 40, palette: PALETTES.aurora, grain: false, shadow: false }) }}
                      />
                      <span className="text-xs text-center font-medium truncate w-full">{icon.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lucide Icons */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {searchQuery ? 'Search Results' : 'Lucide Icons'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {filteredLucideIcons.map(name => (
                  <button
                    key={name}
                    onClick={() => selectLucide(name)}
                    className={`p-3 border rounded-lg transition-all flex flex-col items-center gap-2 ${isLucide && selectedIconName === name ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200' : 'hover:bg-slate-50 border-slate-200'}`}
                    title={name}
                  >
                    {renderLucidePreview(name)}
                    <span className="text-[10px] text-slate-600 text-center font-medium truncate w-full">{name}</span>
                  </button>
                ))}
              </div>
              {filteredLucideIcons.length === 50 && !searchQuery && (
                <p className="text-xs text-slate-400 text-center mt-4">Search to see more icons...</p>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE COL: Controls */}
        <div className="lg:col-span-1 border rounded-xl p-6 bg-white shadow-sm flex flex-col min-h-0 overflow-y-auto">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Color Palette</h2>
            <div className="flex gap-2 mb-6 flex-wrap">
              {Object.keys(PALETTES).map(preset => (
                <button
                  key={preset}
                  onClick={() => handlePresetChange(preset)}
                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-md capitalize font-medium text-slate-700 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {['a', 'b', 'c', 'd', 'edge'].map(colorKey => (
                <div key={colorKey} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <label className="text-xs font-medium text-slate-600 capitalize">{colorKey === 'edge' ? 'Shadow/Edge' : `Stop ${colorKey.toUpperCase()}`}</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono w-14 text-right">{palette[colorKey]}</span>
                    <input
                      type="color"
                      value={palette[colorKey]}
                      onChange={(e) => handleColorChange(colorKey, e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t mt-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Settings</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="text-xs font-medium text-slate-700">Size ({size}px)</span>
                <input 
                  type="range" min="64" max="512" step="32" 
                  value={size} onChange={e => setSize(Number(e.target.value))}
                  className="w-1/2"
                />
              </label>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <input type="checkbox" checked={grain} onChange={e => setGrain(e.target.checked)} className="rounded text-teal-600 w-4 h-4" />
                  <span className="text-xs font-medium text-slate-700">Frosted Grain Effect</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <input type="checkbox" checked={shadow} onChange={e => setShadow(e.target.checked)} className="rounded text-teal-600 w-4 h-4" />
                  <span className="text-xs font-medium text-slate-700">Inner Glow & Drop Shadow</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COL: Preview */}
        <div className="lg:col-span-2 border rounded-xl p-6 bg-white shadow-sm flex flex-col min-h-0">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Live Preview</h2>
          
          <div className="flex-1 rounded-lg flex items-center justify-center border overflow-hidden min-h-[300px] mb-6 checkerboard relative">
            <div dangerouslySetInnerHTML={{ __html: svgString }} className="transition-all duration-300 transform scale-100" />
            
            {/* Download Button Overlay */}
            <div className="absolute bottom-4 right-4">
              <button 
                onClick={handleDownloadSVG}
                className="bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 text-white font-medium py-2.5 px-5 rounded-full transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download SVG
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .checkerboard {
          background-image: 
            linear-gradient(45deg, #f8fafc 25%, transparent 25%), 
            linear-gradient(-45deg, #f8fafc 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #f8fafc 75%), 
            linear-gradient(-45deg, transparent 75%, #f8fafc 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          background-color: white;
        }
      `}} />
    </div>
  );
};

export default IconStudio;
