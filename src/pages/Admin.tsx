/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'motion/react';
import { Shield, Send, AlertCircle } from 'lucide-react';

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900 border-red-900/50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400">This sector is restricted to administrators only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

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
    } catch (error) {
      console.error("Error adding signal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/10">
          <Shield className="text-cyan-400 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Command Center</h2>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest leading-none mt-1">Status: Authorized Personnel Only</p>
        </div>
      </div>

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

            <Button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 h-14 text-sm font-black tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              disabled={loading}
            >
              {loading ? 'MODULATING...' : 'INITIATE BROADCAST'}
              {!loading && <Send className="ml-3 w-5 h-5" />}
            </Button>

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
  );
}
