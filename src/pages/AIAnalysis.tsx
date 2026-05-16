/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

interface Signal {
  id: string;
  ticker: string;
  name: string;
  action: 'BUY' | 'SELL';
  entry: number;
  target: number;
  sl: number;
  confidence: number;
  patterns: string[];
  timestamp: any;
}

export default function AIAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [latestSignal, setLatestSignal] = useState<Signal | null>(null);

  const statuses = [
    'Initializing Neural Processing...',
    'Scanning Global Indices...',
    'Analyzing Price Action Patterns...',
    'Evaluating RSI & MACD Convergence...',
    'Calculating Fibonacci Retracements...',
    'Finalizing Risk-Reward Ratio...',
    'Signal Generated.'
  ];

  useEffect(() => {
    // Listen for the latest signal from Firestore
    const q = query(collection(db, 'signals'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Signal[];
      if (data.length > 0) {
        setLatestSignal(data[0]);
      }
    });

    return () => unsubscribe();
  }, []);

  const runAnalysis = () => {
    if (analyzing) return;
    setAnalyzing(true);
    setProgress(0);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + (100 / (statuses.length * 5)), 100));
    }, 100);

    const textInterval = setInterval(() => {
      if (currentStep < statuses.length) {
        setStatusText(statuses[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        clearInterval(textInterval);
        setTimeout(() => {
          setAnalyzing(false);
        }, 1000);
      }
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 min-h-screen">
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 text-cyan-400 text-[10px] font-mono mb-2 uppercase tracking-[0.25em]">
          <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          Active Neural Scan: NSE_BSE_INDICES
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Bharat Analysis <span className="opacity-30 italic font-light">Terminal</span></h2>
        <p className="text-slate-400 font-light">Deploy advanced neural processing for high-conviction market signals.</p>
      </div>

      <div className="flex justify-center mb-16 relative">
        <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full scale-50 pointer-events-none"></div>
        <Button 
          size="lg" 
          onClick={runAnalysis}
          disabled={analyzing}
          className="h-24 w-24 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl transition-all hover:scale-105 active:scale-95 group"
        >
          {analyzing ? (
             <Cpu className="w-10 h-10 text-cyan-400 animate-spin" />
          ) : (
            <Sparkles className="w-10 h-10 text-cyan-400 group-hover:text-white transition-colors" />
          )}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {analyzing ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5 backdrop-blur-md">
              <motion.div 
                className="bg-cyan-400 h-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                animate={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-cyan-400 font-mono text-xs tracking-widest uppercase animate-pulse">
              {statusText}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl bg-white/3 border border-white/5 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <div className="inset-0 absolute bg-gradient-to-t from-cyan-500/5 to-transparent" />
                  <div className="w-1/2 h-[2px] bg-cyan-400/20 rounded animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          latestSignal && (
            <motion.div
              key="signal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="glass-card overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
                   <svg width="160" height="160" viewBox="0 0 120 120">
                     <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
                     <path d="M20 60 Q 40 20, 60 60 T 100 60" fill="none" stroke="currentColor" strokeWidth="1" />
                   </svg>
                </div>

                <div className={`h-1 w-full ${latestSignal.action === 'BUY' ? 'bg-emerald-400' : 'bg-rose-400'} shadow-[0_0_15px_rgba(16,185,129,0.5)]`} />
                <CardContent className="p-10">
                  <div className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                        <span className="text-4xl font-black tracking-tighter text-white">{latestSignal.ticker}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <Badge className={`text-[10px] font-black tracking-widest px-3 py-0.5 rounded-full ${latestSignal.action === 'BUY' ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30' : 'bg-rose-400/20 text-rose-400 border-rose-400/30'}`}>
                            {latestSignal.action} SIGNAL
                          </Badge>
                          <span className={`${latestSignal.action === 'BUY' ? 'text-emerald-400' : 'text-rose-400'} text-[10px] font-bold uppercase tracking-tighter`}>Bullish Patterns</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white">{latestSignal.name || 'Equity Asset'}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1 font-bold">Confidence</div>
                      <div className="text-5xl font-black text-cyan-400 text-glow-cyan tracking-tighter">{latestSignal.confidence}<span className="text-xl opacity-30">%</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 rounded-2xl bg-black/20 border border-white/5">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Entry Zone</div>
                      <div className="text-2xl font-mono font-bold text-white tracking-tight">${latestSignal.entry}</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-black/20 border border-white/5">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Target Profit</div>
                      <div className="text-2xl font-mono font-bold text-cyan-400 tracking-tight">${latestSignal.target}</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-black/20 border border-white/5 border-l-rose-500/50">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Stop Loss</div>
                      <div className="text-2xl font-mono font-bold text-rose-400 tracking-tight">${latestSignal.sl}</div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <div className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      Neural Patterns Catalogued
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {latestSignal.patterns?.map((pattern, i) => (
                        <div key={i} className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] text-slate-300 font-medium hover:bg-white/10 transition-colors cursor-default">
                          {pattern}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
