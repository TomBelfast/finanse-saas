import { Currency } from '../models/documents/Currency';

export interface CurrencyInfo {
  symbol: string;
  code: string;
  name: string;
  locale: string;
}

export const CURRENCY_INFO: Record<Currency, CurrencyInfo> = {
  pln: {
    symbol: 'zł',
    code: 'PLN',
    name: 'Polish Złoty',
    locale: 'pl-PL'
  },
  eur: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    locale: 'de-DE'
  },
  usd: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    locale: 'en-US'
  },
  gbp: {
    symbol: '£',
    code: 'GBP',
    name: 'British Pound',
    locale: 'en-GB'
  }
};

/**
 * Formats amount with currency symbol and proper locale formatting
 * @param amount - The amount to format
 * @param currency - The currency code (pln, eur, usd, gbp)
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: Currency = 'pln',
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    decimals?: number;
  } = {}
): string => {
  const {
    showSymbol = true,
    showCode = false,
    decimals = 2
  } = options;

  const currencyInfo = CURRENCY_INFO[currency];
  const formattedAmount = amount.toFixed(decimals);

  if (currency === 'pln') {
    // Polish formatting: "123,45 zł" or "123,45 PLN"
    const polishFormatted = formattedAmount.replace('.', ',');
    const suffix = showCode ? currencyInfo.code : (showSymbol ? currencyInfo.symbol : '');
    return suffix ? `${polishFormatted} ${suffix}` : polishFormatted;
  } else {
    // International formatting: "$123.45" or "123.45 USD"
    if (showCode) {
      return `${formattedAmount} ${currencyInfo.code}`;
    } else if (showSymbol) {
      return `${currencyInfo.symbol}${formattedAmount}`;
    } else {
      return formattedAmount;
    }
  }
};

/**
 * Gets currency info for a given currency code
 * @param currency - The currency code
 * @returns Currency information object
 */
export const getCurrencyInfo = (currency: Currency): CurrencyInfo => {
  return CURRENCY_INFO[currency];
};

/**
 * Gets available currencies list
 * @returns Array of currency codes
 */
export const getAvailableCurrencies = (): Currency[] => {
  return Object.keys(CURRENCY_INFO) as Currency[];
}; 