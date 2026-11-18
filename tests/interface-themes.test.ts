import { describe, expect, it } from 'vitest';
import { applyInterfaceTheme, contrastRatio, getInterfaceTheme, INTERFACE_THEMES, resolveThemeAccent, resolveThemeCode } from '../src/renderer/features/settings/interfaceThemes';

describe('interface theme palettes', () => {
  it.each(INTERFACE_THEMES.filter(theme => theme.mode === 'light'))('$id keeps reading text clear on its main surfaces', theme => {
    for (const surface of ['canvas', 'rail', 'panel', 'input', 'hover'] as const) {
      for (const text of ['ink', 'secondary', 'muted'] as const) {
        expect(contrastRatio(theme.colors[text], theme.colors[surface]), `${theme.id}: ${text} on ${surface}`).toBeGreaterThanOrEqual(4.5);
      }
    }
    const accent = resolveThemeAccent(theme, theme.accent);
    expect(contrastRatio(accent, theme.colors.rail)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#ffffff', accent)).toBeGreaterThanOrEqual(4.5);
  });

  it('uses a light palette for legacy settings and keeps explicit code choices', () => {
    expect(getInterfaceTheme(undefined).id).toBe('paper');
    expect(getInterfaceTheme('unknown-theme').id).toBe('paper');
    expect(resolveThemeCode({ codeTheme: 'github-dark' })).toBe('github-light');
    expect(resolveThemeCode({ theme: 'rose' })).toBe('atom-one-light');
    expect(resolveThemeCode({ theme: 'mist', codeTheme: 'github-dark' })).toBe('github-dark');
  });

  it('adapts bright custom accents to keep accent text readable', () => {
    for (const theme of INTERFACE_THEMES.filter(theme => theme.mode === 'light')) {
      expect(contrastRatio(resolveThemeAccent(theme, '#fbcb2d'), theme.colors.rail)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(resolveThemeAccent(theme, '#ffffff'), theme.colors.rail)).toBeGreaterThanOrEqual(4.5);
      expect(resolveThemeAccent(theme, 'invalid-colour')).toBe(theme.accent);
    }
    expect(resolveThemeAccent(getInterfaceTheme('dark'), '#fbcb2d')).toBe('#fbcb2d');
  });

  it('switches back to dark without retaining light surfaces or status colours', () => {
    const variables = new Map<string, string>();
    const root = {
      dataset: {} as Record<string, string>,
      style: { colorScheme: '', setProperty: (key: string, value: string) => variables.set(key, value), removeProperty: (key: string) => variables.delete(key) }
    } as unknown as HTMLElement;
    const cached: Record<string, string> = {};
    const storage = { setItem: (key: string, value: string) => { cached[key] = value; } };
    applyInterfaceTheme({ theme: 'rose' }, root, storage);
    expect(root.dataset.theme).toBe('rose');
    expect(variables.get('--theme-surface-canvas')).toBe('#f8f3f1');
    expect(variables.get('--theme-status-info')).toBe('#35658d');
    applyInterfaceTheme({ theme: 'dark' }, root, storage);
    expect(root.style.colorScheme).toBe('dark');
    expect(variables.has('--theme-surface-canvas')).toBe(false);
    expect(variables.has('--theme-status-info')).toBe(false);
    expect(variables.get('--app-accent')).toBe('#fbcb2d');
    expect(JSON.parse(cached['kallamo.appearance']).theme).toBe('dark');
    expect(() => applyInterfaceTheme({ theme: 'paper' }, root, { setItem: () => { throw new Error('Storage unavailable'); } })).not.toThrow();
  });
});
