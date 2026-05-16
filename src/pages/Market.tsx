/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Search, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchBulkStockData, StockData } from '../services/marketService';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    TradingView: any;
  }
}

const POPULAR_STOCKS = [
  { symbol: 'NSE:NIFTY', name: 'Nifty 50' },
  { symbol: 'NSE:BANKNIFTY', name: 'Bank Nifty' },
  { symbol: 'BSE:SENSEX', name: 'SENSEX' },
  { symbol: 'NSE:CNXIT', name: 'Nifty IT' },
  { symbol: 'NSE:CNXPHARMA', name: 'Nifty Pharma' },
  { symbol: 'NSE:CNXAUTO', name: 'Nifty Auto' },
  { symbol: 'NSE:CNXMETAL', name: 'Nifty Metal' },
  { symbol: 'NSE:CNXREALTY', name: 'Nifty Realty' },
  { symbol: 'NSE:CNXFMCG', name: 'Nifty FMCG' },
  { symbol: 'NSE:RELIANCE', name: 'Reliance Industries' },
  { symbol: 'NSE:HDFCBANK', name: 'HDFC Bank' },
  { symbol: 'NSE:ICICIBANK', name: 'ICICI Bank' },
  { symbol: 'NSE:TCS', name: 'TCS' },
  { symbol: 'NSE:INFY', name: 'Infosys' },
  { symbol: 'NSE:ADANIENT', name: 'Adani Enterprises' },
  { symbol: 'NSE:TATAMOTORS', name: 'Tata Motors' },
  { symbol: 'NSE:SBIN', name: 'State Bank of India' },
];

