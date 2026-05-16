/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Cpu, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut, 
  LogIn,
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
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// Components
import ThreeBackground from './components/ThreeBackground';
import TickerMarquee from './components/TickerMarquee';

function Navbar() {
  const { user, isAdmin, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Signals', path: '/ai-analysis', icon: <Cpu className="w-4 h-4" /> },
    { name: 'NSE/BSE Market', path: '/market', icon: <TrendingUp className="w-4 h-4" /> },
    { name: 'Community Hub', path: '/community', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  if (user) {
    navItems.unshift({ name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> });
  }

  if (isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin', icon: <ShieldCheck className="w-4 h-4" /> });
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
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden lg:block">
                <div className="text-[10px] text-white font-bold leading-none mb-1 uppercase tracking-wider">{user.displayName}</div>
                <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-tighter">AI Tier Member</div>
              </div>
              <Avatar className="w-8 h-8 ring-1 ring-white/20">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={logout} className="text-slate-400 hover:text-rose-400">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => window.location.href = '/login'} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 h-9 rounded-full text-xs font-bold transition-all backdrop-blur-md">
              SIGN UP / LOGIN
            </Button>
          )}
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
            {user ? (
              <Button onClick={logout} variant="destructive" className="w-full">Disconnect</Button>
            ) : (
              <Button onClick={login} className="w-full bg-amber-600">Connect</Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function App() {
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
          <Route path="/admin" element={<Admin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
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
