/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import yahooFinance from 'yahoo-finance2';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up Yahoo Finance
  // @ts-ignore
  if (yahooFinance.setGlobalConfig) {
    // @ts-ignore
    yahooFinance.setGlobalConfig({
      queue: {
        concurrency: 5,
      },
    });
  }

  // API Routes
  app.get('/api/market/quote/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
      // Yahoo Finance symbols for NSE/BSE often end in .NS or .BO
      // If no suffix, default to .NS for popular Indian stocks
      let yahooSymbol = symbol;
      if (!symbol.includes('.') && !symbol.startsWith('^')) {
        yahooSymbol = `${symbol}.NS`;
      }
      
      const quote: any = await yahooFinance.quote(yahooSymbol);
      
      if (!quote) {
        return res.status(404).json({ error: 'Market data not found' });
      }

      res.json({
        symbol: symbol,
        name: quote.shortName || quote.longName || symbol,
        price: quote.regularMarketPrice || quote.marketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        marketState: quote.marketState,
        currency: quote.currency
      });
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      res.status(500).json({ error: 'Failed to fetch market data' });
    }
  });

  // Bulk quote endpoint
  app.get('/api/market/quotes', async (req, res) => {
    const symbolsRaw = req.query.symbols as string;
    if (!symbolsRaw) {
      return res.status(400).json({ error: 'No symbols provided' });
    }

    const symbols = symbolsRaw.split(',');
    try {
      const results = await Promise.all(
        symbols.map(async (s) => {
          try {
            let yahooSymbol = s;
            if (!s.includes('.') && !s.startsWith('^')) {
              yahooSymbol = `${s}.NS`;
            }
            const q: any = await yahooFinance.quote(yahooSymbol);
            return {
              symbol: s,
              name: q.shortName || q.longName || s,
              price: q.regularMarketPrice,
              change: q.regularMarketChange,
              changePercent: q.regularMarketChangePercent
            };
          } catch (e) {
            return null;
          }
        })
      );

      res.json(results.filter(r => r !== null));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bulk market data' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
