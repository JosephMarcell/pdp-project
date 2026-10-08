import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pool, query, formatProduct, initDb } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middleware Global
// Izinkan semua origin CORS agar frontend (Live Server port 5500, Vite port 5173, dll.) lancar
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Sajikan file statis frontend untuk akses mudah via browser
app.use('/page-2', express.static(join(__dirname, '../frontend')));
app.use('/page-1', express.static(join(__dirname, '../../page-1')));

// 2. ROUTE DASAR (GET Method)
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Katalog Produk - REST API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 680px; margin: 40px auto; padding: 0 20px; color: #333; line-height: 1.5; }
          h1 { font-size: 1.4rem; margin-bottom: 4px; color: #111; }
          p { color: #666; margin-bottom: 20px; font-size: 0.9rem; }
          .section-title { font-size: 0.95rem; font-weight: 600; margin: 20px 0 8px; color: #111; }
          ul { list-style: none; padding: 0; margin: 0 0 16px; }
          li { padding: 8px 12px; border: 1px solid #e5e5e5; border-radius: 6px; margin-bottom: 6px; font-size: 0.88rem; display: flex; justify-content: space-between; align-items: center; }
          a { color: #0969da; text-decoration: none; font-weight: 500; }
          a:hover { text-decoration: underline; }
          .method { font-family: monospace; font-weight: bold; font-size: 0.78rem; padding: 2px 6px; border-radius: 4px; background: #f1f3f5; color: #495057; }
          .desc { color: #777; font-size: 0.82rem; }
        </style>
      </head>
      <body>
        <h1>Katalog Produk - Backend REST API</h1>
        <p>Database: PostgreSQL (<code>product_api</code> -> <code>products</code>)</p>

        <div class="section-title">Halaman Web</div>
        <ul>
          <li>
            <a href="/page-2/">Page 2: Product Detail Page (Dynamic - PostgreSQL)</a>
            <span class="desc">Frontend Dinamis</span>
          </li>
          <li>
            <a href="/page-1/">Page 1: Product Detail Page (Static)</a>
            <span class="desc">Frontend Hardcoded</span>
          </li>
        </ul>

        <div class="section-title">Endpoint REST API</div>
        <ul>
          <li>
            <span><span class="method">GET</span> <a href="/api/status">/api/status</a></span>
            <span class="desc">Status server & database</span>
          </li>
          <li>
            <span><span class="method">GET</span> <a href="/api/products">/api/products</a></span>
            <span class="desc">Daftar semua produk</span>
          </li>
          <li>
            <span><span class="method">GET</span> <a href="/api/products/1">/api/products/1</a></span>
            <span class="desc">Detail produk ID 1</span>
          </li>
          <li>
            <span><span class="method">POST</span> /api/products</span>
            <span class="desc">Tambah produk</span>
          </li>
          <li>
            <span><span class="method">PUT</span> /api/products/:id</span>
            <span class="desc">Ubah produk</span>
          </li>
          <li>
            <span><span class="method">DELETE</span> /api/products/:id</span>
            <span class="desc">Hapus produk</span>
          </li>
        </ul>
      </body>
      </html>
    `);
    return;
  }
  res.send('Selamat datang di Backend REST API dengan PostgreSQL.');
});

// 3. ROUTE REST API STATUS
app.get('/api/status', async (req, res) => {
  try {
    const dbTest = await query('SELECT NOW() as current_time, COUNT(*)::int as product_count FROM products');
    res.json({
      status: 'success',
      pesan: 'Server Backend berjalan dengan baik!',
      database: 'PostgreSQL connected',
      total_produk_di_db: dbTest.rows[0].product_count,
      waktu_db: dbTest.rows[0].current_time,
      waktu: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      pesan: 'Koneksi database PostgreSQL bermasalah',
      error: err.message
    });
  }
});

// ==========================================
// LEVEL 2: MEMBACA DATA DARI POSTGRESQL (READ)
// ==========================================

// ENDPOINT 1: Ambil SEMUA data produk
// GET /api/products (alias: /api/product, /api/books)
const getAllProducts = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM products ORDER BY id ASC');
    const products = rows.map(formatProduct);
    res.json({
      status: 'success',
      total: products.length,
      data: products
    });
  } catch (err) {
    console.error('[API Error - getAllProducts]:', err.message);
    res.status(500).json({
      status: 'error',
      pesan: 'Terjadi kesalahan pada server saat mengambil data produk.'
    });
  }
};
app.get('/api/products', getAllProducts);
app.get('/api/product', getAllProducts);
app.get('/api/books', getAllProducts);

// ENDPOINT 2: Ambil SATU produk berdasarkan ID
// GET /api/products/:id
const getProductById = async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) {
    return res.status(400).json({
      status: 'error',
      pesan: 'ID produk harus berupa angka valid!'
    });
  }

  try {
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [productId]);
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        pesan: `Produk dengan ID ${productId} tidak ditemukan!`
      });
    }

    res.json({
      status: 'success',
      data: formatProduct(rows[0])
    });
  } catch (err) {
    console.error(`[API Error - getProductById ${productId}]:`, err.message);
    res.status(500).json({
      status: 'error',
      pesan: 'Terjadi kesalahan pada server saat mencari produk.'
    });
  }
};
app.get('/api/products/:id', getProductById);
app.get('/api/product/:id', getProductById);
app.get('/api/books/:id', getProductById);

// ==========================================
// LEVEL 3: MENAMBAHKAN DATA KE POSTGRESQL (CREATE)
// ==========================================

// ENDPOINT 3: Tambah produk baru
// POST /api/products
const createProduct = async (req, res) => {
  const {
    Name,
    name,
    Photo,
    photo,
    Variation,
    variation,
    Description,
    description,
    Features,
    features
  } = req.body;

  const productName = Name || name;
  const productVariation = Variation || variation;

  if (!productName || !productVariation) {
    return res.status(400).json({
      status: 'error',
      pesan: 'Field Name dan Variation wajib diisi!'
    });
  }

  const productPhoto = Photo || photo || 'unica.jpeg';
  const productDesc = Description || description || '';
  const moreInfo = req.body['More Information'] || req.body.moreInformation || req.body.more_information || '';
  const productFeatures = Features || features || [];

  try {
    const sql = `
      INSERT INTO products (name, photo, variation, description, more_information, features)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const params = [
      productName,
      productPhoto,
      JSON.stringify(productVariation),
      productDesc,
      moreInfo,
      JSON.stringify(productFeatures)
    ];

    const { rows } = await query(sql, params);
    const newProduct = formatProduct(rows[0]);

    res.status(201).json({
      status: 'success',
      pesan: 'Produk baru berhasil ditambahkan!',
      data: newProduct
    });
  } catch (err) {
    console.error('[API Error - createProduct]:', err.message);
    res.status(500).json({
      status: 'error',
      pesan: 'Gagal menambahkan produk ke database.'
    });
  }
};
app.post('/api/products', createProduct);
app.post('/api/product', createProduct);
app.post('/api/books', createProduct);

// ==========================================
// LEVEL 4: MENGUBAH & MENGHAPUS DATA (UPDATE & DELETE)
// ==========================================

// ENDPOINT 4: Ubah data produk
// PUT /api/products/:id
const updateProduct = async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) {
    return res.status(400).json({
      status: 'error',
      pesan: 'ID produk harus berupa angka valid!'
    });
  }

  try {
    // 1. Ambil data produk saat ini
    const { rows: existingRows } = await query('SELECT * FROM products WHERE id = $1', [productId]);
    if (existingRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        pesan: `Gagal update: Produk dengan ID ${productId} tidak ditemukan!`
      });
    }

    const current = existingRows[0];
    const reqName = req.body.Name || req.body.name;
    const reqPhoto = req.body.Photo || req.body.photo;
    const reqVariation = req.body.Variation || req.body.variation;
    const reqDesc = req.body.Description || req.body.description;
    const reqMoreInfo = req.body['More Information'] || req.body.moreInformation || req.body.more_information;
    const reqFeatures = req.body.Features || req.body.features;

    const toPgJson = (val) => {
      if (val === undefined || val === null) return '[]';
      return typeof val === 'string' ? val : JSON.stringify(val);
    };

    const updatedName = reqName !== undefined ? reqName : current.name;
    const updatedPhoto = reqPhoto !== undefined ? reqPhoto : current.photo;
    const updatedVariation = toPgJson(reqVariation !== undefined ? reqVariation : current.variation);
    const updatedDesc = reqDesc !== undefined ? reqDesc : current.description;
    const updatedMoreInfo = reqMoreInfo !== undefined ? reqMoreInfo : current.more_information;
    const updatedFeatures = toPgJson(reqFeatures !== undefined ? reqFeatures : current.features);

    const updateSql = `
      UPDATE products
      SET 
        name = $1,
        photo = $2,
        variation = $3,
        description = $4,
        more_information = $5,
        features = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *;
    `;
    const { rows: updatedRows } = await query(updateSql, [
      updatedName,
      updatedPhoto,
      updatedVariation,
      updatedDesc,
      updatedMoreInfo,
      updatedFeatures,
      productId
    ]);

    res.json({
      status: 'success',
      pesan: 'Data produk berhasil diperbarui!',
      data: formatProduct(updatedRows[0])
    });
  } catch (err) {
    console.error(`[API Error - updateProduct ${productId}]:`, err.message);
    res.status(500).json({
      status: 'error',
      pesan: 'Gagal memperbarui data produk di database.'
    });
  }
};
app.put('/api/products/:id', updateProduct);
app.put('/api/product/:id', updateProduct);
app.put('/api/books/:id', updateProduct);

// ENDPOINT 5: Hapus produk
// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) {
    return res.status(400).json({
      status: 'error',
      pesan: 'ID produk harus berupa angka valid!'
    });
  }

  try {
    const { rows } = await query('DELETE FROM products WHERE id = $1 RETURNING *', [productId]);
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        pesan: `Gagal menghapus: Produk dengan ID ${productId} tidak ditemukan!`
      });
    }

    const deleted = formatProduct(rows[0]);
    res.json({
      status: 'success',
      pesan: `Produk '${deleted.Name}' berhasil dihapus!`,
      produk_dihapus: deleted
    });
  } catch (err) {
    console.error(`[API Error - deleteProduct ${productId}]:`, err.message);
    res.status(500).json({
      status: 'error',
      pesan: 'Gagal menghapus data produk dari database.'
    });
  }
};
app.delete('/api/products/:id', deleteProduct);
app.delete('/api/product/:id', deleteProduct);
app.delete('/api/books/:id', deleteProduct);

// 4. Inisialisasi Database dan Jalankan Server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Aktif dan berjalan di http://localhost:${PORT}`);
      console.log(`[Database] PostgreSQL (product_api -> products)`);
      console.log(`[Status] http://localhost:${PORT}/api/status`);
      console.log(`[Page 2 Frontend] http://localhost:${PORT}/page-2/`);
      console.log(`[Page 1 Frontend] http://localhost:${PORT}/page-1/`);
    });
  })
  .catch((err) => {
    console.error('[Error] Gagal inisialisasi database PostgreSQL:', err.message);
    console.log('[Warning] Menjalankan server dalam mode fallback...');
    app.listen(PORT, () => {
      console.log(`[Server] Berjalan di http://localhost:${PORT} (periksa koneksi PostgreSQL)`);
    });
  });

export default app;
