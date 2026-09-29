// The dashboard assistant: answers questions about the company's figures by calling read-only tools.
// Figures always come from these tools (the same calculations as the finance pages), never from the model's own arithmetic.
// Reading tools never change data. Writing tools only create or edit drafts (letters, invoices, quotes): they never
// send, record payments, cancel or delete; a person reviews, prints and marks documents as sent from the pages.
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccess, type SessionUser } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { money } from '@/lib/biz';
import { financialSummary } from '@/lib/finance';
import { LETTER_LANGS, createLetter, letterContent } from '@/lib/letters';
import { createDocument } from '@/lib/documents';

export const ASSISTANT_MODEL = 'claude-opus-5-5';
const MAX_ROUNDS = 6;

export type ChatTurn = { role: 'user' | 'assistant'; text: string };

type Tool = { area: 'finance' | 'hr'; write?: boolean; definition: Anthropic.Beta.BetaTool; run: (input: Record<string, unknown>, user: SessionUser) => Promise<unknown> };

const int = (v: unknown, min: number, max: number): number | null => {
    const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
    return Number.isInteger(n) && n >= min && n <= max ? n : null;
};
const str = (v: unknown, max = 100): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const thisYear = () => new Date().getFullYear();
const VIA = ' (assistant)';

// The one client whose name matches, or the candidates so the model can ask which one
async function findParty(name: string) {
    const { data, error } = await supabaseAdmin.from('parties').select('id, name, address').order('name');
    if (error) throw new Error(error.message);
    const q = name.trim().toLowerCase();
    const all = data ?? [];
    const exact = all.filter(p => p.name.trim().toLowerCase() === q);
    const partial = exact.length ? exact : all.filter(p => p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase()));
    return { match: partial.length === 1 ? partial[0] : null, candidates: partial.length > 1 ? partial.map(p => p.name) : all.map(p => p.name) };
}

