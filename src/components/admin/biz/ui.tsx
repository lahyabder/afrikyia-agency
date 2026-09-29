"use client";

import { useEffect, type ReactNode } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// Shared pieces of the company tools pages (finance, clients, invoices, expenses)

export function useBiz() {
    const { t, language, isRTL } = useLanguage();
    const b = t.admin.biz;
    const numberLocale = language === 'ar' ? 'ar-u-nu-latn' : language === 'fr' ? 'fr-FR' : 'en-US';
    const formatMoney = (value: number | string | null | undefined) =>
        `${Number(value || 0).toLocaleString(numberLocale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${b.currency}`;
    const formatDate = (iso?: string | null) =>
        iso ? new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString(numberLocale, { dateStyle: 'medium' }) : '—';
    return { b, language, isRTL, formatMoney, formatDate };
}

export const inputClass =
    'w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-yellow-400/60';
export const primaryBtn =
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-bold transition-all cursor-pointer disabled:opacity-60';
export const ghostBtn =
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-all cursor-pointer disabled:opacity-60';

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                {subtitle && <p className="text-sm text-white/65 mt-1">{subtitle}</p>}
            </div>
            {children && <div className="flex flex-wrap gap-2">{children}</div>}
        </div>
    );
}

export function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
    return (
        <label className={`block ${className}`}>
            <span className="block text-xs font-semibold text-white/70 mb-1.5">{label}</span>
            {children}
        </label>
    );
}

export function ErrorBox({ message }: { message: string }) {
    if (!message) return null;
    return (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {message}
        </div>
    );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />
            <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-[#161616] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button onClick={onClose} className="p-2 -m-2 rounded-lg hover:bg-white/10 cursor-pointer" aria-label="close">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

const STATUS_STYLE: Record<string, string> = {
    draft: 'bg-white/10 text-white/70',
    sent: 'bg-blue-500/15 text-blue-300',
    paid: 'bg-emerald-500/15 text-emerald-400',
    overdue: 'bg-red-500/15 text-red-400',
    cancelled: 'bg-white/5 text-white/40 line-through',
};

export function StatusBadge({ status }: { status: string }) {
    const { b } = useBiz();
    const label = status === 'paid' ? b.docs.paidStatus : b.docs[status] ?? status;
    return <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${STATUS_STYLE[status] ?? STATUS_STYLE.draft}`}>{label}</span>;
}

export async function api<T = unknown>(url: string, method = 'GET', body?: unknown): Promise<T> {
    const res = await fetch(url, {
        method,
        cache: 'no-store',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data?.error || String(res.status)), { code: data?.error, status: res.status });
    return data as T;
}

export type Party = { id: string; name: string; type: string; nif?: string | null; rc?: string | null; address?: string | null; phone?: string | null; email?: string | null };