export default function Market() {
  const container = useRef<HTMLDivElement>(null);
  const [activeSymbol, setActiveSymbol] = useState('NSE:NIFTY');
  const [search, setSearch] = useState('');
  const [customStocks, setCustomStocks] = useState<{symbol: string, name: string}[]>([]);
  const [sectors, setSectors] = useState<StockData[]>([]);
  const [indices, setIndices] = useState<StockData[]>([]);
  const [watchlistData, setWatchlistData] = useState<StockData[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: 'symbol' | 'price' | 'changePercent', direction: 'asc' | 'desc' }>({ key: 'symbol', direction: 'asc' });

  useEffect(() => {
    const fetchMarketData = async () => {
      const sectorSymbols = ['^CNXIT', '^CNXPHARMA', '^NSEBANK', '^CNXAUTO', '^CNXREALTY'];
      const indexSymbols = ['^NSEI', '^NSEBANK', '^BSESN'];
      
      const allWatchlistSymbols = [...POPULAR_STOCKS, ...customStocks].map(s => {
        // Map UI symbols to API symbols
        const sym = s.symbol.split(':')[1];
        if (s.symbol.startsWith('NSE:')) return sym + '.NS';
        if (s.symbol.startsWith('BSE:')) return sym + '.BO';
        return sym;
      });

      const [sectorRes, indexRes, watchlistRes] = await Promise.all([
        fetchBulkStockData(sectorSymbols),
        fetchBulkStockData(indexSymbols),
        fetchBulkStockData(allWatchlistSymbols)
      ]);

      setSectors(sectorRes);
      setIndices(indexRes);
      setWatchlistData(watchlistRes);
    };
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Refesh every minute
    return () => clearInterval(interval);
  }, [customStocks.length]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView && container.current) {
        new window.TradingView.widget({
          "container_id": container.current.id,
          "width": "100%",
          "height": 600,
          "symbol": activeSymbol,
          "interval": "D",
          "timezone": "Asia/Kolkata",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#020617",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "details": true,
          "hotlist": true,
          "calendar": true,
          "show_popup_button": true,
          "popup_width": "1000",
          "popup_height": "650",
          "backgroundColor": "#020617",
          "gridColor": "rgba(255, 255, 255, 0.05)",
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [activeSymbol]);

  const allStocks = [...POPULAR_STOCKS, ...customStocks];

  const sortedAndFilteredStocks = watchlistData
    .filter(stock => {
      const isSearchMatch = 
        stock.name.toLowerCase().includes(search.toLowerCase()) || 
        stock.symbol.toLowerCase().includes(search.toLowerCase());
      return isSearchMatch;
    })
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA = a[key];
      let valB = b[key];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
      
      return 0;
    });

  const handleSort = (key: 'symbol' | 'price' | 'changePercent') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;

    // Check if it's already in the list
    const exists = allStocks.find(s => s.symbol.toLowerCase() === search.toLowerCase() || s.symbol.split(':')[1]?.toLowerCase() === search.toLowerCase());
    
    if (exists) {
      setActiveSymbol(exists.symbol);
    } else {
      // Add custom symbol (assuming it follows NSE:SYMBOL format or just SYMBOL)
      const formattedSymbol = search.includes(':') ? search.toUpperCase() : `NSE:${search.toUpperCase()}`;
      setCustomStocks(prev => [{ symbol: formattedSymbol, name: search.toUpperCase() }, ...prev]);
      setActiveSymbol(formattedSymbol);
    }
    setSearch('');
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Market <span className="text-cyan-400">Scanner</span></h2>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em] mt-1">High-fidelity analysis & professional tools.</p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <Input 
            placeholder="Search Symbols (e.g. RELIANCE)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border-white/10 pl-12 h-12 rounded-2xl focus:border-cyan-400/50 transition-all text-sm"
          />
        </form>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div 
            id="tradingview_chart" 
            ref={container} 
            className="rounded-[32px] border border-white/10 overflow-hidden shadow-2xl glass-card relative h-[600px]"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <h4 className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Watchlist</h4>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white/5">
                    <ArrowUpDown className="h-3 w-3 text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-300">
                  <DropdownMenuItem onClick={() => handleSort('symbol')}>Sort by Symbol</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('price')}>Sort by Price</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('changePercent')}>Sort by Performance</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {sortedAndFilteredStocks.length > 0 ? (
                sortedAndFilteredStocks.map((stock) => {
                  const uiSymbol = stock.symbol.includes('.NS') 
                    ? `NSE:${stock.symbol.replace('.NS', '')}`
                    : stock.symbol.includes('.BO')
                    ? `BSE:${stock.symbol.replace('.BO', '')}`
                    : `NSE:${stock.symbol}`;

                  return (
                    <button
                      key={stock.symbol}
                      onClick={() => setActiveSymbol(uiSymbol)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                        activeSymbol === uiSymbol 
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-white' 
                        : 'bg-white/3 border-transparent text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-xs font-bold tracking-tight">{stock.symbol.replace('.NS', '').replace('.BO', '')}</div>
                        <div className="text-[10px] opacity-60 uppercase truncate max-w-[100px]">{stock.name}</div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <div className="text-xs font-mono font-bold">₹{stock.price.toLocaleString('en-IN')}</div>
                        <div className={`text-[9px] font-bold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                   <TrendingUp className="w-8 h-8 opacity-20" />
                   <span className="text-[10px] uppercase font-bold tracking-widest">Loading Market Data...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="glass-card p-8">
          <h4 className="text-slate-500 font-bold mb-6 uppercase text-[10px] tracking-[0.2em]">Indian Index Monitor</h4>
          <div className="space-y-6">
            {indices.length > 0 ? (
              indices.map((idx) => (
                <MarketTicker 
                  key={idx.symbol}
                  symbol={idx.name} 
                  value={`₹${idx.price.toLocaleString('en-IN')}`} 
                  change={`${idx.changePercent >= 0 ? '+' : ''}${idx.changePercent}%`} 
                  positive={idx.changePercent >= 0} 
                />
              ))
            ) : (
              <>
                <MarketTicker symbol="NIFTY 50" value="..." change="..." positive />
                <MarketTicker symbol="BANK NIFTY" value="..." change="..." positive />
                <MarketTicker symbol="SENSEX" value="..." change="..." positive />
              </>
            )}
          </div>
        </div>
        <div className="glass-card p-8 md:col-span-2">
          <h4 className="text-slate-500 font-bold mb-6 uppercase text-[10px] tracking-[0.2em]">NSE Sector Performance</h4>
          <div className="flex flex-wrap gap-4">
            {sectors.length > 0 ? (
              sectors.map((sector) => (
                <SectorBadge 
                  key={sector.symbol} 
                  name={sector.name} 
                  perf={`${sector.changePercent >= 0 ? '+' : ''}${sector.changePercent}%`} 
                />
              ))
            ) : (
              // Fallback/Loading state
              <>
                <SectorBadge name="IT Sector" perf="..." />
                <SectorBadge name="Pharma" perf="..." />
                <SectorBadge name="Banking" perf="..." />
                <SectorBadge name="Auto" perf="..." />
                <SectorBadge name="Realty" perf="..." />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketTicker({ symbol, value, change, positive }: { symbol: string, value: string, change: string, positive: boolean }) {
  return (
    <div className="flex justify-between items-center group cursor-default">
      <span className="text-slate-300 font-medium group-hover:text-white transition-colors">{symbol}</span>
      <div className="text-right">
        <div className="text-white font-mono font-bold">{value}</div>
        <div className={`text-[10px] font-bold ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>{change}</div>
      </div>
    </div>
  );
}

function SectorBadge({ name, perf }: { name: string, perf: string }) {
  const isPositive = perf.startsWith('+');
  return (
    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
      <span className="text-slate-300 text-sm font-medium">{name}</span>
      <span className={`text-xs font-black font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>{perf}</span>
    </div>
  );
}
