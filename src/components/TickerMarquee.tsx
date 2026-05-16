/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { fetchBulkStockData, INDIAN_SYMBOLS, StockData } from '../services/marketService';

export default function TickerMarquee() {
  const [data, setData] = useState<StockData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const symbols = INDIAN_SYMBOLS.map(s => s.symbol);
      const results = await fetchBulkStockData(symbols);
      setData(results);
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex gap-8 px-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 w-32 bg-white/5 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-12 whitespace-nowrap px-6 items-center animate-marquee">
      {/* Repeat data to ensure seamless loop if items are few */}
      {[...data, ...data].map((stock, i) => (
        <div key={`${stock.symbol}-${i}`} className="flex items-center gap-2 group cursor-default">
          <span className="font-bold text-[10px] text-slate-300 group-hover:text-white transition-colors">
            {stock.symbol.replace('.NS', '')}
          </span>
          <span className={`font-mono text-[10px] ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            <span className="ml-1 opacity-70">
              ({stock.change >= 0 ? '+' : ''}{stock.changePercent}%)
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
