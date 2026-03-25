import { contextBridge, ipcRenderer } from 'electron'
import type {
  CreateObjectPayload,
  UpdateObjectPayload,
  QueryObjectsFilter,
  CreateRelationPayload,
  LifeObject,
  Relation,
  SearchResult,
  RegisteredPlugin,
  PluginStatusEvent,
  InferenceResult,
  AppSettings
} from '../shared/types'

// ─── Typed API exposed to renderer ───────────────────────────────────────────

const api = {
  objects: {
    create: (payload: CreateObjectPayload): Promise<LifeObject> =>
      ipcRenderer.invoke('objects:create', payload),
    update: (payload: UpdateObjectPayload): Promise<LifeObject> =>
      ipcRenderer.invoke('objects:update', payload),
    query: (filter: QueryObjectsFilter): Promise<LifeObject[]> =>
      ipcRenderer.invoke('objects:query', filter),
    delete: (id: string): Promise<void> => ipcRenderer.invoke('objects:delete', id)
  },

  relations: {
    create: (payload: CreateRelationPayload): Promise<Relation> =>
      ipcRenderer.invoke('relations:create', payload),
    query: (filter: { from_id?: string; to_id?: string }): Promise<Relation[]> =>
      ipcRenderer.invoke('relations:query', filter)
  },

  search: {
    query: (q: string): Promise<SearchResult> => ipcRenderer.invoke('search:query', q)
  },

  inbox: {
    onInfer: (cb: (result: InferenceResult) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, result: InferenceResult): void =>
        cb(result)
      ipcRenderer.on('inbox:infer', handler)
      return () => ipcRenderer.removeListener('inbox:infer', handler)
    }
  },

  plugins: {
    list: (): Promise<RegisteredPlugin[]> => ipcRenderer.invoke('plugins:list'),
    run: (name: string, input: Record<string, unknown>): Promise<string> =>
      ipcRenderer.invoke('plugins:run', name, input),
    onStatus: (cb: (event: PluginStatusEvent) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, status: PluginStatusEvent): void =>
        cb(status)
      ipcRenderer.on('plugins:status', handler)
      return () => ipcRenderer.removeListener('plugins:status', handler)
    },
    approvePlugin: (name: string): Promise<void> =>
      ipcRenderer.invoke('plugins:approve', name),
    denyPlugin: (name: string): Promise<void> =>
      ipcRenderer.invoke('plugins:deny', name)
  },

  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    set: (settings: Partial<AppSettings>): Promise<void> =>
      ipcRenderer.invoke('settings:set', settings)
  },

  shell: {
    launchExternal: (app: string, path?: string): void =>
      ipcRenderer.send('shell:launch-external', { app, path })
  }
}

contextBridge.exposeInMainWorld('api', api)

// Forward inbox:trigger-infer window events to main process
window.addEventListener('inbox:trigger-infer', (e) => {
  const detail = (e as CustomEvent<{ id: string; content: string }>).detail
  ipcRenderer.send('inbox:trigger-infer', detail.id, detail.content)
})

// Forward launch-external events to main process
window.addEventListener('launch-external', (e) => {
  const detail = (e as CustomEvent<{ app: string; path?: string }>).detail
  ipcRenderer.send('shell:launch-external', detail)
})

export type API = typeof api
