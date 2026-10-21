-- ============================================
-- Afrikyia Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    category TEXT,
    link TEXT,
    image TEXT,
    gallery JSONB DEFAULT '[]',
    en JSONB DEFAULT '{}',
    fr JSONB DEFAULT '{}',
    ar JSONB DEFAULT '{}',
    year TEXT,
    client TEXT,
    project_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    link TEXT,
    video TEXT,
    image TEXT,
    en JSONB DEFAULT '{}',
    fr JSONB DEFAULT '{}',
    ar JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Uploaded files table
CREATE TABLE IF NOT EXISTS uploaded_files (
    id TEXT PRIMARY KEY,
    name TEXT,
    original_name TEXT,
    url TEXT,
    size BIGINT,
    type TEXT,
    category TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- 5. Editable website sections (about, vision, services, contact, trusted)
CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- 6. Messages from the website contact form
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'handled', 'archived')),
    locale TEXT,
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_ip_hash_idx ON contact_messages (ip_hash, created_at);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 7. Store orders and transactions (NexConnect)
CREATE TABLE IF NOT EXISTS store_orders (
    id TEXT PRIMARY KEY, -- id_facture e.g. AFR-SANAD-K38S9D2A (length >= 8)
    product_id TEXT NOT NULL,
    variant_key TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'MRU',
    payment_method TEXT,
    code_abonnement TEXT,
    payment_code TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
    id_transaction TEXT,
    numero_recu TEXT,
    paid_at TIMESTAMPTZ,
    license_key TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS store_orders_created_at_idx ON store_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS store_orders_customer_phone_idx ON store_orders (customer_phone);
CREATE INDEX IF NOT EXISTS store_orders_status_idx ON store_orders (status);
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;

-- 8. Store issued licenses
CREATE TABLE IF NOT EXISTS store_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES store_orders(id),
    license_key TEXT UNIQUE NOT NULL,
    product_id TEXT NOT NULL,
    variant_key TEXT,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    max_devices INT DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE store_licenses ENABLE ROW LEVEL SECURITY;

-- No RLS policies on purpose: these tables are read and written only by the
-- website server with the secret key, which bypasses RLS. The public key has no access.
