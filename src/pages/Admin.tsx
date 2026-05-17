/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Send, AlertCircle, Trash2, TrendingUp, TrendingDown, LayoutDashboard, Cpu, MessageSquare } from 'lucide-react';

interface Signal {
  id: string;
  ticker: string;
  name: string;
  action: 'BUY' | 'SELL';
  entry: number;
  target: number;
  sl: number;
  confidence: number;
  timestamp: any;
}

export default function Admin() {
  const { user, isAdmin, login, loading: authLoading } = useAuth();
  const [isVerified, setIsVerified] = useState(() => sessionStorage.getItem('admin_verified') === 'true');
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeError, setChallengeError] = useState('');
  const [challengeData, setChallengeData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  
  const [formData, setFormData] = useState({
    ticker: '',
    name: '',
    action: 'BUY',
    entry: '',
    target: '',
    sl: '',
    confidence: '85',
    patterns: ''
  });

  useEffect(() => {
    if (!isVerified) return;
    
    const q = query(collection(db, 'signals'), orderBy('timestamp', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSignals(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Signal[]);
    });

    return () => unsubscribe();
  }, [isVerified]);

  const handleChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChallengeLoading(true);
    setChallengeError('');

    // Simulate small delay for "neural processing" effect
    setTimeout(() => {
      const emailLower = challengeData.email.toLowerCase().trim();
      const emailMatch = emailLower === 'rajnibhadoriya324@gmail.com' || emailLower === 'rajnibhadoriya@gmail.com' || emailLower === 'rajnibhadoriya';
      const passwordMatch = challengeData.password === 'godisalwayswithme';

      if (emailMatch && passwordMatch) {
        setIsVerified(true);
        sessionStorage.setItem('admin_verified', 'true');
      } else {
        setChallengeError('Neural verification failed. Credentials invalid.');
      }
      setChallengeLoading(false);
    }, 800);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/10">
              <Shield className="w-10 h-10 text-cyan-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Admin Portal</h2>
              <p className="text-slate-400 font-medium">Initialize secondary neural verification</p>
            </div>
          </div>

          <div className="glass-card p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Shield className="w-24 h-24" />
            </div>
            
            <form onSubmit={handleChallengeSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Access Identity</Label>
                  <Input 
                    type="email"
                    placeholder="Enter Verified Email"
                    value={challengeData.email}
                    onChange={e => setChallengeData({...challengeData, email: e.target.value})}
                    className="bg-black/40 border-white/10 text-white h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Security Cipher</Label>
                  <Input 
                    type="password"
                    placeholder="Enter Security Token"
                    value={challengeData.password}
                    onChange={e => setChallengeData({...challengeData, password: e.target.value})}
                    className="bg-black/40 border-white/10 text-white h-12"
                    required
                  />
                </div>
              </div>

              {challengeError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" />
                  {challengeError}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={challengeLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black tracking-widest h-14 rounded-2xl transition-all shadow-lg shadow-cyan-500/20"
              >
                {challengeLoading ? 'VERIFYING...' : 'AUTHORIZE ACCESS'}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'} 
                className="w-full text-[10px] text-slate-500 uppercase tracking-widest hover:text-white"
              >
                Cancel Session
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this signal?')) {
      try {
        await deleteDoc(doc(db, 'signals', id));
      } catch (error) {
        console.error("Error deleting signal:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    if (!user) {
      setError('You must be signed in with Google to broadcast signals.');
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'signals'), {
        ...formData,
        entry: parseFloat(formData.entry),
        target: parseFloat(formData.target),
        sl: parseFloat(formData.sl),
        confidence: parseInt(formData.confidence),
        patterns: formData.patterns.split(',').map(p => p.trim()).filter(p => p),
        timestamp: serverTimestamp(),
        authorId: user?.uid,
        status: 'ACTIVE'
      });
      setSuccess(true);
      setFormData({
        ticker: '',
        name: '',
        action: 'BUY',
        entry: '',
        target: '',
        sl: '',
        confidence: '85',
        patterns: ''
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error adding signal:", err);
      setError(err.message || 'Failed to broadcast signal. Neural uplink failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      {/* Admin Quick Nav */}
      <div className="flex items-center gap-6 mb-8 px-2 overflow-x-auto pb-4 custom-scrollbar lg:overflow-visible">
        <Link to="/dashboard" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors whitespace-nowrap">
          <LayoutDashboard className="w-3.5 h-3.5" />
          Neural Dashboard
        </Link>
        <Link to="/ai-analysis" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors whitespace-nowrap">
          <Cpu className="w-3.5 h-3.5" />
          AI Analysis
        </Link>
        <div className="h-4 w-px bg-white/5" />
        <Link to="/market" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors whitespace-nowrap">
          <TrendingUp className="w-3.5 h-3.5" />
          Market Data
        </Link>
        <Link to="/community" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors whitespace-nowrap">
          <MessageSquare className="w-3.5 h-3.5" />
          Community Hub
        </Link>
      </div>

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Shield className="text-cyan-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Command Center</h2>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest leading-none mt-1">Status: Authorized Personnel Only</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Form Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
            <CardHeader className="pt-8 px-10 pb-4">
              <CardTitle className="text-xl text-white tracking-tight">Signal Broadcast Terminal</CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ticker" className="text-slate-500 uppercase text-[10px] font-bold tracking-widest px-1">Symbol Index</Label>
                    <Input 
                      id="ticker" 
                      placeholder="INDEX_CODE" 
                      value={formData.ticker}
                      onChange={e => setFormData({...formData, ticker: e.target.value.toUpperCase()})}
                      className="bg-black/20 border-white/5 text-white h-12 font-black tracking-tighter"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-500 uppercase text-[10px] font-bold tracking-widest px-1">Asset Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Full Asset Name" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="bg-black/20 border-white/5 text-white h-12"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-500 uppercase text-[10px] font-bold tracking-widest px-1">Operation Vector</Label>
                    <div className="flex gap-3">
                      <Button 
                        type="button"
                        variant={formData.action === 'BUY' ? 'default' : 'outline'}
                        className={`flex-1 h-12 rounded-xl text-xs font-black tracking-widest transition-all ${formData.action === 'BUY' ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400' : 'border-white/5 bg-white/5'}`}
                        onClick={() => setFormData({...formData, action: 'BUY'})}
                      >
                        BUY
                      </Button>
                      <Button 
                        type="button"
                        variant={formData.action === 'SELL' ? 'destructive' : 'outline'}
                        className={`flex-1 h-12 rounded-xl text-xs font-black tracking-widest transition-all ${formData.action === 'SELL' ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 border-rose-400' : 'border-white/5 bg-white/5'}`}
                        onClick={() => setFormData({...formData, action: 'SELL'})}
                      >
                        SELL
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="entry" className="text-slate-500 uppercase text-[10px] font-bold tracking-widest px-1">Entry</Label>
                    <Input 
                      id="entry" 
                      type="number" 
                      step="0.000001"
                      value={formData.entry}
                      onChange={e => setFormData({...formData, entry: e.target.value})}
                      className="bg-black/20 border-white/5 text-white h-12 font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target" className="text-slate-500 uppercase text-[10px] font-bold tracking-widest px-1">Target</Label>
                    <Input 
                      id="target" 
                      type="number" 
                      step="0.000001"
                      value={formData.target}
                      onChange={e => setFormData({...formData, target: e.target.value})}
                      className="bg-black/20 border-white/5 text-cyan-400 h-12 font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sl" className="text-slate-500 uppercase text-[10px] font-bold tracking-widest px-1">Stop</Label>
                    <Input 
                      id="sl" 
                      type="number" 
                      step="0.000001"
                      value={formData.sl}
                      onChange={e => setFormData({...formData, sl: e.target.value})}
                      className="bg-black/20 border-white/5 text-rose-400 h-12 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="confidence" className="text-slate-500 uppercase text-[10px] font-bold tracking-widest px-1">AI Logic Score (%)</Label>
                    <Input 
                      id="confidence" 
                      type="number" 
                      value={formData.confidence}
                      onChange={e => setFormData({...formData, confidence: e.target.value})}
                      className="bg-black/20 border-white/5 text-white h-12 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patterns" className="text-slate-500 uppercase text-[10px] font-bold tracking-widest px-1">Pattern Sequence</Label>
                    <Input 
                      id="patterns" 
                      placeholder="DELVE_CODE" 
                      value={formData.patterns}
                      onChange={e => setFormData({...formData, patterns: e.target.value})}
                      className="bg-black/20 border-white/5 text-slate-300 h-12 text-xs"
                    />
                  </div>
                </div>

                {!user && (
                  <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Firebase Auth Required</p>
                    </div>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">Your neural session is verified, but Firestore requires a secure Google identity to broadcast to global feeds.</p>
                    <Button 
                      type="button"
                      onClick={() => login()}
                      className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 h-10 rounded-xl text-[10px] font-black tracking-widest"
                    >
                      SYNC GOOGLE IDENTITY
                    </Button>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 h-14 text-sm font-black tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  disabled={loading}
                >
                  {loading ? 'MODULATING...' : 'INITIATE BROADCAST'}
                  {!loading && <Send className="ml-3 w-5 h-5" />}
                </Button>

                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center text-[10px] font-bold tracking-widest uppercase">
                    {error}
                  </div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center text-xs font-black tracking-widest uppercase"
                  >
                    Signal Sequence Successfully Published
                  </motion.div>
                )}
              </form>
            </CardContent>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 h-full flex flex-col">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 px-1">Recent Broadcasts</h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {signals.length > 0 ? (
                signals.map((signal) => (
                  <div key={signal.id} className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${signal.action === 'BUY' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                           {signal.action === 'BUY' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                         </div>
                         <div>
                           <div className="text-xs font-black text-white">{signal.ticker}</div>
                           <div className="text-[10px] text-slate-500 font-bold uppercase">{signal.action}</div>
                         </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg"
                        onClick={() => handleDelete(signal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="text-[10px] text-slate-400 px-1 font-mono">E: {signal.entry}</div>
                       <div className="text-[10px] text-cyan-400 px-1 font-mono text-right">T: {signal.target}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-slate-700">
                   <AlertCircle className="w-8 h-8 opacity-20 mb-2" />
                   <div className="text-[9px] uppercase font-bold tracking-widest opacity-30">No Broadcast History</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
