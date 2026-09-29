"use client";

import { createContext, useContext } from 'react';
import { useLanguage } from '@/context/LanguageContext';

// The signed-in admin user, shared by the admin layout with every admin page
export type AdminSessionUser = { id: string; name: string; email: string; role: 'admin' | 'accountant' | 'user'; owner: boolean };
export type AdminSession = { user: AdminSessionUser | null; areas: string[] };

export const AdminSessionContext = createContext<AdminSession>({ user: null, areas: [] });

export function useAdminSession() {
    return useContext(AdminSessionContext);
}

// Texts of the access pages (users, activity, account), plus shared buttons
export function useAccessTexts() {
    const { t } = useLanguage();
    const c = t.admin.biz.common;
    return { ...t.admin.access, save: c.save, cancel: c.cancel, edit: c.edit, saveError: c.saveError };
}
