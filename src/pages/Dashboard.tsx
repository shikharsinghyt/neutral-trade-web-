/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { fetchBulkStockData, INDIAN_SYMBOLS, StockData } from '../services/marketService';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  PieChart, 
  Globe, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Newspaper,
  ShieldCheck,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const [marketData, setMarketData] = useState<StockData[]>([]);
  const [indices, setIndices] = useState<StockData[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarket = async () => {
      const stockSymbols = INDIAN_SYMBOLS.filter(s => !s.symbol.startsWith('^')).map(s => s.symbol);
      const indexSymbols = ['^NSEI', '^NSEBANK', '^BSESN'];
      
      const [stocksRes, indicesRes] = await Promise.all([
        fetchBulkStockData(stockSymbols),
        fetchBulkStockData(indexSymbols)
      ]);

      setMarketData(stocksRes);
      setIndices(indicesRes);
      setLoading(false);
    };

    loadMarket();
    
    // Listen for signals
    const q = query(collection(db, 'signals'), orderBy('timestamp', 'desc'), limit(3));
    const unsubscribeSignals = onSnapshot(q, (snapshot) => {
      setSignals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const interval = setInterval(loadMarket, 30000); // 30s refresh for dashboard
    return () => {
      clearInterval(interval);
      unsubscribeSignals();
    };
  }, []);

  const gainers = [...marketData].sort((a, b) => b.changePercent - a.changePercent).slice(0, 4);
  const losers = [...marketData].sort((a, b) => a.changePercent - b.changePercent).slice(0, 4);

  const nifty = indices.find(i => i.symbol === '^NSEI');
  const bankNifty = indices.find(i => i.symbol === '^NSEBANK');
  const sensex = indices.find(i => i.symbol === '^BSESN');

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">BHARAT <span className="text-cyan-400">DASHBOARD</span></h2>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em] mt-1">Real-time Institutional Flow Monitor</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-cyan-500 flex items-center justify-center text-[8px] font-black">{i+1}</div>
            ))}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1,248 Traders Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          title="NIFTY 50" 
          value={nifty ? nifty.price.toLocaleString('en-IN') : '...'} 
          change={nifty ? `${nifty.changePercent >= 0 ? '+' : ''}${nifty.changePercent}%` : '...'} 
          positive={nifty ? nifty.changePercent >= 0 : true} 
          icon={<Activity className="text-cyan-400" />} 
        />
        <StatsCard 
          title="BANK NIFTY" 
          value={bankNifty ? bankNifty.price.toLocaleString('en-IN') : '...'} 
          change={bankNifty ? `${bankNifty.changePercent >= 0 ? '+' : ''}${bankNifty.changePercent}%` : '...'} 
          positive={bankNifty ? bankNifty.changePercent >= 0 : true} 
          icon={<TrendingUp className="text-emerald-400" />} 
        />
        <StatsCard 
          title="SENSEX" 
          value={sensex ? sensex.price.toLocaleString('en-IN') : '...'} 
          change={sensex ? `${sensex.changePercent >= 0 ? '+' : ''}${sensex.changePercent}%` : '...'} 
          positive={sensex ? sensex.changePercent >= 0 : true} 
          icon={<Globe className="text-indigo-400" />} 
        />
        <StatsCard title="MARKET VOL" value="4.2T" change="High" positive icon={<Zap className="text-amber-400" />} />
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-12">
          <TabsTrigger value="overview" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400">Market Overview</TabsTrigger>
          <TabsTrigger value="movers" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400">Top Movers</TabsTrigger>
          <TabsTrigger value="sectors" className="rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400">Sector Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Highlight Signal if exists */}
              {signals.length > 0 && (
                <div className="glass-card overflow-hidden relative border-cyan-500/20">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <ShieldCheck className="w-24 h-24 text-cyan-400" />
                  </div>
                  <div className="bg-cyan-500/10 px-6 py-2 border-b border-cyan-500/20 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Institutional Signal Detected</span>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 text-xl font-black text-white">{signals[0].ticker}</div>
                        <div>
                           <h4 className="text-lg font-bold text-white tracking-tight">{signals[0].name}</h4>
                           <Badge variant="outline" className={`text-[8px] uppercase tracking-tighter ${signals[0].action === 'BUY' ? 'border-emerald-400 text-emerald-400' : 'border-rose-400 text-rose-400'}`}>{signals[0].action}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-white tracking-tighter">₹{signals[0].price || signals[0].entry}</div>
                        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-tight">Confidence: {signals[0].confidence}%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                       <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">Target</div>
                          <div className="text-sm font-mono font-bold text-white">₹{signals[0].target}</div>
                       </div>
                       <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">Stop</div>
                          <div className="text-sm font-mono font-bold text-rose-400">₹{signals[0].sl}</div>
                       </div>
                       <a href="/ai-analysis" className="bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors p-4 rounded-xl border border-cyan-500/30 flex items-center justify-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Full Report</span>
                          <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                       </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="glass-card p-10 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <PieChart className="w-64 h-64" />
                </div>
                <div className="text-center space-y-4">
                  <Activity className="w-16 h-16 text-cyan-400 mx-auto animate-pulse" />
                  <h3 className="text-2xl font-bold text-white tracking-tight">Main Heatmap Engine</h3>
                  <p className="text-slate-500 max-w-sm font-light">Institutional flows and sectoral heatmap analysis is processing. Professional data streams will sync here.</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass-card p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Target className="text-cyan-400 w-5 h-5" />
                    <h4 className="text-white font-bold text-sm uppercase tracking-widest">Recent Signals</h4>
                  </div>
                  <a href="/ai-analysis" className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors uppercase font-bold tracking-widest">View All</a>
                </div>
                <div className="space-y-4">
                  {signals.length > 1 ? signals.slice(1).map((s) => (
                    <div key={s.id} className="p-4 rounded-xl bg-white/3 border border-white/5 flex justify-between items-center group cursor-pointer hover:bg-white/5 transition-all">
                       <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${s.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{s.ticker.slice(0, 2)}</div>
                         <div>
                            <div className="text-xs font-bold text-white tracking-tight">{s.ticker}</div>
                            <div className="text-[9px] text-slate-500 uppercase">{s.action} @ ₹{s.entry}</div>
                         </div>
                       </div>
                       <ArrowUpRight className="w-3 h-3 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  )) : (
                    <div className="text-center py-10 opacity-20">
                       <ShieldCheck className="w-8 h-8 mx-auto mb-2" />
                       <div className="text-[8px] uppercase tracking-widest font-black">Scanning Neural Core...</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card p-8 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                <h4 className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-4">Pro Insight</h4>
                <p className="text-slate-300 text-sm leading-relaxed italic">"Nifty showing strong support at 24,100 level. Multiple rejection candles on 1h time frame suggest bullish continuation."</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="movers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card overflow-hidden">
               <div className="p-6 border-b border-white/5 flex items-center gap-2">
                 <ArrowUpRight className="text-emerald-400 w-5 h-5" />
                 <h4 className="text-white font-bold text-sm tracking-tight">Top Bulls</h4>
               </div>
               <div className="divide-y divide-white/5">
                 {gainers.map((stock) => (
                   <MoversItem key={stock.symbol} stock={stock} positive />
                 ))}
               </div>
            </div>
            <div className="glass-card overflow-hidden">
               <div className="p-6 border-b border-white/5 flex items-center gap-2">
                 <ArrowDownRight className="text-rose-400 w-5 h-5" />
                 <h4 className="text-white font-bold text-sm tracking-tight">Top Bears</h4>
               </div>
               <div className="divide-y divide-white/5">
                 {losers.map((stock) => (
                   <MoversItem key={stock.symbol} stock={stock} positive={false} />
                 ))}
               </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({ title, value, change, positive, icon }: { title: string, value: string, change: string, positive: boolean, icon: React.ReactNode }) {
  return (
    <div className="glass-card p-6 flex flex-col gap-4 hover:border-white/20 transition-all group">
      <div className="flex justify-between items-center">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/10 transition-all">
          {icon}
        </div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {change}
        </div>
      </div>
      <div>
        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</div>
        <div className="text-2xl font-black text-white tracking-tighter">{value}</div>
      </div>
    </div>
  );
}

function MoversItem({ stock, positive }: { stock: StockData, positive: boolean }) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-white/3 transition-all cursor-default">
      <div className="flex flex-col">
        <span className="text-white font-bold tracking-tight">{stock.symbol.replace('.NS', '')}</span>
        <span className="text-slate-500 text-[10px] uppercase font-medium">{stock.name}</span>
      </div>
      <div className="text-right">
        <div className="text-white font-mono font-bold">₹{stock.price}</div>
        <div className={`text-[10px] font-bold font-mono ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {positive ? '+' : ''}{stock.changePercent}%
        </div>
      </div>
    </div>
  );
}

function NewsItem({ time, title }: { time: string, title: string }) {
  return (
    <div className="space-y-1 group cursor-pointer">
      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
        <Clock className="w-3 h-3" />
        {time}
      </div>
      <p className="text-sm text-slate-300 font-medium group-hover:text-cyan-400 transition-colors leading-tight">{title}</p>
    </div>
  );
}
