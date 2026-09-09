// Migration script: Create tables and seed initial data into Supabase
// Run with: npx tsx scripts/migrate-to-supabase.ts

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://zsxlaqvptbemupmlihpc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeGxhcXZwdGJlbXVwbWxpaHBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE2MDQ5MywiZXhwIjoyMDkyNzM2NDkzfQ.LcJ9ZadXnYQObhGABxNGqLnFi_gpIEu2hkqLaLVR9N0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
    console.log('📦 Creating tables...');

    // Create achievements table
    const { error: achError } = await supabase.rpc('exec_sql', {
        sql: `
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
        `
    });

    if (achError) {
        console.log('⚠️ Could not create achievements table via RPC, trying direct SQL...');
        // Try using the REST API to check if table exists
        const { data, error: selectError } = await supabase.from('achievements').select('id').limit(1);
        if (selectError && selectError.code === '42P01') {
            console.error('❌ Table "achievements" does not exist. Please create it manually in Supabase SQL Editor.');
            console.log('\nRun this SQL in Supabase Dashboard > SQL Editor:\n');
            console.log(getCreateTableSQL());
            return false;
        } else if (!selectError) {
            console.log('✅ Table "achievements" already exists.');
        }
    } else {
        console.log('✅ achievements table created.');
    }

    // Create projects table
    const { error: projError } = await supabase.rpc('exec_sql', {
        sql: `
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
        `
    });

    if (projError) {
        const { error: selectError } = await supabase.from('projects').select('id').limit(1);
        if (selectError && selectError.code === '42P01') {
            console.error('❌ Table "projects" does not exist.');
        } else if (!selectError) {
            console.log('✅ Table "projects" already exists.');
        }
    } else {
        console.log('✅ projects table created.');
    }

    // Create uploaded_files table
    const { error: filesError } = await supabase.rpc('exec_sql', {
        sql: `
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
        `
    });

    if (filesError) {
        const { error: selectError } = await supabase.from('uploaded_files').select('id').limit(1);
        if (selectError && selectError.code === '42P01') {
            console.error('❌ Table "uploaded_files" does not exist.');
        } else if (!selectError) {
            console.log('✅ Table "uploaded_files" already exists.');
        }
    } else {
        console.log('✅ uploaded_files table created.');
    }

    return true;
}

async function seedData() {
    console.log('\n🌱 Seeding initial data...');

    // Seed achievements
    try {
        const achievementsPath = path.join(process.cwd(), 'src', 'data', 'achievements.json');
        const achievements = JSON.parse(fs.readFileSync(achievementsPath, 'utf8'));

        // Check if data already exists
        const { data: existing } = await supabase.from('achievements').select('id').limit(1);
        if (existing && existing.length > 0) {
            console.log('⚠️ Achievements table already has data. Skipping seed.');
        } else {
            const rows = achievements.map((a: any) => ({
                id: a.id,
                category: a.category,
                link: a.link,
                image: a.image || null,
                gallery: a.gallery || [],
                en: a.en || {},
                fr: a.fr || {},
                ar: a.ar || {},
                year: a.year || null,
                client: a.client || null,
                project_type: a.projectType || null
            }));

            const { error } = await supabase.from('achievements').insert(rows);
            if (error) {
                console.error('❌ Error seeding achievements:', error.message);
            } else {
                console.log(`✅ Seeded ${rows.length} achievements.`);
            }
        }
    } catch (e: any) {
        console.error('❌ Failed to read/seed achievements:', e.message);
    }

    // Seed projects
    try {
        const projectsPath = path.join(process.cwd(), 'src', 'data', 'projects.json');
        const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

        const { data: existing } = await supabase.from('projects').select('id').limit(1);
        if (existing && existing.length > 0) {
            console.log('⚠️ Projects table already has data. Skipping seed.');
        } else {
            const rows = projects.map((p: any) => ({
                id: p.id,
                link: p.link || '#',
                video: p.video || null,
                image: p.image || null,
                en: p.en || {},
                fr: p.fr || {},
                ar: p.ar || {}
            }));

            const { error } = await supabase.from('projects').insert(rows);
            if (error) {
                console.error('❌ Error seeding projects:', error.message);
            } else {
                console.log(`✅ Seeded ${rows.length} projects.`);
            }
        }
    } catch (e: any) {
        console.error('❌ Failed to read/seed projects:', e.message);
    }
}

function getCreateTableSQL(): string {
    return `
-- Achievements table
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

-- Projects table
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

-- Uploaded files table
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

-- Disable RLS for admin access (or set up policies later)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Allow all operations (open access - secure via service_role key on server)
CREATE POLICY "Allow all for achievements" ON achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for uploaded_files" ON uploaded_files FOR ALL USING (true) WITH CHECK (true);
`;
}

async function main() {
    console.log('🚀 Starting Supabase migration...\n');
    console.log('URL:', supabaseUrl);

    const tablesReady = await createTables();

    if (tablesReady) {
        await seedData();
    } else {
        console.log('\n📋 Please create the tables manually first using the SQL above,');
        console.log('   then run this script again to seed data.');
    }

    console.log('\n✨ Migration complete!');
}

main().catch(console.error);
