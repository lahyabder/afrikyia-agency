"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Printer, Pencil, Send, Ban, Copy, Stamp, Undo2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { ErrorBox, StatusBadge, primaryBtn, ghostBtn, api, useBiz } from '@/components/admin/biz/ui';
import { useCompanySeals } from '@/components/admin/biz/Letterhead';
import LetterPaper, { type LetterData } from '@/components/admin/biz/LetterPaper';

type Letter = LetterData & { id: string; status: string };

export default function LetterViewPage() {
    return (
        <Suspense fallback={null}>
            <LetterView />
        </Suspense>
    );
}

function LetterView() {
    const { b, isRTL } = useBiz();
    const l = b.letters;
    const d = b.docs;
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id');
    const printRequest = params.get('print');
    const printed = useRef(false);
    const { company, bank, seals, hasSeals } = useCompanySeals();
    const [letter, setLetter] = useState<Letter | null>(null);
    const [withSeal, setWithSeal] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(() => {
        if (!id) return;
        api<Letter>(`/api/biz/letters/${id}`).then(setLetter).catch(() => setError(b.common.loadError));
    }, [id, b.common.loadError]);
    useEffect(load, [load]);

    // Print with or without the stamp and signature; the page shows the chosen version first
    const printWith = (seal: boolean) => {
        setWithSeal(seal);
        const title = document.title;
        document.title = (letter?.letter_number ?? 'lettre').replace(/\//g, '-');
        setTimeout(() => {
            window.print();
            document.title = title;
        }, 150);
    };

    // Coming from the editor with "save and print": print once the letter (and, if asked, the seals) are loaded
    useEffect(() => {
        if (printed.current || !letter || !printRequest) return;
        if (printRequest === 'signed' && !hasSeals) return;
        printed.current = true;
        const signed = printRequest === 'signed';
        // Not cancelled on re-render: removing ?print from the address below changes the search params
        setTimeout(() => {
            printWith(signed);
            window.history.replaceState(null, '', window.location.href.replace(/[&?]print=\w+/, ''));
        }, 400);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [letter, hasSeals, printRequest]);

    const act = async (body: Record<string, unknown>) => {
        setBusy(true);
        setError('');
        try {
            const res = await api<Letter>(`/api/biz/letters/${id}`, 'PATCH', body);
            if (body.action === 'duplicate') router.push(`/admin/letters/edit?id=${res.id}`);
            else setLetter(res);
        } catch {
            setError(b.common.saveError);
        } finally {
            setBusy(false);
        }
    };

    const Back = isRTL ? ArrowRight : ArrowLeft;
    if (!letter) return <div className="space-y-4"><ErrorBox message={error} />{!error && <div className="text-white/60 text-sm py-10 text-center">{b.common.loading}</div>}</div>;

    return (
        <div className="space-y-6">
            <div className="print:hidden space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <Link href="/admin/letters" className="p-2 rounded-lg hover:bg-white/10" aria-label={b.common.back}><Back className="w-5 h-5" /></Link>
                    <h1 className="text-2xl font-bold"><span dir="ltr">{letter.letter_number}</span></h1>
                    <StatusBadge status={letter.status} />
                </div>
                <ErrorBox message={error} />
                {letter.status === 'sent' && <p className="text-xs text-white/60">{l.locked}</p>}
                {letter.status === 'cancelled' && <p className="text-xs text-white/60">{l.cancelledNote}</p>}
                {!hasSeals && (
                    <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                        {d.noSeals} <Link href="/admin/company" className="font-bold underline">{d.goToCompany}</Link>
                    </p>
                )}
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => printWith(true)} disabled={!hasSeals || letter.status === 'cancelled'} className={primaryBtn}><Stamp className="w-4 h-4" />{d.printSigned}</button>
                    <button onClick={() => printWith(false)} className={ghostBtn}><Printer className="w-4 h-4" />{d.printUnsigned}</button>
                    {letter.status === 'draft' && <Link href={`/admin/letters/edit?id=${letter.id}`} className={ghostBtn}><Pencil className="w-4 h-4" />{b.common.edit}</Link>}
                    {letter.status === 'draft' && (
                        <button disabled={busy} onClick={() => confirm(l.confirmSent) && act({ action: 'status', status: 'sent' })} className={ghostBtn}><Send className="w-4 h-4" />{l.markSent}</button>
                    )}
                    <button disabled={busy} onClick={() => act({ action: 'duplicate' })} className={ghostBtn}><Copy className="w-4 h-4" />{l.duplicate}</button>
                    {letter.status !== 'cancelled' ? (
                        <button disabled={busy} onClick={() => confirm(l.confirmCancel) && act({ action: 'status', status: 'cancelled' })} className={`${ghostBtn} text-red-300`}><Ban className="w-4 h-4" />{l.cancel}</button>
                    ) : (
                        <button disabled={busy} onClick={() => act({ action: 'status', status: 'draft' })} className={ghostBtn}><Undo2 className="w-4 h-4" />{l.restore}</button>
                    )}
                </div>
            </div>

            <LetterPaper letter={letter} company={company} bank={bank} seals={seals} withSeal={withSeal} />
        </div>
    );
}
