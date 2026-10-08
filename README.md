# Proyek Product Detail Page & REST API (Page 1 & Page 2)

Repositori ini mengintegrasikan dua halaman Product Detail Page (PDP):
1. **Page 1**: Halaman Product Detailed Page statis/hardcoded (Innoxa Unica AJ).
2. **Page 2**: Halaman Fullstack (Frontend & Backend) dengan database **PostgreSQL** yang menampung katalog produk secara persisten.

---

## 📁 Struktur Folder Proyek

```text
J:\dibimbing\pdp-project\
├── index.html                   # Portal navigasi utama (akses Page 1 & Page 2)
├── README.md                    # Dokumentasi lengkap proyek
│
├── page-1/                      # PAGE 1: Hardcoded Product Detail Page
│   ├── index.html               # Halaman PDP dengan data statis
│   ├── css/
│   │   └── style.css            # Styling visual ritel mewah 50ml
│   ├── js/
│   │   └── script.js            # Interaksi lokal (min-cart drawer, stars, swatches)
│   └── img/
│       └── unica.jpeg           # Aset gambar produk Innoxa Unica AJ
│
└── page-2/                      # PAGE 2: Fullstack PDP dengan PostgreSQL
    ├── frontend/                # Client web interaktif dinamis
    │   ├── index.html           # Struktur antarmuka PDP dinamis
    │   ├── css/
    │   │   └── style.css        # Desain responsif
    │   ├── js/
    │   │   └── script.js        # Dynamic fetch API, state protection, auto-retry
    │   └── img/
    │       ├── unica.jpeg
    │       └── serum.jpeg
    │
    └── backend/                 # Server REST API Node.js + Express + PostgreSQL
        ├── .env                 # Konfigurasi port & connection string PostgreSQL
        ├── .env.example
        ├── package.json
        ├── index.js             # Express API server dengan seluruh endpoint CRUD
        ├── db.js                # Koneksi PostgreSQL pool, auto-migrate & helper format
        ├── sql/
        │   ├── schema.sql       # DDL tabel products
        │   └── seed.sql         # DML seed data produk (Innoxa Unica AJ & Serum)
        └── scripts/
            ├── migrate.js       # Script runner migrasi skema tabel
            └── seed.js          # Script runner seeding data awal
```

---

## 🗄️ Struktur Database PostgreSQL (Page 2)

Struktur tabel `products` di database `product_api`:

```sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  photo VARCHAR(255) NOT NULL DEFAULT 'unica.jpeg',
  variation JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT,
  more_information TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Pemetaan Data Kolom ke Respons JSON:
* `id` &rarr; `id` (Integer)
* `name` &rarr; `Name` & `name` (String, contoh: `"Innoxa Unica AJ"`)
* `photo` &rarr; `Photo` & `photo` (String, contoh: `"unica.jpeg"`)
* `variation` &rarr; `Variation` & `variation` (Array of objects, contoh: `[{"size": "50 ml", "price": 94.30}, {"size": "100 ml", "price": 135.70}]`)
* `description` &rarr; `Description` & `description` (Text)
* `more_information` &rarr; `'More Information'` & `more_information` (Text)
* `features` &rarr; `Features` & `features` (Array of objects, contoh: `[{"label": "SKU", "value": "INN-P-55"}, {"label": "Brand", "value": "Innoxa"}, ...]`)

---

## 🚀 Panduan Menjalankan Proyek

### 1. Database PostgreSQL Docker (Best Practice Lifecycle)
Database dijalankan via Docker dengan policy `restart: unless-stopped` sehingga otomatis aktif di background selama Docker Desktop berjalan:

* **Menjalankan Pertama Kali:**
  ```powershell
  cd J:\dibimbing\api-product\api-product
  docker compose -f docker-compose.yml up -d
  ```

* **Manajemen Sehari-hari:**
  * **Saat aktif masa ngoding:** Biarkan kontainer berjalan di background (resource *idle* sangat kecil ~30MB RAM). Anda cukup fokus menjalankan backend `npm run dev`.
  * **Jika ingin mematikan (selesai proyek / libur):**
    ```powershell
    docker stop product_api_postgres
    # atau dari folder api-product:
    docker compose stop
    ```
  * **Menyalakan kembali jika sempat dihentikan:**
    ```powershell
    docker start product_api_postgres
    # atau:
    docker compose up -d
    ```

### 2. Jalankan Backend Page 2 (PostgreSQL)
Buka terminal dan masuk ke folder `page-2/backend`:
```powershell
cd J:\dibimbing\pdp-project\page-2\backend
npm install
npm start
```
* Server berjalan di: `http://localhost:3000`
* Status endpoint: `http://localhost:3000/api/status`
* Auto-migration & auto-seeding akan otomatis membuat tabel dan mengisi data awal jika database masih kosong!

### 3. Akses Halaman Melalui Browser
Tersedia beberapa cara untuk membuka halaman:

#### Opsi A: Lewat Server Backend Langsung (Paling Praktis)
Saat server backend berjalan di port 3000:
* **Portal Utama**: [http://localhost:3000/](http://localhost:3000/)
* **Page 1 (Hardcoded)**: [http://localhost:3000/page-1/](http://localhost:3000/page-1/)
* **Page 2 (Fullstack)**: [http://localhost:3000/page-2/](http://localhost:3000/page-2/)

#### Opsi B: Lewat VS Code Live Server
* Buka file `page-1/index.html` dengan Live Server &rarr; berjalan di `http://localhost:5500/page-1/index.html`.
* Buka file `page-2/frontend/index.html` dengan Live Server &rarr; berjalan di `http://localhost:5500/page-2/frontend/index.html`.
* Buka portal `index.html` dengan Live Server &rarr; berjalan di `http://localhost:5500/index.html`.

---

## 📡 Daftar Endpoint REST API (Page 2)

| Method | Endpoint | Keterangan | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/status` | Cek status server & koneksi PostgreSQL | 200 OK |
| `GET` | `/api/products` | Ambil semua produk dari PostgreSQL | 200 OK |
| `GET` | `/api/products/:id` | Ambil detail satu produk berdasarkan ID | 200 OK / 404 Not Found |
| `POST` | `/api/products` | Tambah produk baru ke PostgreSQL | 201 Created / 400 Bad Request |
| `PUT` | `/api/products/:id` | Update produk di PostgreSQL | 200 OK / 404 Not Found |
| `DELETE`| `/api/products/:id` | Hapus produk dari PostgreSQL | 200 OK / 404 Not Found |
