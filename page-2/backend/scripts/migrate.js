// scripts/migrate.js - Menjalankan migrasi DDL untuk tabel products
import 'dotenv/config';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigrate() {
  try {
    console.log('[migrate] Menjalankan schema.sql untuk products...');
    const schemaSql = readFileSync(join(__dirname, '../sql/schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('[migrate] ✅ Tabel products berhasil dipastikan ada di PostgreSQL.');
  } catch (err) {
    console.error('[migrate] ❌ Gagal menjalankan migrasi:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrate();
