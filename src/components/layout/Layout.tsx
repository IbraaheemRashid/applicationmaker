import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SettingsDrawer } from '../SettingsDrawer';
import { Tour } from '../Tour';

export function Layout() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      <main className="ml-56 px-10 py-8">
        <div className="max-w-5xl mx-auto fade-in">
          <Outlet />
        </div>
      </main>
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Tour />
    </div>
  );
}
