import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('uploaded_files')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase GET files error:', error.message);
            return NextResponse.json([]);
        }

        // Transform to match expected format
        const files = (data || []).map(row => ({
            id: row.id,
            name: row.name,
            originalName: row.original_name,
            url: row.url,
            size: row.size,
            type: row.type,
            category: row.category,
            description: row.description,
            date: row.created_at
        }));

        return NextResponse.json(files);
    } catch (err) {
        console.error('GET files error:', err);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const fileName = formData.get('fileName') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Upload file to Supabase Storage
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = file.name.split('.').pop() || 'bin';
        const storagePath = `uploads/${category || 'general'}/${uniqueSuffix}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        let { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('media')
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            // If the bucket doesn't exist (common when first migrating to Supabase)
            // Attempt to create the public bucket and retry
            const { error: createBucketError } = await supabaseAdmin.storage.createBucket('media', {
                public: true,
                allowedMimeTypes: ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            });
            
            if (!createBucketError) {
                // Retry upload after bucket creation
                const retryUpload = await supabaseAdmin
                    .storage
                    .from('media')
                    .upload(storagePath, buffer, {
                        contentType: file.type,
                        upsert: false
                    });
                uploadError = retryUpload.error;
            }

            if (uploadError) {
                console.error('Supabase storage upload error:', uploadError);
                return NextResponse.json({ error: 'UploadError', message: uploadError.message }, { status: 500 });
            }
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin
            .storage
            .from('media')
            .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;

        // Save file metadata to DB
        const fileRecord = {
            id: `file-${Date.now()}`,
            name: fileName || file.name,
            original_name: file.name,
            url: publicUrl,
            size: file.size,
            type: file.type,
            category: category || 'other',
            description: description || ''
        };

        const { error: dbError } = await supabaseAdmin
            .from('uploaded_files')
            .insert(fileRecord);

        if (dbError) {
            console.error('Supabase DB insert file error:', dbError);
            // File was uploaded to storage but metadata failed - still return the URL
        }

        return NextResponse.json({
            success: true,
            data: {
                id: fileRecord.id,
                name: fileRecord.name,
                originalName: fileRecord.original_name,
                url: publicUrl,
                size: fileRecord.size,
                type: fileRecord.type,
                category: fileRecord.category,
                description: fileRecord.description,
                date: new Date().toISOString()
            }
        });
    } catch (error: any) {
        console.error('POST files error:', error);
        return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        // Get file info for storage deletion
        const { data: fileData } = await supabaseAdmin
            .from('uploaded_files')
            .select('url')
            .eq('id', id)
            .single();

        // Delete from DB
        const { error } = await supabaseAdmin
            .from('uploaded_files')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete file error:', error);
            return NextResponse.json({ error: 'DatabaseError', message: error.message }, { status: 500 });
        }

        // Try to delete from storage
        if (fileData?.url) {
            try {
                const urlPath = new URL(fileData.url).pathname;
                const storagePath = urlPath.split('/storage/v1/object/public/media/')[1];
                if (storagePath) {
                    await supabaseAdmin.storage.from('media').remove([storagePath]);
                }
            } catch (e) {
                console.warn('Could not delete file from storage:', e);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, updates } = await request.json();

        const { error } = await supabaseAdmin
            .from('uploaded_files')
            .update({
                name: updates.name,
                category: updates.category,
                description: updates.description
            })
            .eq('id', id);

        if (error) {
            console.error('Supabase update file error:', error);
            return NextResponse.json({ error: 'DatabaseError', message: error.message }, { status: 500 });
        }

        const { data: updated } = await supabaseAdmin
            .from('uploaded_files')
            .select('*')
            .eq('id', id)
            .single();

        return NextResponse.json({
            success: true,
            data: updated ? {
                id: updated.id,
                name: updated.name,
                originalName: updated.original_name,
                url: updated.url,
                size: updated.size,
                type: updated.type,
                category: updated.category,
                description: updated.description,
                date: updated.created_at
            } : null
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
}
