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
  const [signals, setSignals] = useState<Signal[]>([]);

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
    // Listen for recent signals from Firestore
    const q = query(collection(db, 'signals'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Signal[];
      setSignals(data);
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
          // Scroll to results
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }, 1000);
      }
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 min-h-screen">
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
          <div className="space-y-12">
            {signals.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
                {signals.map((signal, index) => (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="glass-card overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
                         <TrendingUp className="w-32 h-32" />
                      </div>

                      <div className={`h-1 w-full ${signal.action === 'BUY' ? 'bg-emerald-400' : 'bg-rose-400'} shadow-[0_0_15px_rgba(16,185,129,0.5)]`} />
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                              <span className="text-2xl font-black tracking-tighter text-white">{signal.ticker}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <Badge className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${signal.action === 'BUY' ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30' : 'bg-rose-400/20 text-rose-400 border-rose-400/30'}`}>
                                  {signal.action} SIGNAL
                                </Badge>
                                <span className={`text-[10px] font-bold uppercase tracking-tight text-slate-500`}>
                                  {signal.timestamp?.seconds ? new Date(signal.timestamp.seconds * 1000).toLocaleDateString() : 'Syncing...'}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-white">{signal.name || 'Equity Asset'}</h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Confidence</div>
                              <div className="text-4xl font-black text-cyan-400 tracking-tighter">{signal.confidence}%</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                          <div className="p-5 rounded-xl bg-black/20 border border-white/5">
                            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Entry</div>
                            <div className="text-xl font-mono font-bold text-white tracking-tight">₹{signal.entry}</div>
                          </div>
                          <div className="p-5 rounded-xl bg-black/20 border border-white/5 border-l-cyan-500/30">
                            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Target</div>
                            <div className="text-xl font-mono font-bold text-cyan-400 tracking-tight">₹{signal.target}</div>
                          </div>
                          <div className="p-5 rounded-xl bg-black/20 border border-white/5 border-l-rose-500/30">
                            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Stop Loss</div>
                            <div className="text-xl font-mono font-bold text-rose-400 tracking-tight">₹{signal.sl}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {signal.patterns?.map((pattern, i) => (
                            <div key={i} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {pattern}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest font-bold">Initializing Signal Feed... No active signals detected.</p>
              </div>
            )}
          </div>
        )
        }
      </AnimatePresence>
    </div>
  );
}
