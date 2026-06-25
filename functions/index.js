const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();
const { FieldValue } = admin.firestore;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Forward async handler rejections to the JSON error middleware below.
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Verify the Firebase ID token sent as `Authorization: Bearer <token>`.
async function verifyUser(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return { user: null, error: 'No access token provided' };
  try {
    return { user: await auth.verifyIdToken(token), error: null };
  } catch {
    return { user: null, error: 'Unauthorized' };
  }
}

// --- Management routes (must be registered before the mock catch-all) ---

// List the signed-in user's endpoints.
app.get('/endpoints', ah(async (req, res) => {
  const { user, error } = await verifyUser(req);
  if (!user) return res.status(401).json({ error });
  const snap = await db.collection('endpoints').where('userId', '==', user.uid).get();
  res.json({ endpoints: snap.docs.map((d) => d.data()) });
}));

// Create an endpoint. Path is unique platform-wide (matches original behavior).
app.post('/endpoints', ah(async (req, res) => {
  const { user, error } = await verifyUser(req);
  if (!user) return res.status(401).json({ error });

  const { name, method, path, responseData, statusCode, headers, description,
          delay, requireAuth, authToken, collectionId, queryParams, requestBody } = req.body;
  if (!name || !method || !path) {
    return res.status(400).json({ error: 'Name, method, and path are required' });
  }
  if (!path.startsWith('/')) {
    return res.status(400).json({ error: 'Path must start with /' });
  }

  const dup = await db.collection('endpoints').where('path', '==', path).limit(1).get();
  if (!dup.empty) {
    return res.status(400).json({ error: 'Path already exists. Please use a unique path.' });
  }

  const id = db.collection('endpoints').doc().id;
  const now = new Date().toISOString();
  const endpoint = {
    id, userId: user.uid, name, method: method.toUpperCase(), path,
    responseData: responseData || {}, statusCode: statusCode || 200,
    headers: headers || {}, description: description || '',
    delay: delay || 0, requireAuth: requireAuth || false, authToken: authToken || '',
    collectionId: collectionId || '',
    queryParams: Array.isArray(queryParams) ? queryParams : [],
    requestBody: requestBody || '',
    createdAt: now, updatedAt: now, callCount: 0,
  };
  await db.collection('endpoints').doc(id).set(endpoint);
  res.json({ endpoint });
}));

// Get one endpoint (owner only).
app.get('/endpoints/:id', ah(async (req, res) => {
  const { user, error } = await verifyUser(req);
  if (!user) return res.status(401).json({ error });
  const doc = await db.collection('endpoints').doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'Endpoint not found' });
  const endpoint = doc.data();
  if (endpoint.userId !== user.uid) return res.status(403).json({ error: 'Unauthorized' });
  res.json({ endpoint });
}));

// Update an endpoint (owner only).
app.put('/endpoints/:id', ah(async (req, res) => {
  const { user, error } = await verifyUser(req);
  if (!user) return res.status(401).json({ error });
  const ref = db.collection('endpoints').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ error: 'Endpoint not found' });
  const endpoint = doc.data();
  if (endpoint.userId !== user.uid) return res.status(403).json({ error: 'Unauthorized' });

  if (req.body.path && req.body.path !== endpoint.path) {
    const dup = await db.collection('endpoints').where('path', '==', req.body.path).limit(1).get();
    if (!dup.empty && dup.docs[0].id !== req.params.id) {
      return res.status(400).json({ error: 'Path already exists. Please use a unique path.' });
    }
  }

  const updated = {
    ...endpoint, ...req.body,
    id: req.params.id, userId: user.uid, updatedAt: new Date().toISOString(),
  };
  await ref.set(updated);
  res.json({ endpoint: updated });
}));

// Delete an endpoint (owner only).
app.delete('/endpoints/:id', ah(async (req, res) => {
  const { user, error } = await verifyUser(req);
  if (!user) return res.status(401).json({ error });
  const ref = db.collection('endpoints').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ error: 'Endpoint not found' });
  if (doc.data().userId !== user.uid) return res.status(403).json({ error: 'Unauthorized' });
  await ref.delete();
  res.json({ success: true });
}));

// Aggregate analytics for the signed-in user.
app.get('/analytics', ah(async (req, res) => {
  const { user, error } = await verifyUser(req);
  if (!user) return res.status(401).json({ error });

  const snap = await db.collection('endpoints').where('userId', '==', user.uid).get();
  const endpoints = snap.docs.map((d) => d.data());

  const totalEndpoints = endpoints.length;
  const totalCalls = endpoints.reduce((s, e) => s + (e.callCount || 0), 0);
  const activeEndpoints = endpoints.filter((e) => e.callCount > 0).length;

  const methodCounts = {};
  let totalMethodCalls = 0;
  for (const e of endpoints) {
    const m = e.method || 'GET';
    methodCounts[m] = (methodCounts[m] || 0) + (e.callCount || 0);
    totalMethodCalls += e.callCount || 0;
  }
  const methodDistribution = {};
  if (totalMethodCalls > 0) {
    for (const [m, c] of Object.entries(methodCounts)) {
      methodDistribution[m] = Math.round((c / totalMethodCalls) * 100);
    }
  } else {
    Object.assign(methodDistribution, { GET: 0, POST: 0, PUT: 0, DELETE: 0 });
  }

  // Last 7 days of daily stats from analytics/<uid>_<date> docs (fetched in parallel).
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const dayDocs = await db.getAll(
    ...dates.map((date) => db.collection('analytics').doc(`${user.uid}_${date}`)),
  );
  const dailyStats = dates.map((date, i) => {
    const day = dayDocs[i].data() || {};
    return { date, calls: day.calls || 0, errors: day.errors || 0 };
  });

  const trackedCalls = dailyStats.reduce((s, d) => s + d.calls, 0);
  const totalErrors = dailyStats.reduce((s, d) => s + d.errors, 0);
  const successRate = trackedCalls > 0
    ? Number((((trackedCalls - totalErrors) / trackedCalls) * 100).toFixed(1))
    : 100;

  res.json({
    analytics: {
      totalEndpoints, totalCalls, activeEndpoints,
      avgResponseTime: 45, // ponytail: hardcoded as before; wire real timing if it matters
      successRate, dailyStats, methodDistribution,
    },
  });
}));