const TOOLS: Tool[] = [
    {
        area: 'finance',
        definition: {
            name: 'financial_summary',
            description:
                'Financial position for one calendar year: payments received (income), expenses including paid salaries, net result, amounts clients still owe, monthly figures, expenses by category and the list of unpaid invoices. Amounts are in MRU (new ouguiya).',
            input_schema: { type: 'object', properties: { year: { type: 'integer', description: 'Calendar year, default the current year' } } },
        },
        run: async input => financialSummary(int(input.year, 2000, 2100) ?? thisYear()),
    },
    {
        area: 'finance',
        definition: {
            name: 'list_invoices',
            description:
                'Invoices or quotes with client, dates, total, amount paid, amount withheld at source and remaining balance. Use status "unpaid" for what clients still owe.',
            input_schema: {
                type: 'object',
                properties: {
                    type: { type: 'string', enum: ['invoice', 'quote'], description: 'Default invoice' },
                    status: { type: 'string', enum: ['unpaid', 'paid', 'all'], description: 'Default all' },
                    client: { type: 'string', description: 'Part of the client name' },
                    year: { type: 'integer', description: 'Year of the document date' },
                },
            },
        },
        run: async input => {
            let q = supabaseAdmin
                .from('accounting_invoices')
                .select('invoice_number, type, date, due_date, status, total_ttc, paid_amount, withheld_amount, paid_at, party:parties(name)')
                .eq('type', input.type === 'quote' ? 'quote' : 'invoice')
                .order('date', { ascending: false })
                .limit(100);
            const year = int(input.year, 2000, 2100);
            if (year) q = q.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
            const { data, error } = await q;
            if (error) throw new Error(error.message);
            const client = str(input.client)?.toLowerCase();
            const rows = (data ?? [])
                .map(r => {
                    const party = r.party as { name?: string } | { name?: string }[] | null;
                    const name = (Array.isArray(party) ? party[0]?.name : party?.name) ?? null;
                    const remaining = money(money(r.total_ttc) - money(r.paid_amount) - money(r.withheld_amount));
                    return { number: r.invoice_number, client: name, date: r.date, due_date: r.due_date, status: r.status, total: money(r.total_ttc), paid: money(r.paid_amount), withheld: money(r.withheld_amount), remaining, paid_at: r.paid_at };
                })
                .filter(r => r.status !== 'cancelled')
                .filter(r => !client || (r.client ?? '').toLowerCase().includes(client))
                .filter(r => (input.status === 'unpaid' ? r.remaining > 0 : input.status === 'paid' ? r.remaining <= 0 : true));
            return { count: rows.length, total_remaining: money(rows.reduce((s, r) => s + r.remaining, 0)), documents: rows };
        },
    },
    {
        area: 'finance',
        definition: {
            name: 'list_expenses',
            description: 'Expenses with number, date, description, category, supplier and amount, plus totals by category. Salaries paid through payroll are in financial_summary, not here.',
            input_schema: {
                type: 'object',
                properties: {
                    year: { type: 'integer', description: 'Default the current year' },
                    month: { type: 'integer', description: '1-12, optional' },
                    category: { type: 'string', description: 'e.g. rent, equipment, subcontracting, bank, hosting, telecom, transport, marketing, fees, supplies, salaries, other' },
                },
            },
        },
        run: async input => {
            const year = int(input.year, 2000, 2100) ?? thisYear();
            const month = int(input.month, 1, 12);
            const from = month ? `${year}-${String(month).padStart(2, '0')}-01` : `${year}-01-01`;
            const to = month ? `${year}-${String(month).padStart(2, '0')}-31` : `${year}-12-31`;
            let q = supabaseAdmin
                .from('accounting_expenses')
                .select('expense_number, date, description, category, amount_ttc, party:parties(name)')
                .gte('date', from)
                .lte('date', to)
                .order('date', { ascending: false })
                .limit(200);
            const category = str(input.category, 40);
            if (category) q = q.eq('category', category);
            const { data, error } = await q;
            if (error) throw new Error(error.message);
            const byCategory: Record<string, number> = {};
            const items = (data ?? []).map(r => {
                byCategory[r.category || 'other'] = money((byCategory[r.category || 'other'] ?? 0) + money(r.amount_ttc));
                const party = r.party as { name?: string } | { name?: string }[] | null;
                return { number: r.expense_number, date: r.date, description: r.description, category: r.category, supplier: (Array.isArray(party) ? party[0]?.name : party?.name) ?? null, amount: money(r.amount_ttc) };
            });
            return { period: { from, to }, count: items.length, total: money(items.reduce((s, r) => s + r.amount, 0)), byCategory, items: items.slice(0, 60) };
        },
    },
    {
        area: 'finance',
        definition: {
            name: 'bank_status',
            description: 'Bank accounts with the balance computed from recorded movements, the last balance given by the bank and the difference, and the number of movements not yet matched to an invoice or expense.',
            input_schema: { type: 'object', properties: {} },
        },
        run: async () => {
            const [{ data: accounts, error }, { data: tx, error: txError }] = await Promise.all([
                supabaseAdmin.from('bank_accounts').select('id, bank_name, account_number, statement_balance, statement_date').eq('is_active', true),
                supabaseAdmin.from('bank_transactions').select('bank_account_id, date, amount, type, is_reconciled'),
            ]);
            if (error || txError) throw new Error((error || txError)?.message);
            const signed = (t: { type: string; amount: number }) => (t.type === 'income' ? 1 : -1) * money(t.amount);
            return (accounts ?? []).map(a => {
                const mine = (tx ?? []).filter(t => t.bank_account_id === a.id);
                const computedAtStatement = a.statement_date ? money(mine.filter(t => t.date <= a.statement_date).reduce((s, t) => s + signed(t), 0)) : null;
                return {
                    bank: a.bank_name,
                    account_number: a.account_number,
                    balance_from_movements: money(mine.reduce((s, t) => s + signed(t), 0)),
                    last_bank_balance: a.statement_balance === null ? null : money(a.statement_balance),
                    last_bank_balance_date: a.statement_date,
                    difference_with_bank: a.statement_balance === null || computedAtStatement === null ? null : money(money(a.statement_balance) - computedAtStatement),
                    movements_to_match: mine.filter(t => !t.is_reconciled).length,
                };
            });
        },
    },
    {
        area: 'finance',
        definition: {
            name: 'find_clients',
            description: 'Clients and suppliers with their contact details (NIF, RC, address, phone, e-mail).',
            input_schema: { type: 'object', properties: { search: { type: 'string', description: 'Part of the name, optional' } } },
        },
        run: async input => {
            const { data, error } = await supabaseAdmin.from('parties').select('name, type, nif, rc, address, phone, email').order('name').limit(200);
            if (error) throw new Error(error.message);
            const q = str(input.search)?.toLowerCase();
            return (data ?? []).filter(p => !q || p.name.toLowerCase().includes(q));
        },
    },
    {
        area: 'finance',
        definition: {
            name: 'list_letters',
            description: 'Letters register: number, date, recipient, subject and status (draft, sent, cancelled).',
            input_schema: { type: 'object', properties: { search: { type: 'string', description: 'Words from the subject or recipient, optional' } } },
        },
        run: async input => {
            const { data, error } = await supabaseAdmin.from('company_letters').select('letter_number, date, recipient, subject, status').order('date', { ascending: false }).limit(100);
            if (error) throw new Error(error.message);
            const q = str(input.search)?.toLowerCase();
            return (data ?? []).filter(l => !q || `${l.subject} ${l.recipient}`.toLowerCase().includes(q));
        },
    },
    {
        area: 'hr',
        definition: {
            name: 'payroll_summary',
            description: 'Payslips of one month: employee, gross salary, deductions, net pay, employer contributions and whether it was paid.',
            input_schema: {
                type: 'object',
                properties: { year: { type: 'integer' }, month: { type: 'integer', description: '1-12' } },
                required: ['year', 'month'],
            },
        },
        run: async input => {
            const year = int(input.year, 2000, 2100) ?? thisYear();
            const month = int(input.month, 1, 12) ?? new Date().getMonth() + 1;
            const { data, error } = await supabaseAdmin
                .from('pay_slips')
                .select('salary_brut, bonus, deductions, cnss_sal, cnam_sal, its, net_paye, cnss_pat, cnam_pat, is_paid, paid_at, notes, employee:employees(full_name, position)')
                .eq('period_year', year)
                .eq('period_month', month);
            if (error) throw new Error(error.message);
            return { year, month, payslips: data ?? [] };
        },
    },
    {
        area: 'finance',
        write: true,
        definition: {
            name: 'create_letter_draft',
            description:
                'Creates a DRAFT letter on the company letterhead in the Letters register, with the next serial number (L/YYYY/NNN). The user then reviews, prints (with or without stamp and signature) and marks it as sent. Write the complete body yourself: greeting, paragraphs separated by an empty line, and the closing formula as the last paragraph. The signature, letterhead and date are added automatically, so do not write them in the body. French letters use a neutral greeting ("Bonjour,") and closing ("Nous vous prions d’agréer l’expression de nos salutations distinguées."), never Madame/Monsieur.',
            input_schema: {
                type: 'object',
                properties: {
                    language: { type: 'string', enum: ['fr', 'ar', 'en'] },
                    recipient: { type: 'string', description: 'Name, title and address of the recipient, one per line' },
                    subject: { type: 'string' },
                    body: { type: 'string', description: 'Full text: greeting, paragraphs separated by a blank line, closing formula' },
                    reference: { type: 'string', description: 'Their reference, optional' },
                    attachments: { type: 'string', description: 'Enclosures, one per line, optional' },
                    copies: { type: 'string', description: 'Copy to, optional' },
                    client_name: { type: 'string', description: 'Name of an existing client or supplier to link, optional' },
                },
                required: ['language', 'recipient', 'subject', 'body'],
            },
        },
        run: async (input, user) => {
            let partyId: string | null = null;
            const client = str(input.client_name, 200);
            if (client) partyId = (await findParty(client)).match?.id ?? null;
            const letter = await createLetter(user, { ...input, party_id: partyId }, VIA);
            return { created: true, status: 'draft', letter_number: letter.letter_number, open_url: `/admin/letters/view?id=${letter.id}` };
        },
    },
    {
        area: 'finance',
        write: true,
        definition: {
            name: 'update_letter_draft',
            description: 'Changes a letter that is still a DRAFT (identified by its number). Only the fields given are replaced. Letters already sent cannot be changed.',
            input_schema: {
                type: 'object',
                properties: {
                    letter_number: { type: 'string' },
                    language: { type: 'string', enum: ['fr', 'ar', 'en'] },
                    recipient: { type: 'string' },
                    subject: { type: 'string' },
                    body: { type: 'string' },
                    reference: { type: 'string' },
                    attachments: { type: 'string' },
                    copies: { type: 'string' },
                },
                required: ['letter_number'],
            },
        },
        run: async (input, user) => {
            const number = str(input.letter_number, 60);
            const { data: letter } = await supabaseAdmin.from('company_letters').select('*').eq('letter_number', number ?? '').maybeSingle();
            if (!letter) return { updated: false, reason: 'No letter with this number' };
            if (letter.status !== 'draft') return { updated: false, reason: 'This letter was already sent or cancelled; it cannot be changed. Create a new draft instead.' };
            const merged: Record<string, unknown> = { ...letter };
            for (const key of ['language', 'recipient', 'subject', 'body', 'reference', 'attachments', 'copies']) if (typeof input[key] === 'string') merged[key] = input[key];
            if (!LETTER_LANGS.includes(merged.language as (typeof LETTER_LANGS)[number])) merged.language = letter.language;
            const content = letterContent(merged);
            const { error } = await supabaseAdmin.from('company_letters').update({ ...content, updated_at: new Date().toISOString() }).eq('id', letter.id);
            if (error) throw new Error(error.message);
            await logActivity(user, 'update', 'letter', `${letter.letter_number} – ${content.subject}${VIA}`, letter.id);
            return { updated: true, letter_number: letter.letter_number, open_url: `/admin/letters/view?id=${letter.id}` };
        },
    },
    {
        area: 'finance',
        write: true,
        definition: {
            name: 'create_invoice_draft',
            description:
                'Creates a DRAFT invoice or quote for an existing client, with the next number (F/YYYY/NNN or DEV/YYYY/NNN). Never invent amounts, quantities or the client: they must come from the user. VAT is 0 unless the user gives a rate. The user reviews, prints and sends it from the Invoices page.',
            input_schema: {
                type: 'object',
                properties: {
                    type: { type: 'string', enum: ['invoice', 'quote'] },
                    client_name: { type: 'string', description: 'Name of an existing client' },
                    lines: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                description: { type: 'string' },
                                quantity: { type: 'number' },
                                unit_price: { type: 'number', description: 'Price per unit before VAT, in MRU' },
                            },
                            required: ['description', 'quantity', 'unit_price'],
                        },
                    },
                    tva_rate: { type: 'number', description: 'VAT rate in percent, default 0' },
                    due_date: { type: 'string', description: 'YYYY-MM-DD, optional' },
                    notes: { type: 'string', description: 'Subject, contract reference, payment terms… printed under the totals, optional' },
                },
                required: ['type', 'client_name', 'lines'],
            },
        },
        run: async (input, user) => {
            const client = str(input.client_name, 200);
            const found = client ? await findParty(client) : null;
            if (!found?.match) {
                return { created: false, reason: client ? 'No single client matches this name. Ask the user which one, or to add the client on the Clients page first.' : 'Client missing', clients: found?.candidates ?? [] };
            }
            const doc = await createDocument(user, { ...input, party_id: found.match.id }, VIA);
            return { created: true, status: 'draft', type: doc.type, number: doc.invoice_number, client: found.match.name, total_ttc: doc.total_ttc, open_url: `/admin/invoices/view?id=${doc.id}` };
        },
    },

];

