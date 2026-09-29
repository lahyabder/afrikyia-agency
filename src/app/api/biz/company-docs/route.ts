import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccess, requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { isoDate, readJson, text } from '@/lib/biz';

export const dynamic = 'force-dynamic';

// Company papers kept in the private "accounting" bucket. The browser uploads straight to storage with a
// one-time signed URL (large scans do not pass through the website), and downloads with a link valid 2 minutes.
const BUCKET = 'accounting';
const CATEGORIES = ['legal', 'tax', 'social', 'bank', 'templates', 'contracts', 'other'] as const;
const MAX_BYTES = 25 * 1024 * 1024;
const FIELDS = 'id, title, category, file_name, mime_type, size_bytes, issued_on, expires_on, notes, uploaded_by, created_at';

const category = (v: unknown) => (CATEGORIES.includes(v as (typeof CATEGORIES)[number]) ? (v as string) : 'other');

function safeName(name: string): string {
    const ext = (name.match(/\.[A-Za-z0-9]{1,8}$/)?.[0] ?? '').toLowerCase();
    const base = name.replace(/\.[^.]*$/, '').normalize('NFD').replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'document';
    return `${base}${ext}`;
}

// List, or a short-lived download link with ?download=<id>
export async function GET(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const downloadId = new URL(request.url).searchParams.get('download');
    if (downloadId) {
        const { data: doc } = await supabaseAdmin.from('company_documents').select('file_path, file_name, title').eq('id', downloadId).single();
        if (!doc) return NextResponse.json({ error: 'NotFound' }, { status: 404 });
        const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(doc.file_path, 120, { download: doc.file_name });
        if (error || !data) return NextResponse.json({ error: error?.message ?? 'Storage' }, { status: 500 });
        await logActivity(gate.user, 'download', 'company_document', doc.title, downloadId);
        return NextResponse.json({ url: data.signedUrl });
    }
    const { data, error } = await supabaseAdmin.from('company_documents').select(FIELDS).order('category').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// Step 1 (action "upload-url"): a one-time upload link. Step 2 (action "create"): record the uploaded file.
export async function POST(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    if (!body) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });

    if (body.action === 'upload-url') {
        const size = Number(body.size) || 0;
        if (size > MAX_BYTES) return NextResponse.json({ error: 'TooLarge' }, { status: 413 });
        const fileName = text(body.file_name, 200) ?? 'document';
        const path = `company/${new Date().getFullYear()}/${randomUUID()}-${safeName(fileName)}`;
        const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
        if (error || !data) return NextResponse.json({ error: error?.message ?? 'Storage' }, { status: 500 });
        return NextResponse.json({ path, token: data.token, signedUrl: data.signedUrl });
    }

    if (body.action === 'create') {
        const path = text(body.file_path, 300);
        const title = text(body.title, 200);
        if (!path || !path.startsWith('company/') || !title) return NextResponse.json({ error: 'MissingFields' }, { status: 400 });
        // The file must really be in storage before it is listed
        const folder = path.slice(0, path.lastIndexOf('/'));
        const name = path.slice(path.lastIndexOf('/') + 1);
        const { data: found } = await supabaseAdmin.storage.from(BUCKET).list(folder, { search: name, limit: 1 });
        if (!found?.some(f => f.name === name)) return NextResponse.json({ error: 'FileMissing' }, { status: 400 });
        const { data, error } = await supabaseAdmin
            .from('company_documents')
            .insert({
                title,
                category: category(body.category),
                file_path: path,
                file_name: text(body.file_name, 200) ?? name,
                mime_type: text(body.mime_type, 100),
                size_bytes: Number(body.size_bytes) || null,
                issued_on: isoDate(body.issued_on),
                expires_on: isoDate(body.expires_on),
                notes: text(body.notes, 1000),
                uploaded_by: gate.user.email,
            })
            .select(FIELDS)
            .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await logActivity(gate.user, 'upload', 'company_document', title, data.id);
        return NextResponse.json(data);
    }

    if (body.action === 'import-file') {
        if (!canAccess(gate.user, 'publishing')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        return importPublicFile(gate.user, body);
    }

    return NextResponse.json({ error: 'BadAction' }, { status: 400 });
}

