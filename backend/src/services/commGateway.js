/**
 * Lightweight communication gateway skeleton to support future admin-client channels.
 * This module keeps the surface minimal while documenting the intended contract.
 */

const channels = new Map();

export function registerChannel(name, handler) {
  channels.set(name, handler);
}

export function unregisterChannel(name) {
  channels.delete(name);
}

export function startGatewayServer(app) {
  // Placeholder: attach REST or WebSocket gateway endpoints here.
  // Example: app.get(`/gateway/${name}`, handler)
  // Channels should only allow authenticated admin <-> client interactions.
  return {
    channels,
    stop() {
      channels.clear();
    },
  };
}

export function describeGateway() {
  return {
    status: 'planned',
    description: 'Future secure channel between admin and client via WebSocket/REST gateway.',
    channels: Array.from(channels.keys()),
  };
}
