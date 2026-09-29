"use client";

import { useState } from 'react';
import { Modal, Field, ErrorBox, inputClass, primaryBtn, ghostBtn, api, useBiz, type Party } from './ui';

export default function PartyForm({ party, defaultType = 'client', onClose, onSaved }: {
    party?: Party | null;
    defaultType?: string;
    onClose: () => void;
    onSaved: (p: Party) => void;
}) {
    const { b } = useBiz();
    const p = b.parties;
    const [form, setForm] = useState<Partial<Party>>(party ?? { type: defaultType });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const set = (k: keyof Party) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const saved = await api<Party>('/api/biz/parties', party ? 'PATCH' : 'POST', { ...form, id: party?.id });
            onSaved(saved);
        } catch {
            setError(b.common.saveError);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal title={party ? `${b.common.edit}: ${party.name}` : p.new} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <Field label={p.name}>
                    <input required autoFocus value={form.name ?? ''} onChange={set('name')} className={inputClass} />
                </Field>
                <Field label={p.type}>
                    <select value={form.type} onChange={set('type')} className={inputClass}>
                        <option value="client">{p.client}</option>
                        <option value="supplier">{p.supplier}</option>
                        <option value="both">{p.both}</option>
                    </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label={p.phone}>
                        <input value={form.phone ?? ''} onChange={set('phone')} dir="ltr" className={inputClass} />
                    </Field>
                    <Field label={p.email}>
                        <input type="email" value={form.email ?? ''} onChange={set('email')} dir="ltr" className={inputClass} />
                    </Field>
                </div>
                <Field label={p.address}>
                    <input value={form.address ?? ''} onChange={set('address')} className={inputClass} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label={p.nif}>
                        <input value={form.nif ?? ''} onChange={set('nif')} dir="ltr" className={inputClass} />
                    </Field>
                    <Field label={p.rc}>
                        <input value={form.rc ?? ''} onChange={set('rc')} dir="ltr" className={inputClass} />
                    </Field>
                </div>
                <ErrorBox message={error} />
                <div className="flex gap-2 pt-2">
                    <button type="submit" disabled={saving} className={`${primaryBtn} flex-1`}>{saving ? '…' : b.common.save}</button>
                    <button type="button" onClick={onClose} className={ghostBtn}>{b.common.cancel}</button>
                </div>
            </form>
        </Modal>
    );
}
