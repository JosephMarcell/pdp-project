// db.js - Koneksi PostgreSQL dan Manajemen Skema Database
import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL || 'postgresql://app_user:change-me@localhost:5432/product_api';
const ssl = process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false;

export const pool = new Pool({
  connectionString,
  ssl,
});

export const query = (text, params) => pool.query(text, params);

/**
 * Memformat baris dari tabel PostgreSQL products agar memiliki
 * struktur objek produk lengkap untuk konsumsi frontend PDP.
 */
export function formatProduct(row) {
  if (!row) return null;
  const variation = typeof row.variation === 'string' ? JSON.parse(row.variation) : (row.variation || []);
  const features = typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []);
  
  return {
    id: Number(row.id),
    Name: row.name,
    Photo: row.photo,
    Variation: variation,
    Description: row.description || '',
    'More Information': row.more_information || '',
    Features: features,
    // Alias lowercase untuk kemudahan akses
    name: row.name,
    photo: row.photo,
    variation: variation,
    description: row.description || '',
    more_information: row.more_information || '',
    features: features,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

/**
 * Inisialisasi otomatis: Buat tabel jika belum ada dan seed data awal jika kosong
 */
export async function initDb() {
  const schemaSql = readFileSync(join(__dirname, 'sql/schema.sql'), 'utf8');
  await pool.query(schemaSql);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM products WHERE id IN (1, 2)');
  if (rows[0].count === 0) {
    console.log('🌱 Mengisi data awal (seeding) untuk tabel products...');
    const seedSql = readFileSync(join(__dirname, 'sql/seed.sql'), 'utf8');
    await pool.query(seedSql);
    console.log('✅ Seed data products berhasil dimasukkan.');
  }
}
