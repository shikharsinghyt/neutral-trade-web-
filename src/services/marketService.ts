/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
// We now use backend proxy for live data

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Top NSE Stocks & Indices
export const INDIAN_SYMBOLS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'TCS' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
  { symbol: 'SBIN.NS', name: 'State Bank of India' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
  // Indices for sector badges and monitor
  { symbol: '^NSEI', name: 'Nifty 50' },
  { symbol: '^NSEBANK', name: 'Bank Nifty' },
  { symbol: '^BSESN', name: 'Sensex' },
  { symbol: '^CNXIT', name: 'IT Sector' },
  { symbol: '^CNXPHARMA', name: 'Pharma' },
  { symbol: '^CNXAUTO', name: 'Auto' },
  { symbol: '^CNXREALTY', name: 'Realty' },
];

export async function fetchStockData(symbol: string): Promise<StockData | null> {
  try {
    const response = await axios.get(`/api/market/quote/${symbol}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return simulateData(symbol);
  }
}

export async function fetchBulkStockData(symbols: string[]): Promise<StockData[]> {
  try {
    const response = await axios.get(`/api/market/quotes?symbols=${symbols.join(',')}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bulk stock data:', error);
    return [];
  }
}

function simulateData(symbol: string): StockData {
  const basePrices: Record<string, number> = {
    'RELIANCE.NS': 2980,
    'TCS.NS': 3820,
    'HDFCBANK.NS': 1640,
    'INFY.NS': 1840,
    'TATAMOTORS.NS': 980,
    'ICICIBANK.NS': 1120,
    'SBIN.NS': 830,
    'BHARTIARTL.NS': 1420,
    '^NSEI': 24320,
    '^NSEBANK': 52450,
    '^BSESN': 80000,
    '^CNXIT': 38500,
    '^CNXPHARMA': 19200,
    '^CNXAUTO': 24500,
    '^CNXREALTY': 1050,
  };

  const base = basePrices[symbol] || 1000;
  const variation = (Math.random() - 0.5) * 10;
  const price = base + variation;
  const change = variation;
  const changePercent = (change / base) * 100;

  return {
    symbol,
    name: INDIAN_SYMBOLS.find(s => s.symbol === symbol)?.name || symbol,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2))
  };
}
