import { supabaseAdmin } from '@/lib/supabase';
import type { SessionUser } from '@/lib/adminAuth';

// Records who did what in the admin panel. Never blocks or fails the action itself.
export async function logActivity(user: SessionUser | undefined, action: string, entity: string, summary?: string | null, entityId?: string | null) {
    try {
        await supabaseAdmin.from('admin_activity').insert({
            user_id: user?.id ?? null,
            user_email: user?.email ?? null,
            user_name: user?.name ?? null,
            action,
            entity,
            entity_id: entityId ?? null,
            summary: summary ? summary.slice(0, 300) : null,
        });
    } catch (e) {
        console.error('[activity] log failed', e);
    }
}
