import React from "react";
import { Save, Image as ImageIcon, Video, Share2, Link as LinkIcon } from "lucide-react";

export default function SocialManager({ settings, updateSetting, saveSettings, canWrite, saving }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Share2 size={16} className="text-blue-600" />
              Social Sharing Defaults
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Set fallback images and media for when links are shared on social platforms.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OpenGraph Image */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-gray-400" />
                Default OpenGraph Image
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="https://example.com/og-image.jpg"
                value={settings.default_og_image || ""}
                onChange={(e) => updateSetting("default_og_image", e.target.value)}
                disabled={!canWrite}
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                Fallback image for Facebook, LinkedIn, etc. Recommended: 1200x630px.
              </p>
            </div>

            {/* Twitter Image */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-gray-400" />
                Default Twitter Image
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="https://example.com/twitter-image.jpg"
                value={settings.default_twitter_image || ""}
                onChange={(e) => updateSetting("default_twitter_image", e.target.value)}
                disabled={!canWrite}
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                Fallback image for Twitter summary cards.
              </p>
            </div>

            {/* OpenGraph Video */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1.5">
                <Video size={14} className="text-gray-400" />
                OpenGraph Video URL
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="https://example.com/video.mp4"
                value={settings.og_video || ""}
                onChange={(e) => updateSetting("og_video", e.target.value)}
                disabled={!canWrite}
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                Optional video URL for rich media sharing.
              </p>
            </div>

            {/* Twitter Player */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1.5">
                <Video size={14} className="text-gray-400" />
                Twitter Player URL
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="https://example.com/player"
                value={settings.twitter_player || ""}
                onChange={(e) => updateSetting("twitter_player", e.target.value)}
                disabled={!canWrite}
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                URL to an iframe containing a video/audio player for Twitter.
              </p>
            </div>
          </div>
        </div>

        {canWrite && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#132242] hover:bg-[#0d1830] disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Social Settings"}
            </button>
          </div>
        )}
      </div>

      {/* Live Preview section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Facebook / LinkedIn Preview</h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden max-w-sm mx-auto">
            <div className="w-full aspect-[1.91/1] bg-gray-100 relative">
              {settings.default_og_image ? (
                <img src={settings.default_og_image} alt="OG Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">No image set</div>
              )}
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="text-[10px] text-gray-500 uppercase mb-1">AUXOSYS.COM</div>
              <div className="font-semibold text-sm text-gray-900 leading-tight mb-1 truncate">Auxosys - Default Page Title</div>
              <div className="text-xs text-gray-500 line-clamp-1">Default description for pages without specific metadata.</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Twitter Preview</h4>
          <div className="border border-gray-200 rounded-xl overflow-hidden max-w-sm mx-auto">
            <div className="w-full aspect-[1.91/1] bg-gray-100 relative">
              {settings.default_twitter_image || settings.default_og_image ? (
                <img src={settings.default_twitter_image || settings.default_og_image} alt="Twitter Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">No image set</div>
              )}
            </div>
            <div className="p-3">
              <div className="font-semibold text-sm text-gray-900 leading-tight mb-1 truncate">Auxosys - Default Page Title</div>
              <div className="text-xs text-gray-500 line-clamp-1 mb-1">Default description for pages without specific metadata.</div>
              <div className="text-[11px] text-gray-500 flex items-center gap-1">
                <LinkIcon size={10} /> auxosys.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
