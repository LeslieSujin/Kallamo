import React, { useEffect, useRef, useState } from 'react';
import { Download, Plus, Search, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Checkbox from '../../components/ui/Checkbox';
import IconButton from '../../components/ui/IconButton';
import { useI18n } from '../../i18n';
import { fieldClass, SettingsGroup } from './SettingsUi';

const ERROR_MESSAGES = {
  'missing-api-key': 'Enter an API key before fetching models.',
  'invalid-base-url': 'Enter a valid HTTP or HTTPS base URL.',
  'unsupported-provider': 'This provider needs model IDs to be added manually.',
  unauthorized: 'The API key was rejected. Check it and try again.',
  forbidden: 'This key cannot list models. Check its permissions with the provider.',
  'not-found': 'This address does not provide a model list. Check the base URL or add model IDs manually.',
  'rate-limited': 'Too many requests. Wait a moment and try again.',
  'server-error': 'The provider could not return its model list. Try again later.',
  'invalid-response': 'The provider returned an unrecognized model list. You can still add IDs manually.',
  timeout: 'Fetching models timed out. Check the connection and try again.',
  'network-error': 'Could not reach the provider. Check the address and your network or proxy.',
  unavailable: 'Restart the updated app to fetch models.'
};

export default function ConnectionModels({ provider, baseUrl, apiKey, models, onChange, api, focusInput, modelPlaceholder }) {
  const { t } = useI18n();
  const [manualName, setManualName] = useState('');
  const [catalog, setCatalog] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestVersion = useRef(0);
  const supportsCatalog = ['OpenAI', 'OpenRouter', 'Local'].includes(provider);

  useEffect(() => {
    requestVersion.current += 1;
    setCatalog(null);
    setSelected(new Set());
    setQuery('');
    setError(null);
    setLoading(false);
    setManualName('');
    return () => { requestVersion.current += 1; };
  }, [provider, baseUrl, apiKey]);

  const fetchModels = async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError(null);
    try {
      const result = await api?.listConnectionModels?.({ provider, baseUrl, apiKey });
      if (version !== requestVersion.current) return;
      if (!result?.success) {
        setError(result?.errorCode || 'unavailable');
        return;
      }
      setCatalog(result.models);
      setSelected(new Set());
    } catch {
      if (version === requestVersion.current) setError('network-error');
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  };

  const addManual = event => {
    event.preventDefault();
    const id = manualName.trim();
    if (id && !models.includes(id)) onChange([...models, id]);
    setManualName('');
  };
  const visible = (catalog || []).filter(id => id.toLowerCase().includes(query.trim().toLowerCase()));
  const additions = (catalog || []).filter(id => selected.has(id) && !models.includes(id));
  const toggle = (id, checked) => setSelected(current => {
    const next = new Set(current);
    if (checked) next.add(id); else next.delete(id);
    return next;
  });
  const addSelected = () => {
    onChange([...new Set([...models, ...additions])]);
    setSelected(new Set());
  };

  return (
    <SettingsGroup title={t('Models')} aside={t('Profiles and roles choose from these')} data-tour="connection-models">
      {supportsCatalog && <div className="flex flex-wrap items-center gap-3 border-b border-tint/[0.055] px-[1.125rem] py-3">
        <Button type="button" variant="ghost" size="sm" icon={Download} loading={loading} onClick={fetchModels}>
          {loading ? t('Fetching models…') : t('Fetch models')}
        </Button>
        <p className="min-w-48 flex-1 text-xs leading-relaxed text-text-muted">{t('Use the current connection details, then choose which models to add.')}</p>
      </div>}
      {error && <p role="alert" className="px-[1.125rem] py-3 text-[0.8125rem] text-status-danger">{t(ERROR_MESSAGES[error] || ERROR_MESSAGES['server-error'])}</p>}
      {catalog !== null && <div className="border-b border-tint/[0.055] p-3.5" aria-busy={loading}>
        <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
          <p role="status" className="flex-1 text-xs text-text-muted">{t('Found {count} models', { count: catalog.length })}</p>
          <Button type="button" variant="subtle" size="sm" disabled={!visible.some(id => !models.includes(id))} onClick={() => setSelected(current => new Set([...current, ...visible.filter(id => !models.includes(id))]))}>{t('Select visible models')}</Button>
          <Button type="button" variant="subtle" size="sm" disabled={!selected.size} onClick={() => setSelected(new Set())}>{t('Clear selection')}</Button>
        </div>
        {catalog.length > 0 ? <>
          <div className="relative mb-2.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-subtle" aria-hidden="true" />
            <input value={query} onChange={event => setQuery(event.target.value)} aria-label={t('Search models')} placeholder={t('Search models')} className={`${fieldClass} w-full pl-9`} />
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-control border border-border-subtle p-3 custom-scrollbar">
            {visible.length ? visible.map(id => <div key={id} className="flex items-center gap-2.5">
              <div className="min-w-0 flex-1 break-all font-mono"><Checkbox size="sm" checked={models.includes(id) || selected.has(id)} disabled={models.includes(id)} onChange={checked => toggle(id, checked)} label={id} /></div>
              {models.includes(id) && <span className="shrink-0 text-xs text-text-subtle">{t('Already added')}</span>}
            </div>) : <p className="text-xs text-text-muted">{t('No matching models.')}</p>}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="button" size="sm" icon={Plus} disabled={!additions.length || loading} onClick={addSelected}>{t('Add selected models ({count})', { count: additions.length })}</Button>
            <p className="flex-1 text-xs leading-relaxed text-text-muted">{t('Save the connection after adding your models. The catalog may also include image, audio or embedding models.')}</p>
          </div>
        </> : <p className="text-[0.8125rem] text-text-muted">{t('The provider returned no models for this key. You can still add model IDs manually.')}</p>}
      </div>}
      <form className="flex gap-2.5 px-[1.125rem] py-3" onSubmit={addManual}>
        <input value={manualName} onChange={event => setManualName(event.target.value)} autoFocus={focusInput} aria-label={t('Model ID')} placeholder={t('Type a model ID, like {example}', { example: modelPlaceholder })} className={`${fieldClass} min-w-0 flex-1 font-mono text-[0.8125rem]`} />
        <Button type="submit" variant="ghost" size="sm" icon={Plus} disabled={!manualName.trim()}>{t('Add')}</Button>
      </form>
      {models.length === 0
        ? <p className="border-t border-tint/[0.055] px-[1.125rem] py-3 text-[0.8125rem] text-text-muted">{t('No models yet. Fetch the list or add an ID manually.')}</p>
        : models.map(id => <div key={id} className="flex items-center gap-3 border-t border-tint/[0.055] px-[1.125rem] py-2.5">
          <span className="min-w-0 flex-1 truncate font-mono text-[0.8125rem] text-text-secondary">{id}</span>
          <IconButton icon={X} label={t('Remove {name}', { name: id })} size="sm" tone="danger" onClick={() => onChange(models.filter(model => model !== id))} />
        </div>)}
    </SettingsGroup>
  );
}
