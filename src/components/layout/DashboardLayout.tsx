import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ConstellationBackground } from '../ui/ConstellationBackground';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-950">
      <ConstellationBackground variant="subtle" animated={false} />
      <Navbar />
      <Sidebar />
      <main className="pt-16 pl-64 min-h-screen transition-all duration-300">
        <div className="p-6 lg:p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};