// --- Collections: group a user's endpoints into shareable projects. ---

// List the signed-in user's collections.
app.get('/collections', ah(async (req, res) => {
  const { user, error } = await verifyUser(req);
  if (!user) return res.status(401).json({ error });
  const snap = await db.collection('collections').where('userId', '==', user.uid).get();
  res.json({ collections: snap.docs.map((d) => d.data()) });
}));

// Create a collection. shareId is unguessable so the link itself is the access token.
app.post('/collections', ah(async (req, res) => {
  const { user, error } = await verifyUser(req);
  if (!user) return res.status(401).json({ error });
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const id = db.collection('collections').doc().id;
  const collection = {
    id, userId: user.uid, name,
    isPublic: false, shareId: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await db.collection('collections').doc(id).set(collection);
  res.json({ collection });
}));

// Update a collection — rename or toggle public sharing (owner only).
app.put('/collections/:id', ah(async (req, res) => {
  const { user, error } = await verifyUser(req);
  if (!user) return res.status(401).json({ error });
  const ref = db.collection('collections').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ error: 'Collection not found' });
  if (doc.data().userId !== user.uid) return res.status(403).json({ error: 'Unauthorized' });

  const patch = {};
  if (typeof req.body.name === 'string') patch.name = req.body.name;
  if (typeof req.body.isPublic === 'boolean') patch.isPublic = req.body.isPublic;
  await ref.update(patch);
  res.json({ collection: { ...doc.data(), ...patch } });
}));

// Delete a collection. Its endpoints survive but become uncategorized.
app.delete('/collections/:id', ah(async (req, res) => {
  const { user, error } = await verifyUser(req);
  if (!user) return res.status(401).json({ error });
  const ref = db.collection('collections').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) return res.status(404).json({ error: 'Collection not found' });
  if (doc.data().userId !== user.uid) return res.status(403).json({ error: 'Unauthorized' });

  const members = await db.collection('endpoints')
    .where('userId', '==', user.uid).where('collectionId', '==', req.params.id).get();
  const batch = db.batch();
  members.docs.forEach((d) => batch.update(d.ref, { collectionId: '' }));
  batch.delete(ref);
  await batch.commit();
  res.json({ success: true });
}));

// Public, unauthenticated read of a shared collection by its shareId.
app.get('/share/:shareId', ah(async (req, res) => {
  const snap = await db.collection('collections')
    .where('shareId', '==', req.params.shareId).limit(1).get();
  if (snap.empty) return res.status(404).json({ error: 'Collection not found' });
  const collection = snap.docs[0].data();
  if (!collection.isPublic) return res.status(403).json({ error: 'This collection is not shared' });

  const eps = await db.collection('endpoints').where('collectionId', '==', collection.id).get();
  // Strip secrets — a public viewer must not see auth tokens or the owner id.
  const endpoints = eps.docs.map((d) => {
    const { authToken, userId, ...safe } = d.data();
    return safe;
  });
  res.json({ collection: { name: collection.name, shareId: collection.shareId }, endpoints });
}));

// --- Mock API handler: any other path replays the configured response. ---
app.all('*', ah(async (req, res) => {
  const path = req.path;
  const snap = await db.collection('endpoints').where('path', '==', path).limit(1).get();
  if (snap.empty) return res.status(404).json({ error: 'Endpoint not found' });
  const endpoint = snap.docs[0].data();

  if (endpoint.requireAuth) {
    const token = req.header('X-Auth-Token');
    if (!token || token !== endpoint.authToken) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing X-Auth-Token' });
    }
  }

  if (endpoint.delay > 0) {
    await new Promise((r) => setTimeout(r, endpoint.delay));
  }

  // Await analytics: serverless instances are frozen after the response.
  const date = new Date().toISOString().split('T')[0];
  const status = endpoint.statusCode || 200;
  await Promise.all([
    db.collection('endpoints').doc(endpoint.id).update({ callCount: FieldValue.increment(1) }),
    db.collection('analytics').doc(`${endpoint.userId}_${date}`).set({
      userId: endpoint.userId, date,
      calls: FieldValue.increment(1),
      errors: FieldValue.increment(status >= 400 ? 1 : 0),
    }, { merge: true }),
  ]);

  res.status(status).set(endpoint.headers || {}).json(endpoint.responseData);
}));

// JSON error handler — keeps failures readable instead of an HTML 500 page.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

exports.api = onRequest(app);
