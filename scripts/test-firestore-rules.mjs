import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test, { describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const rulesPath = path.join(rootDir, 'firestore.rules');
const rulesContent = fs.readFileSync(rulesPath, 'utf8');

const PROJECT_ID = 'devvault-rules-test-' + Date.now();

describe('Firestore Security Rules - Strict Owner Isolation (Spark Plan ₹0 Budget)', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: rulesContent,
        host: '127.0.0.1',
        port: 8085,
      },
    });
  });

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  test('1. Unauthenticated requests MUST be denied reading user data (Default Deny)', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = unauthedDb.doc('users/alice/notes/note-1');
    await assertFails(docRef.get());
  });

  test('2. Unauthenticated requests MUST be denied writing user data (Zero Public Write)', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = unauthedDb.doc('users/alice/notes/note-1');
    await assertFails(docRef.set({ title: 'Hacked Note' }));
  });

  test('3. Authenticated attacker MUST be denied reading another user private data', async () => {
    const bobDb = testEnv.authenticatedContext('bob', { email: 'bob@example.com' }).firestore();
    const aliceDocRef = bobDb.doc('users/alice/notes/note-secret');
    await assertFails(aliceDocRef.get());
  });

  test('4. Authenticated attacker MUST be denied writing to another user private data', async () => {
    const bobDb = testEnv.authenticatedContext('bob', { email: 'bob@example.com' }).firestore();
    const aliceDocRef = bobDb.doc('users/alice/problems/prob-1');
    await assertFails(aliceDocRef.set({ title: 'Tampered Problem' }));
  });

  test('5. Authenticated owner MUST be allowed to create and read their own notes', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { email: 'alice@example.com' }).firestore();
    const aliceNoteRef = aliceDb.doc('users/alice/notes/note-1');
    await assertSucceeds(aliceNoteRef.set({
      title: 'Spring Boot Architecture Note',
      category: 'Java',
      tags: ['spring', 'backend'],
      createdAt: new Date().toISOString(),
    }));
    await assertSucceeds(aliceNoteRef.get());
  });

  test('6. Authenticated owner MUST be allowed to create, update, and delete their own problems', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { email: 'alice@example.com' }).firestore();
    const problemRef = aliceDb.doc('users/alice/problems/prob-lru');
    
    // Create
    await assertSucceeds(problemRef.set({
      title: 'LRU Cache',
      difficulty: 'MEDIUM',
      status: 'SOLVED',
      createdAt: new Date().toISOString(),
    }));

    // Update
    await assertSucceeds(problemRef.update({
      notes: 'DoublyLinkedList + HashMap approach',
      updatedAt: new Date().toISOString(),
    }));

    // Delete
    await assertSucceeds(problemRef.delete());
  });

  test('7. Authenticated owner MUST be allowed to access nested subcollections (e.g. company folders)', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { email: 'alice@example.com' }).firestore();
    const folderRef = aliceDb.doc('users/alice/companies/paypal/folders/round-1');
    await assertSucceeds(folderRef.set({
      name: 'System Design Round',
      sortOrder: 1,
    }));
    await assertSucceeds(folderRef.get());
  });

  test('8. Root-level documents outside /users/ MUST be denied even for authenticated users', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { email: 'alice@example.com' }).firestore();
    const rootDocRef = aliceDb.doc('notes/global-note');
    await assertFails(rootDocRef.get());
    await assertFails(rootDocRef.set({ title: 'Global Public Note' }));
  });
});
