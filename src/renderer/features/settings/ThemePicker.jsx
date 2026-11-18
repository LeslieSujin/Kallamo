import React, { useId } from 'react';
import { useI18n } from '../../i18n';
import { INTERFACE_THEMES } from './interfaceThemes';

export default function ThemePicker({ value, onChange }) {
  const { t } = useI18n();
  const group = useId();
  return <fieldset className="min-w-0">
    <legend className="sr-only">{t('Interface theme')}</legend>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {INTERFACE_THEMES.map(theme => <label key={theme.id} className="theme-option group relative cursor-pointer">
        <input type="radio" name={group} value={theme.id} checked={value === theme.id} onChange={() => onChange(theme.id)} className="peer sr-only" />
        <span className="theme-option-frame block h-full overflow-hidden rounded-xl border border-border-default p-1.5 transition-[border-color,box-shadow] peer-checked:border-accent peer-checked:shadow-[0_0_0_1px_var(--app-accent)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent">
          <span aria-hidden="true" className="flex h-[5.25rem] overflow-hidden" style={{ background: theme.tokens['page-finish'] || theme.colors.canvas, borderRadius: theme.tokens['radius-surface'] || '0.75rem' }}>
            <span className="flex w-[23%] flex-col gap-2 px-2.5 py-3" style={{ backgroundColor: theme.colors.rail }}>
              <span className="mb-1 h-1.5 w-5 rounded-sm" style={{ backgroundColor: theme.colors.ink, opacity: 0.65 }} />
              <span className="h-1 w-full rounded-sm" style={{ backgroundColor: theme.accent, opacity: 0.7 }} />
              <span className="h-1 w-4/5 rounded-sm" style={{ backgroundColor: theme.colors.muted, opacity: 0.35 }} />
              <span className="h-1 w-3/5 rounded-sm" style={{ backgroundColor: theme.colors.muted, opacity: 0.35 }} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-2 px-3 py-3">
              <span className="flex items-center justify-between"><span className="h-1.5 w-1/3 rounded-sm" style={{ backgroundColor: theme.colors.ink }} /><span className="h-3 w-6" style={{ backgroundColor: theme.accent, borderRadius: theme.tokens['radius-small'] || '0.25rem', boxShadow: theme.tokens['shadow-button'] }} /></span>
              <span className="flex flex-1 flex-col gap-1.5 px-2.5 py-2" style={{ background: theme.tokens['panel-finish'] || theme.colors.panel, border: `1px solid ${theme.colors.border}`, borderRadius: theme.tokens['radius-card'] || '0.5rem', boxShadow: theme.tokens['shadow-resting'] }}>
                <span className="h-1 w-3/4 rounded-sm" style={{ backgroundColor: theme.colors.secondary, opacity: 0.65 }} />
                <span className="h-1 w-full rounded-sm" style={{ backgroundColor: theme.colors.muted, opacity: 0.25 }} />
                <span className="h-1 w-2/3 rounded-sm" style={{ backgroundColor: theme.colors.muted, opacity: 0.25 }} />
              </span>
            </span>
          </span>
          <span className="flex items-center gap-2.5 px-2 pb-1 pt-2.5">
            <span className="min-w-0 flex-1">
              <span className="block text-[0.8125rem] font-semibold text-text-primary">{t(theme.label)}</span>
              <span className="mt-1 block text-xs leading-relaxed text-text-muted">{t(theme.description)}</span>
            </span>
            <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-full border ${value === theme.id ? 'border-accent bg-accent shadow-[inset_0_0_0_2px_var(--theme-surface-panel)]' : 'border-border-strong'}`} />
          </span>
        </span>
      </label>)}
    </div>
    <p className="mt-3 text-xs leading-relaxed text-text-muted">{t('Applies colours, corners and surface depth immediately. Accent and code palette can be adjusted below.')}</p>
  </fieldset>;
}
