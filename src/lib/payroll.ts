// Mauritanian payslip calculation. Rates are editable in the admin panel (Payroll → Rates)
// and stored with each payslip, so a later change never alters past slips.

export type ItsBracket = { upTo: number | null; rate: number };

export type PayrollRates = {
    cnssEmployee: number; // % of gross, up to the ceiling
    cnssEmployer: number;
    cnssCeiling: number; // monthly base cap in MRU (0 = no cap)
    cnamEmployee: number; // % of gross
    cnamEmployer: number;
    abatement: number; // monthly MRU deducted before the ITS scale
    its: ItsBracket[]; // applied to the taxable base, in order
};

export const DEFAULT_RATES: PayrollRates = {
    cnssEmployee: 1,
    cnssEmployer: 15,
    cnssCeiling: 15000,
    cnamEmployee: 4,
    cnamEmployer: 5,
    abatement: 6000,
    its: [
        { upTo: 9000, rate: 15 },
        { upTo: 21000, rate: 25 },
        { upTo: null, rate: 40 },
    ],
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function normalizeRates(value: unknown): PayrollRates {
    const v = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
    const num = (x: unknown, d: number) => {
        const n = typeof x === 'number' ? x : parseFloat(String(x ?? ''));
        return Number.isFinite(n) && n >= 0 ? n : d;
    };
    const its = Array.isArray(v.its) && v.its.length
        ? (v.its as Record<string, unknown>[]).slice(0, 8).map((b, i, all) => ({
              upTo: i === all.length - 1 || b.upTo === null || b.upTo === '' ? null : num(b.upTo, 0),
              rate: num(b.rate, 0),
          }))
        : DEFAULT_RATES.its;
    return {
        cnssEmployee: num(v.cnssEmployee, DEFAULT_RATES.cnssEmployee),
        cnssEmployer: num(v.cnssEmployer, DEFAULT_RATES.cnssEmployer),
        cnssCeiling: num(v.cnssCeiling, DEFAULT_RATES.cnssCeiling),
        cnamEmployee: num(v.cnamEmployee, DEFAULT_RATES.cnamEmployee),
        cnamEmployer: num(v.cnamEmployer, DEFAULT_RATES.cnamEmployer),
        abatement: num(v.abatement, DEFAULT_RATES.abatement),
        its,
    };
}

export function computeSlip(salary: number, bonus: number, deductions: number, rates: PayrollRates) {
    const gross = r2(salary + bonus);
    const cnssBase = rates.cnssCeiling > 0 ? Math.min(gross, rates.cnssCeiling) : gross;
    const cnss_sal = r2((cnssBase * rates.cnssEmployee) / 100);
    const cnss_pat = r2((cnssBase * rates.cnssEmployer) / 100);
    const cnam_sal = r2((gross * rates.cnamEmployee) / 100);
    const cnam_pat = r2((gross * rates.cnamEmployer) / 100);
    const taxable_base = Math.max(0, r2(gross - cnss_sal - cnam_sal - rates.abatement));

    let its = 0;
    let from = 0;
    for (const b of rates.its) {
        const to = b.upTo ?? Infinity;
        if (taxable_base > from) its += ((Math.min(taxable_base, to) - from) * b.rate) / 100;
        from = to;
        if (from === Infinity) break;
    }
    its = r2(its);
    const net_paye = r2(gross - cnss_sal - cnam_sal - its - deductions);
    return { gross, cnss_sal, cnss_pat, cnam_sal, cnam_pat, taxable_base, its, net_paye, employer_cost: r2(gross + cnss_pat + cnam_pat) };
}
