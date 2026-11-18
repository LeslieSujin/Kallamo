import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import enUS from './locales/en-US';
import zhCN from './locales/zh-CN';
import { translateMessage } from './messages';

const STORAGE_KEY = 'kallamo.locale';
const DEFAULT_LOCALE = 'en-US';

const localePacks = new Map([
  ['en-US', enUS],
  ['zh-CN', zhCN]
]);

/**
 * @typedef {Object} I18nValue
 * @property {string} locale
 * @property {(locale: string) => void} setLocale
 * @property {Array<{value: string, label: string}>} locales
 * @property {(key: string, fallback?: string | Record<string, unknown>, values?: Record<string, unknown>) => string} t
 */
/** @type {import('react').Context<I18nValue | null>} */
const I18nContext = createContext(null);

function readStoredLocale() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return localePacks.has(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function registerLocale(locale, pack) {
  if (!locale || !pack || typeof pack !== 'object') {
    throw new TypeError('A locale code and a locale pack are required.');
  }
  localePacks.set(locale, { label: pack.label || locale, messages: pack.messages || {} });
}

export function getLocaleOptions() {
  return [...localePacks].map(([value, pack]) => ({ value, label: pack.label }));
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale);

  const setLocale = useCallback((nextLocale) => {
    const next = localePacks.has(nextLocale) ? nextLocale : DEFAULT_LOCALE;
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The in-memory selection still applies when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const translate = useCallback((key, fallback = key, values) => {
    return translateMessage(localePacks.get(locale)?.messages, localePacks.get(DEFAULT_LOCALE)?.messages, key, fallback, values);
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale,
    locales: getLocaleOptions(),
    t: translate
  }), [locale, setLocale, translate]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider.');
  return context;
}