export function toolsFor(user: SessionUser) {
    return TOOLS.filter(t => canAccess(user, t.area));
}

function systemPrompt(user: SessionUser, today: string) {
    return `You are the assistant inside the admin dashboard of AFRIKYIA-SUARL (trade name Afrikyia, "Solutions Intelligentes"), a small digital-services company in Nouakchott, Mauritania. You help the team understand the company's figures and prepare draft letters, invoices and quotes.

How to answer:
- Reply in the language the user writes in (usually Arabic, sometimes French or English). Keep answers short, clear and practical.
- Every figure must come from a tool result. Never estimate, invent or recompute totals yourself when a tool gives them; if a tool does not provide something, say so.
- Amounts are in MRU (new ouguiya). Write them with thousands separators, e.g. 545 200 MRU.
- Use short paragraphs and simple bullet lists. Do not use tables or headings.
- When a figure looks unusual (an unpaid invoice past its due date, a difference with the bank, movements not yet matched), point it out in one sentence and name the page to check: Finances, Invoices and quotes, Expenses, Bank, Clients, Letters, Payroll.

What you can and cannot do:
- Reading tools answer questions. Writing tools create or edit DRAFTS only: letters, invoices and quotes. You cannot send documents, record payments, cancel or delete anything; say so if asked, and point to the right page.
- Letters: you may write the whole letter yourself from the user's instructions. Use the recipient's details from find_clients when the user names a known client.
- Invoices and quotes: the client must already exist, and every amount, quantity and description must come from the user. If something needed is missing or unclear, ask one short question instead of guessing. Before creating, you do not need to ask for confirmation when the user gave all the details.
- Create each document once. If the user asks for a change to a draft letter, use update_letter_draft; for a draft invoice, tell them to use the Edit button on its page.
- After creating or updating a draft, give its number and the link exactly as a markdown link, for example [Open the letter](/admin/letters/view?id=…), and remind in one line that it is a draft to review before printing.
- Only use the tools available to you; if a question needs data you have no tool for, say that this user's role does not give access to it.

Context: today is ${today}. The user is ${user.name} (role: ${user.role}).`;
}

