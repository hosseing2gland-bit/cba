import test from 'node:test';
import assert from 'node:assert/strict';
import { notFoundHandler, errorHandler } from '../../src/utils/errorHandlers.js';

test('notFoundHandler returns 404 payload', () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  notFoundHandler({}, res, () => {});

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: 'Resource not found' });
});

test('errorHandler falls back to 500 status and message', () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  errorHandler(new Error('Boom'), {}, res, () => {});

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { message: 'Boom' });
});
