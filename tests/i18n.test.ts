import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nProvider, useI18n } from '../src/renderer/i18n';
import { translateMessage } from '../src/renderer/i18n/messages';
import zhCN from '../src/renderer/i18n/locales/zh-CN';
import WorldSelectionBar from '../src/renderer/features/worldbuild/WorldSelectionBar';

describe('interface language packs', () => {
  it('resolves the actual flat Chinese keys instead of falling back to English', () => {
    expect(translateMessage(zhCN.messages, {}, 'common.settings', 'Settings')).toBe('设置');
    expect(translateMessage(zhCN.messages, {}, 'settings.appearance', 'Appearance')).toBe('外观');
  });

  it('supports nested packs, English fallback and untranslated new upstream text', () => {
    expect(translateMessage({ common: { close: '关闭' } }, {}, 'common.close')).toBe('关闭');
    expect(translateMessage({}, { 'common.save': 'Save' }, 'common.save')).toBe('Save');
    expect(translateMessage({}, {}, 'New upstream message')).toBe('New upstream message');
    expect(translateMessage({ empty: '' }, {}, 'empty', 'Fallback')).toBe('');
    expect(translateMessage({}, {}, 'constructor', 'Fallback')).toBe('Fallback');
  });

  it('interpolates names and zero counts while preserving unknown placeholders', () => {
    const messages = { count: '{name} 有 {count} 条消息 {unknown}' };
    expect(translateMessage(messages, {}, 'count', { name: 'Mara', count: 0 }))
      .toBe('Mara 有 0 条消息 {unknown}');
    expect(translateMessage(messages, {}, 'count', 'English', { name: 'Mara', count: 2 }))
      .toBe('Mara 有 2 条消息 {unknown}');
  });

  it('keeps every translated placeholder consistent with the English source', () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    for (const [key, text] of Object.entries(zhCN.messages)) {
      expect(placeholders(text), key).toEqual(placeholders(key));
    }
  });

  it('renders a real worldbuilding action with Chinese and English counts', () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    let locale = 'zh-CN';
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: { getItem: () => locale } } });
    const props = {
      count: 2, proposedCount: 2, updateCount: 0, confirmedCount: 0, busy: false,
      selectOptions: [], policyOptions: [], onClear: () => {}, onAction: () => {}
    };
    function Probe() {
      const { t } = useI18n();
      return createElement('main', null,
        createElement('h1', null, t('Worldbuild')),
        createElement(WorldSelectionBar, props),
        createElement('p', null, 'My story title remains English')
      );
    }
    try {
      const chinese = renderToStaticMarkup(createElement(I18nProvider, null, createElement(Probe)));
      expect(chinese).toContain('世界设定');
      expect(chinese).toContain('保留 2 项提案');
      expect(chinese).toContain('My story title remains English');
      locale = 'en-US';
      const english = renderToStaticMarkup(createElement(I18nProvider, null, createElement(Probe)));
      expect(english).toContain('Worldbuild');
      expect(english).toContain('Keep 2 proposals');
    } finally {
      if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
      else Reflect.deleteProperty(globalThis, 'window');
    }
  });
});
