import { describe, it, expect } from 'vitest';
import { 
    DIGITAL_CATALOG, 
    getProduct, 
    calculateProductPrice, 
    type ProductItem 
} from './catalog';

describe('Digital Catalog Engine & Pricing Calculator', () => {
    it('contains all core Afrikyia applications and extensible categories', () => {
        expect(DIGITAL_CATALOG).toBeDefined();
        expect(Array.isArray(DIGITAL_CATALOG)).toBe(true);

        const diftar = getProduct('diftar');
        const sanad = getProduct('sanad');
        const elbet = getProduct('elbet');
        const badila = getProduct('badila');

        expect(diftar).toBeDefined();
        expect(sanad).toBeDefined();
        expect(elbet).toBeDefined();
        expect(badila).toBeDefined();

        expect(diftar?.type).toBe('app_subscription');
        expect(sanad?.type).toBe('app_license');
        expect(elbet?.type).toBe('free_platform');
        expect(badila?.type).toBe('free_platform');
    });

    it('accurately calculates prices for all DIFTAR subscription variants', () => {
        // 1 device
        expect(calculateProductPrice('diftar', 'monthly_1dev')).toEqual({
            amount: 1000,
            currency: 'MRU',
            period: 'monthly',
            maxDevices: 1,
            labelAr: 'جهاز واحد — شهري',
        });
        expect(calculateProductPrice('diftar', 'yearly_1dev')).toEqual({
            amount: 11000,
            currency: 'MRU',
            period: 'yearly',
            maxDevices: 1,
            labelAr: 'جهاز واحد — سنوي (توفير 1,000 MRU)',
        });

        // 2 devices
        expect(calculateProductPrice('diftar', 'monthly_2dev')).toEqual({
            amount: 1500,
            currency: 'MRU',
            period: 'monthly',
            maxDevices: 2,
            labelAr: 'جهازين — شهري',
        });
        expect(calculateProductPrice('diftar', 'yearly_2dev')).toEqual({
            amount: 16500,
            currency: 'MRU',
            period: 'yearly',
            maxDevices: 2,
            labelAr: 'جهازين — سنوي (توفير 1,500 MRU)',
        });

        // 3 devices
        expect(calculateProductPrice('diftar', 'monthly_3dev')).toEqual({
            amount: 2000,
            currency: 'MRU',
            period: 'monthly',
            maxDevices: 3,
            labelAr: '3 أجهزة — شهري',
        });
        expect(calculateProductPrice('diftar', 'yearly_3dev')).toEqual({
            amount: 22000,
            currency: 'MRU',
            period: 'yearly',
            maxDevices: 3,
            labelAr: '3 أجهزة — سنوي (توفير 2,000 MRU)',
        });

        // 4 devices
        expect(calculateProductPrice('diftar', 'monthly_4dev')).toEqual({
            amount: 2500,
            currency: 'MRU',
            period: 'monthly',
            maxDevices: 4,
            labelAr: '4 أجهزة — شهري',
        });
        expect(calculateProductPrice('diftar', 'yearly_4dev')).toEqual({
            amount: 27500,
            currency: 'MRU',
            period: 'yearly',
            maxDevices: 4,
            labelAr: '4 أجهزة — سنوي (توفير 2,500 MRU)',
        });
    });

    it('accurately calculates prices for SANAD lifetime license', () => {
        expect(calculateProductPrice('sanad')).toEqual({
            amount: 1000,
            currency: 'MRU',
            period: 'lifetime',
            maxDevices: 1,
            labelAr: 'ترخيص دائم مدى الحياة',
        });
    });

    it('identifies free platform applications', () => {
        expect(calculateProductPrice('elbet')).toEqual({
            amount: 0,
            currency: 'MRU',
            period: 'free',
            maxDevices: 0,
            labelAr: 'تطبيق مجاني — الخدمات مدفوعة داخله',
        });

        expect(calculateProductPrice('badila')).toEqual({
            amount: 0,
            currency: 'MRU',
            period: 'free',
            maxDevices: 0,
            labelAr: 'تطبيق مجاني بالكامل',
        });
    });

    it('supports extensible catalog items like books, films, music, and services', () => {
        const bookSample: ProductItem = {
            id: 'book_sample',
            type: 'digital_book',
            category: 'books',
            nameAr: 'كتاب تقني',
            nameEn: 'Tech Book',
            nameFr: 'Livre Tech',
            basePrice: 500,
            currency: 'MRU',
            fulfillmentType: 'download_link',
            url: 'https://afrikyia.com/books/sample',
        };

        expect(bookSample.type).toBe('digital_book');
        expect(bookSample.fulfillmentType).toBe('download_link');
    });

    it('throws or handles invalid product and variant keys safely', () => {
        expect(() => calculateProductPrice('non_existent')).toThrow('Product not found: non_existent');
        expect(() => calculateProductPrice('diftar', 'invalid_variant')).toThrow('Variant not found: invalid_variant for product diftar');
    });
});
