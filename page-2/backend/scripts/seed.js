// scripts/seed.js - Mengisi data awal tabel products
import 'dotenv/config';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runSeed() {
  try {
    console.log('[seed] Menjalankan seed.sql untuk products...');
    const seedSql = readFileSync(join(__dirname, '../sql/seed.sql'), 'utf8');
    await pool.query(seedSql);
    console.log('[seed] ✅ Data awal produk (Innoxa Unica AJ & Serum) berhasil dimasukkan ke PostgreSQL.');
  } catch (err) {
    console.error('[seed] ❌ Gagal menjalankan seed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