// Moves a file uploaded on the public Files page (bucket "media") into the private vault: copy, record, then
// remove the public copy so its link stops working. Nothing is removed unless the private copy is saved.
async function importPublicFile(user: Parameters<typeof logActivity>[0], body: Record<string, unknown>) {
    const fileId = text(body.file_id, 64);
    if (!fileId) return NextResponse.json({ error: 'MissingFields' }, { status: 400 });
    const { data: row } = await supabaseAdmin.from('uploaded_files').select('id, name, original_name, url, type, size').eq('id', fileId).maybeSingle();
    if (!row) return NextResponse.json({ error: 'NotFound' }, { status: 404 });
    const marker = '/storage/v1/object/public/media/';
    const at = typeof row.url === 'string' ? row.url.indexOf(marker) : -1;
    if (at < 0) return NextResponse.json({ error: 'NotInStorage' }, { status: 400 });
    const mediaPath = decodeURIComponent(row.url.slice(at + marker.length).split('?')[0]);

    const { data: blob, error: readError } = await supabaseAdmin.storage.from('media').download(mediaPath);
    if (readError || !blob) return NextResponse.json({ error: 'ReadFailed' }, { status: 502 });
    if (blob.size > MAX_BYTES) return NextResponse.json({ error: 'TooLarge' }, { status: 413 });

    const fileName = text(row.original_name, 200) ?? text(row.name, 200) ?? 'document';
    const path = `company/${new Date().getFullYear()}/${randomUUID()}-${safeName(fileName)}`;
    const mime = text(row.type, 100) ?? (blob.type || 'application/octet-stream');
    const { error: writeError } = await supabaseAdmin.storage.from(BUCKET).upload(path, blob, { contentType: mime, upsert: false });
    if (writeError) return NextResponse.json({ error: writeError.message }, { status: 500 });

    const title = text(body.title, 200) ?? text(row.name, 200) ?? fileName;
    const { data, error } = await supabaseAdmin
        .from('company_documents')
        .insert({
            title,
            category: category(body.category),
            file_path: path,
            file_name: fileName,
            mime_type: mime,
            size_bytes: blob.size,
            issued_on: isoDate(body.issued_on),
            expires_on: isoDate(body.expires_on),
            notes: text(body.notes, 1000),
            uploaded_by: user?.email ?? null,
        })
        .select(FIELDS)
        .single();
    if (error || !data) {
        await supabaseAdmin.storage.from(BUCKET).remove([path]);
        return NextResponse.json({ error: error?.message ?? 'Insert' }, { status: 500 });
    }
    await supabaseAdmin.storage.from('media').remove([mediaPath]);
    await supabaseAdmin.from('uploaded_files').delete().eq('id', row.id);
    await logActivity(user, 'move_to_vault', 'company_document', title, data.id);
    return NextResponse.json(data);
}

// Edit the title, type, dates or notes
export async function PATCH(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    const id = text(body?.id, 64);
    const title = text(body?.title, 200);
    if (!body || !id || !title) return NextResponse.json({ error: 'MissingFields' }, { status: 400 });
    const { data, error } = await supabaseAdmin
        .from('company_documents')
        .update({ title, category: category(body.category), issued_on: isoDate(body.issued_on), expires_on: isoDate(body.expires_on), notes: text(body.notes, 1000) })
        .eq('id', id)
        .select(FIELDS)
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(gate.user, 'update', 'company_document', title, id);
    return NextResponse.json(data);
}

// Deleting an official document is kept to administrators
export async function DELETE(request: Request) {
    const gate = await requireAccess(request, 'users');
    if (gate.denied) return gate.denied;
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    const { data: doc } = await supabaseAdmin.from('company_documents').select('file_path, title').eq('id', id).single();
    if (!doc) return NextResponse.json({ error: 'NotFound' }, { status: 404 });
    await supabaseAdmin.storage.from(BUCKET).remove([doc.file_path]);
    const { error } = await supabaseAdmin.from('company_documents').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(gate.user, 'delete', 'company_document', doc.title, id);
    return NextResponse.json({ success: true });
}
