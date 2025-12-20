import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, User, Menu } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide Navbar on mobile (since we have BottomNav) except for top branding
  // But strictly speaking, typical responsive apps show a top bar for Logo/Profile on mobile too.

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-zinc-950/95 backdrop-blur-sm shadow-md' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Logo & Desktop Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="text-red-600 text-2xl font-bold tracking-tighter uppercase">
              FreeFlix
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className={`text-sm font-medium transition-colors hover:text-white ${location.pathname === '/' ? 'text-white' : 'text-zinc-300'}`}>Home</Link>
              <Link to="/movies" className={`text-sm font-medium transition-colors hover:text-white ${location.pathname === '/movies' ? 'text-white' : 'text-zinc-300'}`}>Movies</Link>
              <Link to="/series" className={`text-sm font-medium transition-colors hover:text-white ${location.pathname === '/series' ? 'text-white' : 'text-zinc-300'}`}>Series</Link>
              <Link to="/latest" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">New & Popular</Link>
            </div>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-6 text-white">
            <Link to="/search" className="hover:text-zinc-300 transition-colors">
               <Search className="w-5 h-5" />
            </Link>
            <button className="hover:text-zinc-300 transition-colors hidden sm:block">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-white transition-all">
              <User className="w-5 h-5 text-zinc-400" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;