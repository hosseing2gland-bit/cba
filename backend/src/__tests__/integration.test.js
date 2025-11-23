import assert from 'node:assert';
import { before, after, beforeEach, test } from 'node:test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Profile from '../models/Profile.js';
import ProfileHistory from '../models/ProfileHistory.js';
import { generateAccessToken } from '../services/tokenService.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh';
process.env.ENCRYPTION_KEY = '12345678901234567890123456789012';
process.env.AWS_BUCKET = 'test-bucket';

const { default: app, connectDatabase, disconnectDatabase } = await import('../server.js');

let mongo;
let server;
let baseUrl;
let owner;
let admin;
let member;
let team;
let profileId;

function authHeader(user) {
  const token = generateAccessToken({ sub: user.id, role: user.role });
  return { Authorization: `Bearer ${token}` };
}

async function api(path, { method = 'GET', body, headers = {}, user } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(user ? authHeader(user) : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json();
  return { status: response.status, body: json };
}

before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDatabase(mongo.getUri());
  server = app.listen(0);
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) server.close();
  await disconnectDatabase();
  if (mongo) await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    Profile.deleteMany({}),
    ProfileHistory.deleteMany({}),
  ]);

  owner = await User.create({ email: 'owner@test.com', password: 'Password1!', name: 'Owner', role: 'user' });
  admin = await User.create({ email: 'admin@test.com', password: 'Password1!', name: 'Admin', role: 'user' });
  member = await User.create({ email: 'member@test.com', password: 'Password1!', name: 'Member', role: 'user' });

  team = await Team.create({
    name: 'Test Team',
    owner: owner._id,
    members: [
      { user: owner._id, role: 'owner' },
      { user: admin._id, role: 'admin' },
      { user: member._id, role: 'member' },
    ],
  });

  const created = await api('/api/profiles', { method: 'POST', body: { name: 'Primary Profile' }, user: owner });
  profileId = created.body._id;
  await api(`/api/profiles/${profileId}/share`, { method: 'POST', body: { teamId: team.id }, user: owner });
});

test('team member cannot clone while admin can', async () => {
  const memberClone = await api(`/api/profiles/${profileId}/clone`, { method: 'POST', user: member });
  assert.strictEqual(memberClone.status, 403);

  const adminClone = await api(`/api/profiles/${profileId}/clone`, { method: 'POST', user: admin });
  assert.strictEqual(adminClone.status, 201);
  assert.ok(adminClone.body._id);
  const history = await ProfileHistory.find({ profile: adminClone.body._id, action: 'clone' });
  assert.strictEqual(history.length, 1);
});

test('team admin syncs profile with history and cloud metadata', async () => {
  const syncResponse = await api(`/api/profiles/${profileId}/sync`, {
    method: 'POST',
    body: { data: { status: 'ok' } },
    user: admin,
  });

  assert.strictEqual(syncResponse.status, 200);
  assert.ok(syncResponse.body.cloudSync.bucket);
  assert.ok(syncResponse.body.cloudSync.key);
  const profile = await Profile.findById(profileId);
  assert.ok(profile.cloudSync.encryptedData);
  const history = await ProfileHistory.find({ profile: profileId, action: 'sync' });
  assert.strictEqual(history.length, 1);
});

test('team member cannot share profiles', async () => {
  const share = await api(`/api/teams/${team.id}/share-profile`, {
    method: 'POST',
    body: { profileId },
    user: member,
  });
  assert.strictEqual(share.status, 403);
});
