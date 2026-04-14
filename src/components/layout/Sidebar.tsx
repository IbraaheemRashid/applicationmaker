import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Sparkles,
  MessageSquare,
  Radar,
  Settings,
  Zap,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/evaluate', icon: Sparkles, label: 'Auto Pipeline' },
  { to: '/tracker', icon: ClipboardList, label: 'Tracker' },
  { to: '/scan', icon: Radar, label: 'Portal Scanner' },
  { to: '/cv-builder', icon: FileText, label: 'CV Builder' },
  { to: '/interview', icon: MessageSquare, label: 'Interview Prep' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-900 border-r border-surface-800 flex flex-col z-40">
      <div className="p-6 border-b border-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">ApplyNow</h1>
            <p className="text-xs text-surface-400">Smart Job Tracking</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium border ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border-primary-500/30'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800 border-transparent'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-surface-800">
        <div className="bg-gradient-to-r from-primary-600/10 to-accent-600/10 border border-primary-500/20 rounded-lg p-3">
          <p className="text-xs text-surface-300">
            Powered by <span className="text-primary-400 font-medium">career-ops</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
