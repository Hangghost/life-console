import type { API } from '../../../preload/index'

// Access the API exposed via contextBridge
export const api = (window as unknown as { api: API }).api
