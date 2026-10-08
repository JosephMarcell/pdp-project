-- Seed Data untuk Halaman 2 PDP (Produk Innoxa Unica AJ & Innoxa Radiance Serum)

INSERT INTO products (id, name, photo, variation, description, more_information, features)
OVERRIDING SYSTEM VALUE
VALUES 
(
  1,
  'Innoxa Unica AJ',
  'unica.jpeg',
  '[
    {"size": "50 ml", "price": 94.30},
    {"size": "100 ml", "price": 135.70}
  ]'::jsonb,
  'Innoxa Unica AJ 50 ml, anti-ageing cream for all skin types. A special anti aging cream with precious texture. Minimizes and prevents the appearance of wrinkles, makes the face shiny, restores compactness to the skin.',
  'For its particular emollient and soothing properties it is suitable for any type of skin whether it is sensitive, fragile, normal and dry. The content of UVA and UVB filters protects against external aggressions and prevents pigmentary spots. Allantoin and Vitamins stimulate normal repair of dermis and epidermis.',
  '[
    {"label": "SKU", "value": "INN-P-55"},
    {"label": "Brand", "value": "Innoxa"},
    {"label": "Skin Type", "value": "All"},
    {"label": "Body Part", "value": "Face"},
    {"label": "Product Type", "value": "Cream"},
    {"label": "Concern", "value": "Anti Age"}
  ]'::jsonb
),
(
  2,
  'Innoxa Radiance Serum',
  'serum.jpeg',
  '[
    {"size": "30 ml", "price": 85.00},
    {"size": "50 ml", "price": 110.00}
  ]'::jsonb,
  'Revitalizing and illuminating serum designed to boost natural skin radiance and smooth fine lines.',
  'Formulated with stabilized Vitamin C and botanical extracts. Apply morning and evening before face cream.',
  '[
    {"label": "SKU", "value": "INN-P-56"},
    {"label": "Brand", "value": "Innoxa"},
    {"label": "Skin Type", "value": "All"},
    {"label": "Body Part", "value": "Face & Neck"},
    {"label": "Product Type", "value": "Serum"},
    {"label": "Concern", "value": "Radiance & Glow"}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  photo = EXCLUDED.photo,
  variation = EXCLUDED.variation,
  description = EXCLUDED.description,
  more_information = EXCLUDED.more_information,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Sinkronisasi sequence id auto-increment
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1));
