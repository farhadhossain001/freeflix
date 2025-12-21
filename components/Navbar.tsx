import React, { useState, useEffect } from 'react';
import * as _ReactRouterDOM from 'react-router-dom';
import { Search, Bell, User, Menu, X } from 'lucide-react';

// Fix: Cast react-router-dom to any to avoid type errors with missing members
const { Link, useLocation } = _ReactRouterDOM as any;

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'Series', path: '/series' },
    { name: 'New & Popular', path: '/latest' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-4 md:px-12 py-4
        ${isScrolled ? 'bg-zinc-950/90 backdrop-blur-md shadow-2xl py-3' : 'bg-gradient-to-b from-black/80 to-transparent'}
        `}
      >
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-8 md:gap-12">
            {/* Logo */}
            <Link to="/" className="relative group">
               <span className="text-red-600 text-2xl md:text-3xl font-extrabold tracking-tighter uppercase scale-100 transition-transform group-hover:scale-105 inline-block">
                 FreeFlix
               </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.path} 
                  className={`text-sm font-medium transition-all duration-200 hover:text-white 
                  ${location.pathname === link.path ? 'text-white font-bold' : 'text-zinc-300'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4 md:gap-6 text-white">
            <Link to="/search" className="hover:text-zinc-300 transition-colors p-1">
               <Search className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            
            <button className="hover:text-zinc-300 transition-colors hidden sm:block p-1 relative">
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border border-black"></span>
            </button>
            
            <div className="group flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-white transition-all">
                    <User className="w-5 h-5 text-white" />
                </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-white p-1"
            >
                <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-[60] transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-zinc-900 border-l border-zinc-800 shadow-2xl p-6 flex flex-col">
            <div className="flex justify-end mb-8">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-400 hover:text-white">
                    <X className="w-8 h-8" />
                </button>
            </div>
            
            <div className="flex flex-col space-y-6">
                {navLinks.map((link) => (
                    <Link 
                        key={link.name}
                        to={link.path}
                        className={`text-xl font-medium ${location.pathname === link.path ? 'text-red-500' : 'text-zinc-300'}`}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>

            <div className="mt-auto border-t border-zinc-800 pt-6">
                 <p className="text-xs text-zinc-500 text-center">FreeFlix Mobile</p>
            </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;