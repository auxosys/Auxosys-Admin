import React, { useState } from 'react';
import { Inbox, Send, FileText, Star, Trash2, Layers, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const STANDARD_FOLDERS = [
  { path: 'INBOX', label: 'Inbox', icon: Inbox },
  { path: 'SENT', label: 'Sent', icon: Send },
  { path: 'DRAFTS', label: 'Drafts', icon: FileText },
  { path: 'STARRED', label: 'Starred', icon: Star },
  { path: 'TRASH', label: 'Trash', icon: Trash2 },
];

export default function FolderSidebar({ activeFolder, onSelectFolder, unreadCount }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className={`folder-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <style>{`
        .folder-sidebar {
          width: 200px;
          flex-shrink: 0;
          border-right: 1px solid #E2E8F0;
          padding: 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #FFFFFF;
          transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }
        .folder-sidebar.collapsed {
          width: 60px;
          padding: 16px 8px;
          align-items: center;
        }
        .fs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 6px;
          height: 24px;
        }
        .fs-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748B;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          overflow: hidden;
        }
        .fs-toggle-btn {
          border: none;
          background: transparent;
          color: #64748B;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .fs-toggle-btn:hover {
          background: #F1F5F9;
          color: #0F172A;
        }
        .fs-folder-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }
        .fs-folder {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          text-align: left;
          padding: 9px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-size: 13.5px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .folder-sidebar.collapsed .fs-folder {
          justify-content: center;
          padding: 10px;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          margin: 0 auto;
        }
        .fs-folder:hover {
          background: #F8FAFC;
          color: #0F172A;
        }
        .fs-folder.active {
          background: #EFF6FF;
          color: #1D4ED8;
          font-weight: 700;
        }
        .fs-folder-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .fs-folder .badge {
          font-size: 11px;
          font-weight: 700;
          color: #FFFFFF;
          background: #EF4444;
          border-radius: 100px;
          padding: 1px 7px;
        }
        .folder-sidebar.collapsed .badge-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 9px;
          height: 9px;
          background: #EF4444;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
        }
      `}</style>

      <div className="fs-header">
        {!isCollapsed && (
          <div className="fs-label">
            <Layers size={13} className="text-gray-400" />
            Folders
          </div>
        )}
        <button
          className="fs-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className="fs-folder-list">
        {STANDARD_FOLDERS.map((f) => {
          const Icon = f.icon;
          const isActive = (f.path.toUpperCase() === (activeFolder || '').toUpperCase());
          return (
            <button
              key={f.path}
              className={`fs-folder ${isActive ? 'active' : ''}`}
              onClick={() => onSelectFolder(f.path)}
              title={isCollapsed ? f.label : undefined}
            >
              <div className="fs-folder-left">
                <Icon size={18} color={isActive ? '#1D4ED8' : '#64748B'} />
                {!isCollapsed && <span>{f.label}</span>}
              </div>
              {!isCollapsed && f.path === 'INBOX' && unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
              {isCollapsed && f.path === 'INBOX' && unreadCount > 0 && (
                <span className="badge-dot" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

