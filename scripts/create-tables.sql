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

-- No RLS policies on purpose: these tables are read and written only by the
-- website server with the secret key, which bypasses RLS. The public key has no access.
