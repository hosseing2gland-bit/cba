import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../../src/server.js';

test('GET /health responds with ok status', async () => {
  const server = http.createServer(app);
  server.listen(0);
  const { port } = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.status, 'ok');
  } finally {
    server.close();
  }
});
