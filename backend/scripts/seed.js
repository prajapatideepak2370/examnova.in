/**
 * Seeds the portal with a super-admin account, the ten study categories, twelve
 * sample study materials (generated as real, readable PDFs) and a GK/Maths/Reasoning
 * question bank.
 *
 * Usage:
 *   npm run seed            # adds anything that is missing
 *   npm run seed -- --reset # deletes all documents, questions and stored files first
 */
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { seedDatabase } from '../services/seed.service.js';

async function run() {
  const reset = process.argv.includes('--reset');

  try {
    await connectDatabase();

    console.log(`[seed] starting${reset ? ' with reset' : ''}...`);
    const summary = await seedDatabase({ reset });

    console.log('\n[seed] finished');
    console.log(`  admin account : ${summary.admin ? 'ready' : 'skipped'}`);
    console.log(`  categories    : ${summary.categories}`);
    console.log(`  documents     : ${summary.documents}`);
    console.log(`  questions     : ${summary.questions}`);
    if (reset) {
      console.log(`  removed       : ${summary.removedDocuments} document(s), ${summary.removedQuestions} question(s)`);
    }
    console.log('\n  Sign in at /admin/login with the ADMIN_EMAIL and ADMIN_PASSWORD from backend/.env\n');
  } catch (err) {
    console.error('[seed] failed:', err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

run();
