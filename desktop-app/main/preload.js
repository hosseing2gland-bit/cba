import { contextBridge } from 'electron';
import { BACKEND_URL } from './main.js';

contextBridge.exposeInMainWorld('api', {
  backendUrl: BACKEND_URL,
  async request(path, options = {}) {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
});
