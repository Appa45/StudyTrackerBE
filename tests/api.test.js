import test from 'node:test';
import assert from 'node:assert/strict';

// app/config modules read environment variables at import time, so set test defaults first.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studytrack_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-that-is-long-enough';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const { app } = await import('../src/app.js');
const { default: request } = await import('supertest');

test('GET /api/health returns service status', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.status, 'ok');
});

test('Unknown routes return a consistent 404 shape', async () => {
  const response = await request(app).get('/api/does-not-exist');
  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.match(response.body.error, /Route not found/);
});

test('Protected topics endpoint rejects unauthenticated requests', async () => {
  const response = await request(app).get('/api/topics');
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});
