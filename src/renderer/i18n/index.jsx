import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import enUS from './locales/en-US';
import zhCN from './locales/zh-CN';

const STORAGE_KEY = 'kallamo.locale';
const DEFAULT_LOCALE = 'en-US';

const localePacks = new Map([
  ['en-US', enUS],
  ['zh-CN', zhCN]
]);

const I18nContext = createContext(null);

function readStoredLocale() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return localePacks.has(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function readMessage(messages, key) {
  if (messages && Object.prototype.hasOwnProperty.call(messages, key)) return messages[key];
  return key.split('.').reduce((value, part) => value && value[part], messages);
}

function interpolate(message, values) {
  if (!values || typeof message !== 'string') return message;
  return message.replace(/\{(\w+)\}/g, (_, name) => (
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : `{${name}}`
  ));
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
    const current = readMessage(localePacks.get(locale)?.messages, key);
    const english = readMessage(localePacks.get(DEFAULT_LOCALE)?.messages, key);
    return interpolate(current ?? english ?? fallback, values);
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


