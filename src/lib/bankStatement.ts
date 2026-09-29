// Classifies lines of a bank statement (BFI format: date, operation type, amount, reference, Debit/Credit).

export type StatementLine = { date: string; label: string; amount: number; reference: string; direction: 'credit' | 'debit' };
export type Kind = 'income' | 'fee' | 'transfer' | 'expense';

const FEE_PATTERNS = [/FRAIS/i, /^TOF\b/i, /COMMISSION/i, /DEBIT DIVERS/i, /AGIOS?/i, /TAXE/i, /TIMBRE/i];
const CASH_PATTERNS = [/RETRAIT/i, /MISE .?A DISPOSITION/i];

export function classify(line: StatementLine): { kind: Kind; category: string } {
    if (line.direction === 'credit') return { kind: 'income', category: 'client_payment' };
    if (FEE_PATTERNS.some(p => p.test(line.label))) return { kind: 'fee', category: 'bank_fees' };
    if (CASH_PATTERNS.some(p => p.test(line.label.normalize('NFD').replace(/[̀-ͯ]/g, '')))) return { kind: 'transfer', category: 'cash_withdrawal' };
    return { kind: 'expense', category: 'other' };
}

// "31/08/2026" or an Excel date → "2026-08-31"
export function toIsoDate(value: unknown): string | null {
    if (value instanceof Date && !isNaN(value.getTime())) return value.toISOString().slice(0, 10);
    const s = String(value ?? '').trim();
    const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

// "458250,0" / "1 200,50" / 458250 → number
export function toAmount(value: unknown): number {
    if (typeof value === 'number') return Math.abs(value);
    const n = parseFloat(String(value ?? '').replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(n) ? Math.abs(n) : 0;
}

// Rows of the BFI Excel export → statement lines (header row located by its column names)
export function parseBfiRows(rows: unknown[][]): StatementLine[] {
    const headerIndex = rows.findIndex(r => r.some(c => /Trs date/i.test(String(c))) && r.some(c => /Montant/i.test(String(c))));
    if (headerIndex < 0) return [];
    const header = rows[headerIndex].map(c => String(c ?? '').trim());
    const col = (re: RegExp) => header.findIndex(h => re.test(h));
    const iDate = col(/Trs date/i);
    const iType = col(/Type d/i);
    const iAmount = col(/Montant/i);
    const iRef = col(/R[ée]f[ée]rence/i);
    const iCd = col(/^CD$/i);
    const out: StatementLine[] = [];
    for (const r of rows.slice(headerIndex + 1)) {
        const date = toIsoDate(r[iDate]);
        const amount = toAmount(r[iAmount]);
        if (!date || !amount) continue;
        out.push({
            date,
            label: String(r[iType] ?? '').trim(),
            amount,
            reference: String(r[iRef] ?? '').trim(),
            direction: /credit/i.test(String(r[iCd] ?? '')) ? 'credit' : 'debit',
        });
    }
    return out;
}
