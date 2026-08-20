import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { listingsApi } from '../api/listingsApi.js';

const CurrencyContext = createContext(null);

const DEFAULT_RATES = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 1.0, locale: "en-IN" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 0.012, locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 0.011, locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rate: 0.0095, locale: "en-GB" },
  AED: { code: "AED", symbol: "AED", name: "UAE Dirham", rate: 0.044, locale: "en-AE" },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('vistaro_currency') || 'INR';
  });
  const [exchangeRates, setExchangeRates] = useState(DEFAULT_RATES);

  useEffect(() => {
    listingsApi.getCurrencies()
      .then((data) => {
        if (data.currencies) {
          setExchangeRates(data.currencies);
        }
      })
      .catch((err) => {
        console.error('Failed to load currency rates:', err);
      });
  }, []);

  const setCurrency = (code) => {
    if (exchangeRates[code]) {
      setCurrencyState(code);
      localStorage.setItem('vistaro_currency', code);
    }
  };

  const formatPrice = useCallback((amountInINR) => {
    const num = Number(amountInINR) || 0;
    const config = exchangeRates[currency] || exchangeRates.INR || DEFAULT_RATES.INR;
    const converted = num * config.rate;

    try {
      return new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: config.code,
        maximumFractionDigits: 0,
      }).format(converted);
    } catch (e) {
      return `${config.symbol} ${Math.round(converted).toLocaleString()}`;
    }
  }, [currency, exchangeRates]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRates, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
