import { NavLink } from 'react-router-dom';
import { Sparkles, ListChecks, MessageSquare, Settings as SettingsIcon } from 'lucide-react';

interface SidebarProps {
  onOpenSettings: () => void;
}

const navItems = [
  { to: '/', icon: Sparkles, label: 'Apply', hint: 'eval → tailor', tourId: 'nav-apply' },
  { to: '/pipeline', icon: ListChecks, label: 'Pipeline', hint: 'tracker', tourId: 'nav-pipeline' },
  { to: '/interview', icon: MessageSquare, label: 'Interview', hint: 'prep & stories', tourId: 'nav-interview' },
];

export function Sidebar({ onOpenSettings }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 border-r border-neutral-900 flex flex-col z-40 bg-neutral-950">
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-neutral-100 tracking-tight">apply</span>
          <span className="text-lg font-semibold text-accent-500 tracking-tight">now</span>
        </div>
        <p className="text-[10px] uppercase tracking-wider text-neutral-600 mt-0.5">
          two minutes to apply
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, hint, tourId }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            data-tour={tourId}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={15}
                  className={isActive ? 'text-accent-500' : 'text-neutral-600 group-hover:text-neutral-400'}
                />
                <span className="font-medium">{label}</span>
                <span className="ml-auto text-[10px] text-neutral-700 group-hover:text-neutral-600">{hint}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-1">
        <button
          onClick={onOpenSettings}
          data-tour="nav-settings"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900/60 transition-colors cursor-pointer"
        >
          <SettingsIcon size={15} className="text-neutral-600" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
