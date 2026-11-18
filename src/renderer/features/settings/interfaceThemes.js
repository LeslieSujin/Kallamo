export const DEFAULT_INTERFACE_THEME = 'paper';
const CACHE_KEY = 'kallamo.appearance';

const LIGHT_ROLES = {
  'text-on-danger': '#ffffff',
  'status-info': '#35658d', 'status-success': '#326d52', 'status-warning': '#875b17', 'status-warning-strong': '#805010',
  'status-danger': '#ad353e', 'danger-solid': '#ac353d', 'danger-solid-hover': '#942b33',
  'status-setup': '#8c5718', 'status-setup-strong': '#764510', 'text-on-setup': '#ffffff',
  roleplay: '#944853', 'roleplay-soft': '#f3e5e7', 'roleplay-text': '#783744',
  'mode-always': '#72528b', 'mode-searchable': '#35658d', 'mode-history': '#2f6b63',
  'calendar-birthday': '#905477', 'calendar-festival': '#82601b', 'calendar-event': '#74588a', 'calendar-history': '#456987',
  'entity-character': '#35658d', 'entity-location': '#326d52', 'entity-faction': '#875b17', 'entity-event': '#72528b',
  'entity-item': '#566b2f', 'entity-creature': '#944853', 'entity-race': '#326b7b', 'entity-concept': '#586674',
  'item-combat': '#944853', 'item-craft': '#875b17', 'item-consumable': '#326d52', 'item-artifact': '#72528b', 'item-neutral': '#586674',
  'daylight-dawn': '#97545f', 'daylight-day': '#875b17', 'daylight-dusk': '#74588a', 'daylight-night': '#59648c',
  'discord-soft': '#e8ebfc', 'discord-soft-hover': '#dde2fa', 'discord-text': '#3f4aa0',
};

function lightTokens(colors) {
  return {
    ...LIGHT_ROLES,
    'surface-canvas': colors.canvas, 'surface-sidebar': colors.rail, 'surface-editor': colors.panel,
    'surface-panel': colors.panel, 'surface-panel-muted': colors.soft, 'surface-input': colors.input,
    'surface-hover': colors.hover, 'surface-overlay': `color-mix(in srgb, ${colors.ink} 28%, transparent)`,
    'surface-canvas-lift': colors.panel, 'surface-canvas-mid': colors.canvas, 'surface-canvas-deep': colors.canvas,
    'surface-rail-top': colors.rail, 'surface-rail': colors.rail, 'surface-rail-bottom': colors.rail,
    'surface-raised': colors.panel, 'surface-raised-low': colors.soft, 'surface-inset': colors.soft,
    'surface-sunken': colors.panel, 'surface-sunken-low': colors.panel,
    'surface-well': colors.input, 'border-well': colors.border,
    highlight: '#ffffffcc', 'glow-cool': 'transparent', 'titlebar-shade': colors.rail,
    'surface-abyss': colors.soft, 'surface-danger': '#f9eeee', scrim: colors.canvas,
    tint: colors.ink, shade: colors.ink, 'bubble-user': colors.hover,
    'scrollbar-thumb': `color-mix(in srgb, ${colors.ink} 20%, transparent)`,
    'scrollbar-thumb-hover': `color-mix(in srgb, ${colors.ink} 34%, transparent)`,
    'scrollbar-track': 'transparent', 'thumb-shadow': `${colors.ink}20`, 'thumb-shadow-strong': `${colors.ink}30`,
    'text-primary': colors.ink, 'text-secondary': colors.secondary, 'text-muted': colors.muted,
    'text-subtle': colors.muted, 'text-disabled': colors.disabled, 'preview-profile': colors.ink,
    'border-subtle': colors.border, 'border-default': colors.border, 'border-strong': colors.strong,
    'shadow-raised': `0 1px 2px ${colors.ink}0a`,
    'shadow-panel': `0 8px 24px -8px ${colors.ink}15`,
    'shadow-overlay': `0 16px 48px -12px ${colors.ink}2b, 0 2px 8px ${colors.ink}0a`,
  };
}

