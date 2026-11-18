const DEFAULT_BASES = {
    openai: 'https://api.openai.com/v1',
    openrouter: 'https://openrouter.ai/api/v1'
};
const SUPPORTED_PROVIDERS = new Set(['openai', 'openrouter', 'local']);

function catalogRequest(profile) {
    const provider = String(profile?.provider || '').toLowerCase();
    if (!SUPPORTED_PROVIDERS.has(provider)) return { errorCode: 'unsupported-provider' };
    const key = String(profile.apiKey || '').trim();
    if (provider === 'openai' && !key) return { errorCode: 'missing-api-key' };

    let url;
    try {
        url = new URL(String(profile.baseUrl || DEFAULT_BASES[provider] || '').trim());
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error();
        url.pathname = url.pathname.replace(/\/+$/, '').replace(/\/(?:chat\/completions|embeddings|responses|models)$/, '') + '/models';
        url.hash = '';
    } catch {
        return { errorCode: 'invalid-base-url' };
    }
    const headers = { Accept: 'application/json' };
    if (key) headers.Authorization = `Bearer ${key}`;
    return { url: url.toString(), headers };
}

/** Reads a catalog without saving the draft connection or generating a completion. */
async function listConnectionModels(profile, fetchImpl = fetch) {
    const request = catalogRequest(profile);
    if (request.errorCode) return { success: false, errorCode: request.errorCode };
    try {
        const response = await fetchImpl(request.url, {
            method: 'GET',
            headers: request.headers,
            redirect: 'error',
            signal: AbortSignal.timeout(15_000)
        });
        if (!response.ok) {
            const errorCode = {
                401: 'unauthorized', 403: 'forbidden', 404: 'not-found', 405: 'not-found', 429: 'rate-limited'
            }[response.status] || 'server-error';
            return { success: false, errorCode, status: response.status };
        }
        let body;
        try { body = await response.json(); } catch (error) {
            if (['TimeoutError', 'AbortError'].includes(error?.name)) throw error;
            return { success: false, errorCode: 'invalid-response' };
        }
        if (!Array.isArray(body?.data)) return { success: false, errorCode: 'invalid-response' };
        const models = [...new Set(body.data
            .filter(model => typeof model?.id === 'string')
            .map(model => model.id.trim()).filter(Boolean))].sort((left, right) => left.localeCompare(right));
        if (body.data.length && !models.length) return { success: false, errorCode: 'invalid-response' };
        return { success: true, models };
    } catch (error) {
        // Provider and transport errors can echo credentials; only return stable error codes.
        return { success: false, errorCode: ['TimeoutError', 'AbortError'].includes(error?.name) ? 'timeout' : 'network-error' };
    }
}

function registerModelCatalogIpc(ipcMain, fetchImpl) {
    ipcMain.handle('list-connection-models', (_event, profile) => listConnectionModels(profile, fetchImpl));
}

module.exports = { listConnectionModels, registerModelCatalogIpc };