function client() {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    return apiKey ? new Anthropic({ apiKey, timeout: 55_000, maxRetries: 1 }) : null;
}

export class AssistantError extends Error {
    constructor(public code: 'NotConfigured' | 'Refused' | 'Failed', message?: string) {
        super(message ?? code);
    }
}

// Runs one question through Claude with the user's tools and returns the final answer text
export async function askAssistant(user: SessionUser, history: ChatTurn[], spoken = false): Promise<{ reply: string; usage: { input: number; output: number } }> {
    const anthropic = client();
    if (!anthropic) throw new AssistantError('NotConfigured');
    const tools = toolsFor(user);
    const byName = new Map(tools.map(t => [t.definition.name, t]));
    const messages: Anthropic.Beta.BetaMessageParam[] = history.map(t => ({ role: t.role, content: t.text }));
    // A spoken question gets an answer written to be heard: short sentences, no lists or symbols
    const system =
        systemPrompt(user, new Date().toISOString().slice(0, 10)) +
        (spoken
            ? '\n\nThis question was spoken and your answer will be read aloud. Answer in two to four short, natural sentences, with no lists, markdown, links or symbols; write amounts the way a person says them (e.g. "about 545 thousand ouguiyas"). If you created a draft, say its number and that the link is shown on screen, then add the markdown link on its own last line.'
            : '');
    const usage = { input: 0, output: 0 };

    for (let round = 0; round < MAX_ROUNDS; round++) {
        const response = await anthropic.beta.messages.create({
            model: ASSISTANT_MODEL,
            max_tokens: 8000,
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
            output_config: { effort: 'low' },
            system,
            tools: tools.map(t => t.definition),
            messages,
        });
        usage.input += response.usage.input_tokens;
        usage.output += response.usage.output_tokens;

        if (response.stop_reason === 'refusal') throw new AssistantError('Refused');
        const text = response.content
            .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
            .map(b => b.text)
            .join('\n')
            .trim();
        const calls = response.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use');
        if (response.stop_reason !== 'tool_use' || calls.length === 0) {
            if (response.stop_reason === 'pause_turn') {
                messages.push({ role: 'assistant', content: response.content });
                continue;
            }
            return { reply: text || '…', usage };
        }

        messages.push({ role: 'assistant', content: response.content });
        const results: Anthropic.Beta.BetaToolResultBlockParam[] = await Promise.all(
            calls.map(async call => {
                const tool = byName.get(call.name);
                if (!tool) return { type: 'tool_result' as const, tool_use_id: call.id, content: 'This tool is not available for this user.', is_error: true };
                try {
                    const input = call.input && typeof call.input === 'object' ? (call.input as Record<string, unknown>) : {};
                    return { type: 'tool_result' as const, tool_use_id: call.id, content: JSON.stringify(await tool.run(input, user)) };
                } catch (e) {
                    return { type: 'tool_result' as const, tool_use_id: call.id, content: `Error: ${e instanceof Error ? e.message : 'unknown'}`, is_error: true };
                }
            })
        );
        messages.push({ role: 'user', content: results });
    }
    throw new AssistantError('Failed', 'TooManyRounds');
}
