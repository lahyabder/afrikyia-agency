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

-- 5. Allow all operations (access is secured via service_role key on server)
CREATE POLICY "Allow all for achievements" ON achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for uploaded_files" ON uploaded_files FOR ALL USING (true) WITH CHECK (true);
