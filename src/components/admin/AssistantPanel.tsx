"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { Sparkles, X, Send, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// The dashboard assistant: a chat window opened from a button in the corner of every admin page.
// Phase 1 answers questions from the company's data; it cannot change anything.

type Turn = { role: 'user' | 'assistant'; text: string; error?: boolean };

// **bold** and "- " / "1. " list lines, rendered as React elements (no HTML injection)
function renderInline(text: string): ReactNode[] {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>
    );
}

function Formatted({ text }: { text: string }) {
    const blocks: ReactNode[] = [];
    let list: { ordered: boolean; items: string[] } | null = null;
    const flush = () => {
        if (!list) return;
        const Tag = list.ordered ? 'ol' : 'ul';
        blocks.push(
            <Tag key={blocks.length} className={`${list.ordered ? 'list-decimal' : 'list-disc'} ps-5 space-y-0.5`}>
                {list.items.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
            </Tag>
        );
        list = null;
    };
    for (const line of text.split('\n')) {
        const bullet = line.match(/^\s*[-•*]\s+(.*)$/);
        const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
        if (bullet || numbered) {
            const ordered = !!numbered;
            if (list && list.ordered !== ordered) flush();
            if (!list) list = { ordered, items: [] };
            list.items.push((bullet ?? numbered)![1]);
            continue;
        }
        flush();
        const clean = line.replace(/^#+\s*/, '');
        if (clean.trim()) blocks.push(<p key={blocks.length}>{renderInline(clean)}</p>);
    }
    flush();
    return <div className="space-y-2">{blocks}</div>;
}

export default function AssistantPanel() {
    const { t, isRTL } = useLanguage();
    const a = t.admin.assistant;
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<{ configured: boolean; tools: number } | null>(null);
    const [turns, setTurns] = useState<Turn[]>([]);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetch('/api/assistant', { cache: 'no-store' })
            .then(r => (r.ok ? r.json() : null))
            .then(setStatus)
            .catch(() => setStatus(null));
    }, []);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [turns, busy]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    // Only for users whose role gives the assistant something to read
    if (!status || status.tools === 0) return null;

    const errorText = (code?: string) =>
        (code && (a.errors as Record<string, string>)[code]) || a.errors.Failed;

    const ask = async (question: string) => {
        const text = question.trim();
        if (!text || busy) return;
        const history = [...turns.filter(x => !x.error), { role: 'user' as const, text }];
        setTurns(prev => [...prev, { role: 'user', text }]);
        setInput('');
        setBusy(true);
        try {
            const res = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history.map(({ role, text }) => ({ role, text })) }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Failed');
            setTurns(prev => [...prev, { role: 'assistant', text: data.reply }]);
        } catch (e) {
            setTurns(prev => [...prev, { role: 'assistant', text: errorText(e instanceof Error ? e.message : undefined), error: true }]);
        } finally {
            setBusy(false);
        }
    };

    const suggestions: string[] = a.suggestions;

    return (
        <div className="print:hidden">
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className={`fixed bottom-5 ${isRTL ? 'left-5' : 'right-5'} z-40 flex items-center gap-2 h-12 px-5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-bold shadow-lg cursor-pointer`}
                >
                    <Sparkles className="w-4 h-4" />
                    {a.open}
                </button>
            )}

            {open && (
                <div className="fixed inset-0 z-[70] flex justify-end sm:p-4 pointer-events-none" dir={isRTL ? 'rtl' : 'ltr'}>
                    <section
                        className={`pointer-events-auto flex flex-col w-full sm:w-[420px] h-full sm:h-[min(680px,calc(100vh-2rem))] sm:mt-auto bg-[#161616] border border-white/10 sm:rounded-2xl shadow-2xl overflow-hidden`}
                        aria-label={a.title}
                    >
                        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                            <span className="w-9 h-9 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></span>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm">{a.title}</div>
                                <div className="text-[11px] text-white/50 truncate">{a.subtitle}</div>
                            </div>
                            {turns.length > 0 && (
                                <button onClick={() => setTurns([])} title={a.reset} aria-label={a.reset} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer"><RotateCcw className="w-4 h-4" /></button>
                            )}
                            <button onClick={() => setOpen(false)} aria-label={a.close} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer"><X className="w-5 h-5" /></button>
                        </header>

                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-sm leading-relaxed">
                            {!status.configured && <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">{a.errors.NotConfigured}</p>}
                            {turns.length === 0 && (
                                <div className="space-y-3">
                                    <p className="text-white/70">{a.welcome}</p>
                                    <div className="flex flex-col gap-2">
                                        {suggestions.map(s => (
                                            <button key={s} onClick={() => ask(s)} disabled={busy} className="text-start px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 cursor-pointer">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-white/40">{a.readOnly}</p>
                                </div>
                            )}
                            {turns.map((turn, i) =>
                                turn.role === 'user' ? (
                                    <div key={i} className="flex justify-end">
                                        <div className="max-w-[85%] rounded-2xl rounded-ee-md bg-yellow-400 text-black px-3.5 py-2 whitespace-pre-wrap" dir="auto">{turn.text}</div>
                                    </div>
                                ) : (
                                    <div key={i} className={`max-w-[92%] rounded-2xl rounded-es-md px-3.5 py-2.5 ${turn.error ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'bg-white/5 border border-white/10'}`} dir="auto">
                                        <Formatted text={turn.text} />
                                    </div>
                                )
                            )}
                            {busy && (
                                <div className="inline-flex items-center gap-1.5 rounded-2xl bg-white/5 border border-white/10 px-4 py-3" aria-label={a.thinking}>
                                    {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>

                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                ask(input);
                            }}
                            className="border-t border-white/10 p-3 flex items-end gap-2"
                        >
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                                        e.preventDefault();
                                        ask(input);
                                    }
                                }}
                                rows={1}
                                maxLength={4000}
                                placeholder={a.placeholder}
                                dir="auto"
                                className="flex-1 resize-none max-h-32 bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-yellow-400/60"
                            />
                            <button type="submit" disabled={busy || !input.trim()} aria-label={a.send} className="h-10 w-10 shrink-0 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black flex items-center justify-center disabled:opacity-40 cursor-pointer">
                                <Send className={`w-4 h-4 ${isRTL ? '-scale-x-100' : ''}`} />
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}
