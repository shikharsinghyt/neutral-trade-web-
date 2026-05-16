/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Neural Processing Active
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tighter leading-none">
            BHARAT<span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-indigo-500">TRADE</span>
            <br />
            <span className="opacity-20 italic font-light text-5xl md:text-6xl">NSE/BSE Elite Terminal</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Unleash advanced neural processing for Indian Equities. AlphaEdge v4 delivers clinical precision for Nifty, Bank Nifty, and top-tier NSE stocks.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/ai-analysis">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold h-14 px-10 rounded-2xl shadow-2xl shadow-cyan-500/20 group border-t border-white/20">
                INITIATE SCAN
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/community">
              <Button variant="outline" size="lg" className="border-white/10 text-white font-bold h-14 px-10 rounded-2xl bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all">
                ENTER HUB
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-24 px-6 max-w-7xl w-full">
        <FeatureCard 
          icon={<div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-cyan-400" /></div>}
          title="Deep Liquidity Scans"
          description="Institutional-grade analysis that tracks global capital flows and heavy-weight position sizing."
        />
        <FeatureCard 
          icon={<div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center"><Shield className="w-6 h-6 text-indigo-400" /></div>}
          title="Dynamic Risk Gates"
          description="Real-time volatility adjustments that calculate optimal risk-reward ratios for every environment."
        />
        <FeatureCard 
          icon={<div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><Zap className="w-6 h-6 text-emerald-400" /></div>}
          title="Low-Latency Sync"
          description="Direct-to-consumer signal distribution bypassing traditional information decay cycles."
        />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="glass-card p-10 flex flex-col items-start gap-4"
    >
      <div className="mb-2">{icon}</div>
      <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      <p className="text-slate-400 font-light leading-relaxed">{description}</p>
    </motion.div>
  );
}
