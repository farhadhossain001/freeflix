import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Details from './pages/Details';
import SearchPage from './pages/Search';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-white font-sans antialiased selection:bg-red-600 selection:text-white">
        <ScrollToTop />
        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Explore type="movie" />} />
            <Route path="/series" element={<Explore type="tv" />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/details/:type/:id" element={<Details />} />
            {/* Fallback routes */}
            <Route path="/latest" element={<Explore type="movie" />} />
          </Routes>
        </main>

        <BottomNav />
        
        {/* Footer for Desktop */}
        <footer className="hidden md:block bg-black/50 py-10 text-center text-zinc-600 text-sm mt-10">
          <div className="max-w-4xl mx-auto px-4">
            <p className="mb-4">FreeFlix &copy; {new Date().getFullYear()}</p>
            <div className="flex justify-center space-x-6">
              <span className="hover:underline cursor-pointer">Privacy</span>
              <span className="hover:underline cursor-pointer">Terms</span>
              <span className="hover:underline cursor-pointer">Help Center</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;