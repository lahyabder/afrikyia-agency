"use client";

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, ShieldCheck, UserRound, KeyRound } from 'lucide-react';
import { Modal, Field, PageHeader, ErrorBox, inputClass, primaryBtn, ghostBtn, api, useBiz } from '@/components/admin/biz/ui';
import { useAdminSession, useAccessTexts } from '@/components/admin/AdminSession';

type AdminUser = {
    id: string;
    email: string;
    name: string;
    name_ar: string | null;
    role: 'admin' | 'accountant' | 'user';
    is_active: boolean;
    last_login: string | null;
    has_password: boolean;
};
type FormState = { id?: string; email: string; name: string; name_ar: string; role: AdminUser['role']; password: string; is_active: boolean };

export default function UsersPage() {
    const { language } = useBiz();
    const access = useAccessTexts();
    const u = access.users;
    const { user: me } = useAdminSession();
    const [users, setUsers] = useState<AdminUser[] | null>(null);
    const [form, setForm] = useState<FormState | null>(null);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const load = useCallback(() => {
        api<AdminUser[]>('/api/admin/users').then(setUsers).catch(() => setError(access.forbidden));
    }, [access.forbidden]);
    useEffect(load, [load]);

    const codeMessage = (code?: string) =>
        code === 'EmailTaken' ? u.emailTaken : code === 'WeakPassword' ? u.weakPassword : code === 'OwnAccount' ? u.ownAccount : access.saveError;

    const save = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!form) return;
        setSaving(true);
        setFormError('');
        try {
            if (form.id) await api('/api/admin/users', 'PATCH', { id: form.id, name: form.name, name_ar: form.name_ar, role: form.role, is_active: form.is_active, password: form.password || undefined });
            else await api('/api/admin/users', 'POST', form);
            setForm(null);
            load();
        } catch (e) {
            setFormError(codeMessage((e as { code?: string }).code));
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (iso: string | null) =>
        iso ? new Date(iso).toLocaleString(language === 'ar' ? 'ar-u-nu-latn' : language, { dateStyle: 'medium', timeStyle: 'short' }) : u.never;
    const set = (k: keyof FormState) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => (f ? { ...f, [k]: ev.target.value } : f));

    return (
        <div className="space-y-6">
            <PageHeader title={u.title} subtitle={u.subtitle}>
                <button onClick={() => { setFormError(''); setForm({ email: '', name: '', name_ar: '', role: 'user', password: '', is_active: true }); }} className={primaryBtn}>
                    <Plus className="w-4 h-4" />{u.new}
                </button>
            </PageHeader>

            <ErrorBox message={error} />

            <div className="grid sm:grid-cols-3 gap-3">
                {(['admin', 'accountant', 'user'] as const).map(r => (
                    <div key={r} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="text-sm font-bold">{access.roles[r]}</div>
                        <div className="text-xs text-white/55 mt-1">{access.roleHelp[r]}</div>
                    </div>
                ))}
            </div>

            <ul className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
                <li className="flex items-center gap-3 p-4">
                    <span className="w-10 h-10 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center shrink-0"><ShieldCheck className="w-5 h-5" /></span>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold">{u.owner}{me?.owner && <span className="text-white/45 font-normal"> ({u.you})</span>}</div>
                        <div className="text-xs text-white/55">{u.ownerHint}</div>
                    </div>
                </li>
                {users === null && !error && <li className="p-6 text-center text-sm text-white/60">…</li>}
                {(users ?? []).map(x => (
                    <li key={x.id} className={`flex items-center gap-3 p-4 ${x.is_active ? '' : 'opacity-55'}`}>
                        <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0"><UserRound className="w-5 h-5 text-white/70" /></span>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold truncate">
                                {x.name_ar || x.name}
                                {me?.id === x.id && <span className="text-white/45 font-normal"> ({u.you})</span>}
                            </div>
                            <div className="text-xs text-white/55 truncate"><span dir="ltr">{x.email}</span></div>
                            <div className="text-[11px] text-white/45 mt-0.5">{u.lastLogin}: {formatDate(x.last_login)}</div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end gap-1">
                            <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-white/10 text-white/80">{access.roles[x.role]}</span>
                            {!x.is_active ? (
                                <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-red-500/15 text-red-400">{u.inactive}</span>
                            ) : !x.has_password ? (
                                <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-amber-500/15 text-amber-300 flex items-center gap-1"><KeyRound className="w-3 h-3" />{u.noPassword}</span>
                            ) : (
                                <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-400">{u.active}</span>
                            )}
                        </div>
                        <button
                            onClick={() => { setFormError(''); setForm({ id: x.id, email: x.email, name: x.name, name_ar: x.name_ar ?? '', role: x.role, password: '', is_active: x.is_active }); }}
                            className="p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                            aria-label={access.edit}
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </li>
                ))}
            </ul>

            {form && (
                <Modal title={form.id ? `${access.edit}: ${form.email}` : u.new} onClose={() => setForm(null)}>
                    <form onSubmit={save} className="space-y-4">
                        <Field label={u.name}><input required value={form.name} onChange={set('name')} className={inputClass} /></Field>
                        <Field label={u.nameAr}><input value={form.name_ar} onChange={set('name_ar')} dir="rtl" className={inputClass} /></Field>
                        {!form.id && <Field label={u.email}><input required type="email" value={form.email} onChange={set('email')} dir="ltr" className={inputClass} /></Field>}
                        <Field label={u.role}>
                            <select value={form.role} onChange={set('role')} className={inputClass} disabled={me?.id === form.id}>
                                {(['admin', 'accountant', 'user'] as const).map(r => <option key={r} value={r}>{access.roles[r]}</option>)}
                            </select>
                        </Field>
                        <Field label={form.id ? u.newPassword : u.password}>
                            <input type="text" autoComplete="new-password" required={!form.id} minLength={8} value={form.password} onChange={set('password')} dir="ltr" className={inputClass} />
                        </Field>
                        <p className="text-xs text-white/50 -mt-2">{u.passwordHint}</p>
                        {form.id && me?.id !== form.id && (
                            <label className="flex items-center gap-3 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.is_active} onChange={ev => setForm(f => (f ? { ...f, is_active: ev.target.checked } : f))} className="w-4 h-4 accent-yellow-400" />
                                {u.active}
                            </label>
                        )}
                        <ErrorBox message={formError} />
                        <div className="flex gap-2 pt-2">
                            <button type="submit" disabled={saving} className={`${primaryBtn} flex-1`}>{saving ? '…' : access.save}</button>
                            <button type="button" onClick={() => setForm(null)} className={ghostBtn}>{access.cancel}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
