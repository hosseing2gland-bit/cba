import { contextBridge } from 'electron';
import { BACKEND_URL } from './main.js';

const secureFetch = async (path, options = {}) => {
  const allowed = ['/api/auth/login', '/api/auth/register', '/api/profiles', '/api/team'];
  if (!allowed.some((allowedPath) => path.startsWith(allowedPath))) {
    throw new Error('Path blocked by preload policy');
  }

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
};

contextBridge.exposeInMainWorld('api', {
  backendUrl: BACKEND_URL,
  async request(path, options = {}) {
    return secureFetch(path, options);
  },
  async refreshToken(refreshToken) {
    const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Refresh failed');
    return data;
  },
  async downloadProfileFile(profileId) {
    const url = `${BACKEND_URL}/api/profiles/${profileId}/download`;
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to download');
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return { fileName: `profile-${profileId}.json`, base64 };
  },
});
