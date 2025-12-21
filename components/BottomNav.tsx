import React from 'react';
import * as _ReactRouterDOM from 'react-router-dom';
import { Home, Clapperboard, Tv, Search } from 'lucide-react';

// Fix: Cast react-router-dom to any to avoid type errors with missing members
const { Link, useLocation } = _ReactRouterDOM as any;

const BottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 z-50">
      <div className="flex justify-around items-center h-16 pb-safe">
        <NavItem to="/" icon={<Home className="w-6 h-6" />} label="Home" active={isActive('/')} />
        <NavItem to="/movies" icon={<Clapperboard className="w-6 h-6" />} label="Movies" active={isActive('/movies')} />
        <NavItem to="/series" icon={<Tv className="w-6 h-6" />} label="Series" active={isActive('/series')} />
        <NavItem to="/search" icon={<Search className="w-6 h-6" />} label="Search" active={isActive('/search')} />
      </div>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
    {icon}
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </Link>
);

export default BottomNav;