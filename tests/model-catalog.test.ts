import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const { listConnectionModels, registerModelCatalogIpc } = require('../src/main/features/llm/model-catalog');
const profile = { provider: 'OpenAI', apiKey: 'test-key' };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('connection model discovery', () => {
  it('routes the actual preload API to the registered main-process handler', async () => {
    const handlers = new Map<string, (event: unknown, draft: unknown) => Promise<unknown>>();
    const exposed: Record<string, any> = {};
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(response({ data: [{ id: 'available-model' }] }));
    registerModelCatalogIpc({ handle: (name: string, handler: (event: unknown, draft: unknown) => Promise<unknown>) => handlers.set(name, handler) }, fetchImpl);
    const invoke = vi.fn(async (name: string, draft: unknown) => {
      const handler = handlers.get(name);
      if (!handler) throw new Error('No IPC handler: ' + name);
      return handler({}, draft);
    });
    runInNewContext(readFileSync(new URL('../src/preload.js', import.meta.url), 'utf8'), {
      require: (name: string) => {
        if (name !== 'electron') throw new Error('Unexpected dependency: ' + name);
        return { contextBridge: { exposeInMainWorld: (key: string, value: unknown) => { exposed[key] = value; } }, ipcRenderer: { invoke } };
      }
    });
    expect(await exposed.electronAPI.listConnectionModels(profile)).toEqual({ success: true, models: ['available-model'] });
    expect(invoke).toHaveBeenCalledWith('list-connection-models', profile);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('reads the official OpenAI catalog with a bearer key and no generation request', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(response({ data: [
      { id: 'z-chat' }, { id: 'a-chat' }, { id: 'z-chat' }, { id: ' ' }, {}, { id: 42 }
    ] }));
    expect(await listConnectionModels(profile, fetchImpl)).toEqual({ success: true, models: ['a-chat', 'z-chat'] });
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(fetchImpl).toHaveBeenCalledWith('https://api.openai.com/v1/models', expect.objectContaining({
      method: 'GET', headers: { Accept: 'application/json', Authorization: 'Bearer test-key' }, redirect: 'error'
    }));
    expect(fetchImpl.mock.calls[0][1]).not.toHaveProperty('body');
  });

  it.each(['chat/completions', 'embeddings', 'responses', 'models', ''])('uses the same custom API base from a %s URL', async suffix => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(response({ data: [] }));
    await listConnectionModels({ ...profile, baseUrl: `https://proxy.example/api/v1/${suffix}/` }, fetchImpl);
    expect(fetchImpl.mock.calls[0][0]).toBe('https://proxy.example/api/v1/models');
  });

  it('supports OpenRouter and local compatible servers without requiring a key', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(response({ data: [{ id: 'local-model' }] }));
    await listConnectionModels({ provider: 'Local', baseUrl: 'http://127.0.0.1:1234/v1' }, fetchImpl);
    expect(fetchImpl.mock.calls[0][0]).toBe('http://127.0.0.1:1234/v1/models');
    expect(fetchImpl.mock.calls[0][1]?.headers).not.toHaveProperty('Authorization');
    await listConnectionModels({ provider: 'OpenRouter' }, fetchImpl);
    expect(fetchImpl.mock.calls[1][0]).toBe('https://openrouter.ai/api/v1/models');
  });

  it('validates the draft before using the network', async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    expect(await listConnectionModels({ provider: 'OpenAI', apiKey: ' ' }, fetchImpl)).toEqual({ success: false, errorCode: 'missing-api-key' });
    expect(await listConnectionModels({ provider: 'Local', baseUrl: '' }, fetchImpl)).toEqual({ success: false, errorCode: 'invalid-base-url' });
    for (const baseUrl of ['file:///private', 'not-a-url', 'https://user:password@example.com/v1']) {
      expect(await listConnectionModels({ ...profile, baseUrl }, fetchImpl)).toEqual({ success: false, errorCode: 'invalid-base-url' });
    }
    expect(await listConnectionModels({ provider: 'AWS Bedrock' }, fetchImpl)).toEqual({ success: false, errorCode: 'unsupported-provider' });
    expect(await listConnectionModels(null, fetchImpl)).toEqual({ success: false, errorCode: 'unsupported-provider' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each([[401, 'unauthorized'], [403, 'forbidden'], [404, 'not-found'], [405, 'not-found'], [429, 'rate-limited'], [503, 'server-error']])('returns a safe error for HTTP %i', async (status, errorCode) => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(response({ error: { message: 'Do not echo test-key' } }, Number(status)));
    expect(await listConnectionModels(profile, fetchImpl)).toEqual({ success: false, errorCode, status });
  });

  it.each([{}, { data: {} }, { data: [{ id: null }] }, { error: { message: 'test-key' } }])('rejects an invalid success payload', async body => {
    expect(await listConnectionModels(profile, vi.fn<typeof fetch>().mockResolvedValue(response(body))))
      .toEqual({ success: false, errorCode: 'invalid-response' });
  });

  it('distinguishes malformed JSON, timeouts and transport failures without echoing secrets', async () => {
    expect(await listConnectionModels(profile, vi.fn<typeof fetch>().mockResolvedValue(new Response('<html>test-key</html>'))))
      .toEqual({ success: false, errorCode: 'invalid-response' });
    for (const name of ['TimeoutError', 'AbortError', 'TypeError']) {
      const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(Object.assign(new Error('test-key'), { name }));
      expect(await listConnectionModels(profile, fetchImpl)).toEqual({ success: false, errorCode: name === 'TypeError' ? 'network-error' : 'timeout' });
    }
    const abortedBody = response({ data: [] });
    abortedBody.json = () => Promise.reject(Object.assign(new Error('test-key'), { name: 'AbortError' }));
    expect(await listConnectionModels(profile, vi.fn<typeof fetch>().mockResolvedValue(abortedBody)))
      .toEqual({ success: false, errorCode: 'timeout' });
  });
});
