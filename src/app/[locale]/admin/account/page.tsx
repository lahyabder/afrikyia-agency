"use client";

import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Field, PageHeader, ErrorBox, inputClass, primaryBtn, api } from '@/components/admin/biz/ui';
import { useAccessTexts, useAdminSession } from '@/components/admin/AdminSession';

export default function AccountPage() {
    const a = useAccessTexts();
    const { user } = useAdminSession();
    const [form, setForm] = useState({ current: '', next: '', confirm: '' });
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const [saving, setSaving] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.next !== form.confirm) return setError(a.account.mismatch);
        setSaving(true);
        try {
            await api('/api/admin/account', 'PATCH', { current: form.current, next: form.next });
            setDone(true);
            // The old session is no longer valid; show the sign-in screen
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            const code = (err as { code?: string }).code;
            setError(code === 'WrongPassword' ? a.account.wrong : code === 'WeakPassword' ? a.users.weakPassword : a.saveError);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-lg">
            <PageHeader title={a.account.title} subtitle={a.account.subtitle} />
            {user && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm space-y-1">
                    <div className="font-bold">{user.name}</div>
                    <div className="text-white/60"><span dir="ltr">{user.email}</span></div>
                    <div className="text-white/60">{a.roles[user.role]}</div>
                </div>
            )}
            {user?.owner ? (
                <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">{a.account.ownerNote}</p>
            ) : (
                <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                    <Field label={a.account.current}><input type="password" required autoComplete="current-password" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} className={inputClass} /></Field>
                    <Field label={a.account.next}><input type="password" required minLength={8} autoComplete="new-password" value={form.next} onChange={e => setForm(f => ({ ...f, next: e.target.value }))} className={inputClass} /></Field>
                    <Field label={a.account.confirm}><input type="password" required minLength={8} autoComplete="new-password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} className={inputClass} /></Field>
                    <ErrorBox message={error} />
                    {done && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{a.account.changed}</div>}
                    <button type="submit" disabled={saving || done} className={primaryBtn}><KeyRound className="w-4 h-4" />{a.account.change}</button>
                </form>
            )}
        </div>
    );
}
