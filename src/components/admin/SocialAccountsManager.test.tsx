import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SocialAccountsManager from './SocialAccountsManager';

const mockAccounts = [
    {
        id: 'soc-fb-1',
        platform: 'facebook',
        url: 'https://facebook.com/afrikyia',
        handle: 'AFRIKYIA',
        label: 'Facebook',
        isActive: true,
        order: 1,
    },
    {
        id: 'soc-tt-1',
        platform: 'tiktok',
        url: 'https://tiktok.com/@afrikyia',
        handle: '@afrikyia',
        label: 'TikTok',
        isActive: false,
        order: 2,
    },
];

describe('SocialAccountsManager Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn().mockImplementation((url, options) => {
            const method = options?.method || 'GET';
            if (method === 'GET') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ accounts: mockAccounts }),
                });
            }
            if (method === 'POST') {
                const body = JSON.parse(options.body);
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        accounts: [...mockAccounts, { ...body, id: 'new-id', isActive: true, order: 3 }],
                    }),
                });
            }
            if (method === 'PUT') {
                const body = JSON.parse(options.body);
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        accounts: mockAccounts.map(a => (a.id === body.id ? { ...a, ...body } : a)),
                    }),
                });
            }
            if (method === 'DELETE') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        accounts: mockAccounts.filter(a => a.id !== 'soc-fb-1'),
                    }),
                });
            }
            return Promise.resolve({ ok: true, json: async () => ({}) });
        });
    });

    it('renders the list of social accounts', async () => {
        render(<SocialAccountsManager />);
        expect(await screen.findByText('AFRIKYIA')).toBeInTheDocument();
        expect(screen.getByText('@afrikyia')).toBeInTheDocument();
        expect(screen.getByText('https://facebook.com/afrikyia')).toBeInTheDocument();
    });

    it('opens add modal, fills form, and submits a new account', async () => {
        render(<SocialAccountsManager />);
        await screen.findByText('AFRIKYIA');

        // Click Add Account button
        const addBtn = screen.getByRole('button', { name: /إضافة حساب|Ajouter un compte|Add account/i });
        fireEvent.click(addBtn);

        // Modal inputs should appear
        const urlInput = screen.getByPlaceholderText(/https:\/\//i);
        fireEvent.change(urlInput, { target: { value: 'https://linkedin.com/company/afrikyia' } });

        const handleInput = screen.getByTestId('social-handle-input');
        fireEvent.change(handleInput, { target: { value: 'afrikyia-inc' } });

        // Save
        const saveBtn = screen.getByRole('button', { name: /حفظ|Enregistrer|Save/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/admin/socials',
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });
    });

    it('opens edit modal and updates account', async () => {
        render(<SocialAccountsManager />);
        await screen.findByText('AFRIKYIA');

        // Click edit on the first account
        const editBtns = screen.getAllByRole('button', { name: /تعديل|Modifier|Edit/i });
        fireEvent.click(editBtns[0]);

        // Change handle
        const handleInput = screen.getByTestId('social-handle-input');
        fireEvent.change(handleInput, { target: { value: 'afrikyia_updated' } });

        // Submit update
        const saveBtn = screen.getByRole('button', { name: /حفظ التعديلات|Enregistrer|Save/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/admin/socials',
                expect.objectContaining({
                    method: 'PUT',
                })
            );
        });
    });

    it('deletes an account after confirmation', async () => {
        // Mock window.confirm
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(<SocialAccountsManager />);
        await screen.findByText('AFRIKYIA');

        const deleteBtns = screen.getAllByRole('button', { name: /حذف|Supprimer|Delete/i });
        fireEvent.click(deleteBtns[0]);

        expect(confirmSpy).toHaveBeenCalled();
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/admin/socials?id=soc-fb-1'),
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
        });
    });
});

