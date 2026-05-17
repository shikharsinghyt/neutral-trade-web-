/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Cpu, 
  MessageSquare, 
  LayoutDashboard, 
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Pages
import Home from './pages/Home';
import AIAnalysis from './pages/AIAnalysis';
import Market from './pages/Market';
import Community from './pages/Community';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';

// Components
import ThreeBackground from './components/ThreeBackground';
import TickerMarquee from './components/TickerMarquee';

function Navbar() {
  const { user, isAdmin, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isVerified = sessionStorage.getItem('admin_verified') === 'true';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Signals', path: '/ai-analysis', icon: <Cpu className="w-4 h-4" /> },
    { name: 'NSE/BSE Market', path: '/market', icon: <TrendingUp className="w-4 h-4" /> },
    { name: 'Community Hub', path: '/community', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  // If verified in this session, provide easy return to portal
  if (isVerified) {
    navItems.push({ 
      name: 'Admin', 
      path: '/admin-portal', 
      icon: <ShieldCheck className="w-4 h-4 text-cyan-400" /> 
    });
  }

  return (
    <nav className="sticky top-0 z-50 w-full glass-nav px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-cyan-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-lg font-bold text-white">N</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-white uppercase">NEURAL<span className="text-cyan-400">TRADE</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] transition-all hover:text-cyan-400 ${
                location.pathname === item.path ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/dashboard">
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 h-9 rounded-full text-xs font-bold transition-all backdrop-blur-md">
              DASHBOARD
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-6 flex flex-col gap-6"
          >
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-lg font-bold text-white uppercase tracking-widest"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="w-full">
              <Button className="w-full bg-cyan-500 text-slate-950 font-bold uppercase tracking-widest">Get Started</Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function App() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-200">
      <ThreeBackground />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai-analysis" element={<AIAnalysis />} />
          <Route path="/market" element={<Market />} />
          <Route path="/community" element={<Community />} />
          <Route path="/admin-portal" element={<Admin />} />
          <Route path="/admin" element={<Navigate to="/admin-portal" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      
      <footer className="h-10 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center overflow-hidden z-10 sticky bottom-0">
        <TickerMarquee />
        <div className="hidden lg:block ml-auto pr-6 text-slate-500 text-[10px] italic tracking-tight pointer-events-none bg-black/40 pl-4 h-full flex items-center z-20">
          NSE/BSE Indian Market Engine v4.0.2 - Live High-Fidelity Data
        </div>
      </footer>
    </div>
  );
}