const LIGHT_THEMES = [
  {
    id: 'paper', label: 'Paper & ink', description: 'Warm porcelain, quiet olive and deep green ink.',
    accent: '#345d4f', mode: 'light', codeTheme: 'github-light',
    colors: { canvas: '#f7f5f0', rail: '#eae7df', panel: '#fffefa', soft: '#f1eee6', input: '#f8f6f1', hover: '#e3e9df', ink: '#2c332e', secondary: '#465148', muted: '#626a60', disabled: '#92978e', border: '#d8d8cd', strong: '#acb5a7' },
  },
  {
    id: 'mist', label: 'Silver mist', description: 'Pearl surfaces, mineral blue and precise contrast.',
    accent: '#375c85', mode: 'light', codeTheme: 'github-light',
    colors: { canvas: '#f3f6f8', rail: '#e5ecf1', panel: '#fcfdfe', soft: '#edf2f6', input: '#f5f8fa', hover: '#dfe9f1', ink: '#283642', secondary: '#435769', muted: '#596875', disabled: '#8d9aa5', border: '#d3dde5', strong: '#a7bac9' },
  },
  {
    id: 'rose', label: 'Rose sand', description: 'Limestone, soft clay and a restrained terracotta accent.',
    accent: '#8a4d48', mode: 'light', codeTheme: 'atom-one-light',
    colors: { canvas: '#f8f3f1', rail: '#eee3df', panel: '#fffcfa', soft: '#f4eae5', input: '#faf5f1', hover: '#f0dfd8', ink: '#3d302e', secondary: '#604944', muted: '#755e58', disabled: '#a28b83', border: '#dfd0c9', strong: '#c1a397' },
  },
];

export const INTERFACE_THEMES = [
  ...LIGHT_THEMES.map(theme => ({ ...theme, tokens: lightTokens(theme.colors) })),
  {
    id: 'dark', label: 'Original dark', description: 'Deep teal with the original warm gold accent.',
    accent: '#fbcb2d', mode: 'dark', codeTheme: 'github-dark', tokens: {},
    colors: { canvas: '#011419', rail: '#040d12', panel: '#0a161d', soft: '#0a1721', input: '#07171d', hover: '#14282e', ink: '#f3f4f6', secondary: '#d1d5db', muted: '#9ca3af', disabled: '#65717c', border: '#24353b', strong: '#425359' },
  }
];

export function getInterfaceTheme(id = DEFAULT_INTERFACE_THEME) {
  return INTERFACE_THEMES.find(theme => theme.id === id) || INTERFACE_THEMES[0];
}

export function resolveThemeCode(settings = {}) {
  const theme = getInterfaceTheme(settings.theme);
  return settings.theme ? settings.codeTheme || theme.codeTheme : theme.codeTheme;
}

const rgb = hex => hex.slice(1).match(/../g).map(value => parseInt(value, 16));
function luminance(hex) {
  const channels = rgb(hex).map(value => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
export function contrastRatio(left, right) {
  const a = luminance(left), b = luminance(right);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function resolveThemeAccent(theme, requested) {
  let accent = typeof requested === 'string' && /^#[0-9a-f]{6}$/i.test(requested) ? requested : theme.accent;
  if (theme.mode === 'light') {
    // Accent is also used for small text, so bright custom colours need a darker tone.
    for (let step = 0; step < 24 && contrastRatio(accent, theme.colors.rail) < 4.5; step++) {
      accent = '#' + rgb(accent).map(value => Math.round(value * 0.92).toString(16).padStart(2, '0')).join('');
    }
  }
  return accent;
}

const OVERRIDE_KEYS = [...new Set(INTERFACE_THEMES.flatMap(theme => Object.keys(theme.tokens)))];
export function applyInterfaceTheme(settings = {}, root = document.documentElement, storage) {
  const theme = getInterfaceTheme(settings.theme);
  const accent = resolveThemeAccent(theme, settings.theme ? settings.accentColor : null);
  root.dataset.theme = theme.id;
  root.dataset.colorScheme = theme.mode;
  root.style.colorScheme = theme.mode;
  for (const key of OVERRIDE_KEYS) {
    if (theme.tokens[key]) root.style.setProperty(`--theme-${key}`, theme.tokens[key]);
    else root.style.removeProperty(`--theme-${key}`);
  }
  root.style.setProperty('--app-accent', accent);
  root.style.setProperty('--theme-text-on-accent', contrastRatio('#ffffff', accent) >= 4.5 ? '#ffffff' : '#172c25');
  try { (storage || window.localStorage).setItem(CACHE_KEY, JSON.stringify({ theme: theme.id, accentColor: accent })); } catch { /* Storage is optional. */ }
  return theme;
}

export function restoreInterfaceTheme() {
  let cached = {};
  try { cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) || '{}') || {}; } catch { /* Use the default palette. */ }
  return applyInterfaceTheme(cached);
}
