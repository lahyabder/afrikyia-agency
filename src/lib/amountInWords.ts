// Amount in words for invoices ("Arrêtée la présente facture à la somme de …").

const FR_UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const FR_TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

function frBelow100(n: number): string {
    if (n < 20) return FR_UNITS[n];
    const t = Math.floor(n / 10);
    let u = n % 10;
    if (t === 7 || t === 9) u += 10;
    let word = FR_TENS[t];
    if (u === 0) return t === 8 ? 'quatre-vingts' : word;
    if ((u === 1 || u === 11) && t !== 8 && t !== 9) word += ' et';
    return `${word}${word.endsWith(' et') ? ' ' : '-'}${FR_UNITS[u]}`;
}

function frBelow1000(n: number): string {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    let out = '';
    if (h === 1) out = 'cent';
    else if (h > 1) out = `${FR_UNITS[h]} cent${rest === 0 ? 's' : ''}`;
    if (rest) out += (out ? ' ' : '') + frBelow100(rest);
    return out;
}

export function frenchWords(value: number): string {
    let n = Math.floor(Math.abs(value));
    if (n === 0) return 'zéro';
    const parts: string[] = [];
    const scales: [number, string, string][] = [
        [1_000_000_000, 'milliard', 'milliards'],
        [1_000_000, 'million', 'millions'],
        [1000, 'mille', 'mille'],
    ];
    for (const [size, one, many] of scales) {
        const q = Math.floor(n / size);
        if (!q) continue;
        n %= size;
        if (size === 1000) parts.push(q === 1 ? 'mille' : `${frBelow1000(q).replace(/(cent|vingt)s$/, '$1')} mille`);
        else parts.push(`${frBelow1000(q)} ${q > 1 ? many : one}`);
    }
    if (n) parts.push(frBelow1000(n));
    return parts.join(' ');
}

const EN_UNITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function enBelow1000(n: number): string {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    const parts: string[] = [];
    if (h) parts.push(`${EN_UNITS[h]} hundred`);
    if (rest) parts.push(rest < 20 ? EN_UNITS[rest] : EN_TENS[Math.floor(rest / 10)] + (rest % 10 ? `-${EN_UNITS[rest % 10]}` : ''));
    return parts.join(' ');
}

export function englishWords(value: number): string {
    let n = Math.floor(Math.abs(value));
    if (n === 0) return 'zero';
    const parts: string[] = [];
    for (const [size, name] of [[1_000_000_000, 'billion'], [1_000_000, 'million'], [1000, 'thousand']] as [number, string][]) {
        const q = Math.floor(n / size);
        if (q) {
            parts.push(`${enBelow1000(q)} ${name}`);
            n %= size;
        }
    }
    if (n) parts.push(enBelow1000(n));
    return parts.join(' ');
}
