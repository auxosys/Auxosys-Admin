import React from "react";
import { Save, FileText, CheckCircle2 } from "lucide-react";

export default function RobotsManager({ settings, updateSetting, saveSettings, canWrite, saving }) {
  
  const defaultRobotsTxt = `User-agent: *\nAllow: /\n\nSitemap: https://www.auxosys.com/sitemap.xml`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#132242] flex items-center gap-2">
            <FileText size={18} className="text-[#132242]" />
            Robots.txt Editor
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Control which URLs search engine crawlers can access on your site.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <a
            href="https://www.auxosys.com/robots.txt"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium text-xs transition-colors"
          >
            Preview Live File
          </a>
          {canWrite && (
            <button
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-1.5 bg-[#132242] hover:bg-[#0d1830] text-white rounded-lg font-medium text-xs transition-colors disabled:opacity-50"
            >
              {saving ? <span className="animate-spin text-white">⭮</span> : <Save size={14} />}
              {saving ? "Saving..." : "Save Robots.txt"}
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex items-start gap-3 mb-5">
          <CheckCircle2 size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Danger Zone</h3>
            <p className="text-xs text-amber-700 mt-1">
              Be very careful when editing your robots.txt. A single incorrect Disallow rule can completely block Google from crawling your entire website. If left blank, a safe default will be used.
            </p>
          </div>
        </div>

        <label className="block text-sm font-semibold text-gray-700 mb-2">File Contents</label>
        <textarea
          className="w-full font-mono text-sm p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[300px] focus:outline-none focus:ring-2 focus:ring-[#132242] focus:bg-white transition-all"
          value={settings.robots_txt ?? defaultRobotsTxt}
          onChange={(e) => updateSetting("robots_txt", e.target.value)}
          placeholder={defaultRobotsTxt}
          spellCheck="false"
          disabled={!canWrite}
        />
      </div>
    </div>
  );
}
