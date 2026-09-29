"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';
import { Trash2, Edit3, X, FileText, File as FileIcon, FolderLock } from 'lucide-react';
import { useAdminSession } from '@/components/admin/AdminSession';

type StoredFile = {
    id: string;
    name?: string;
    originalName?: string;
    url?: string;
    size?: number;
    type?: string;
    category?: string;
    description?: string;
    date?: string;
};

// First guess of the vault section, from the file name
function guessVaultCategory(name: string): string {
    const n = name.toLowerCase();
    if (/rib|banque|bank|relev/.test(n)) return 'bank';
    if (/cnss|cnam|social/.test(n)) return 'social';
    if (/nif|fiscal|imp[oô]t|tax/.test(n)) return 'tax';
    if (/contrat|contract|convention/.test(n)) return 'contracts';
    if (/statut|registre|commerce|immatriculation|rc\b/.test(n)) return 'legal';
    if (/ent[eê]te|papier|cachet|mod[eè]le/.test(n)) return 'templates';
    return 'other';
}

type PreviewKind = 'image' | 'pdf' | 'video' | 'none';

// Browsers can show these inline; anything else (JPEG 2000, Word…) gets an icon with its extension.
function previewKind(file: StoredFile): PreviewKind {
    const type = (file.type || '').toLowerCase();
    const ext = ((file.originalName || file.url || file.name || '').split('?')[0].match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
    if (type === 'image/jp2' || ext === 'jp2' || ext === 'tif' || ext === 'tiff') return 'none';
    if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'].includes(ext)) return 'image';
    if (type === 'application/pdf' || ext === 'pdf') return 'pdf';
    if (type.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext)) return 'video';
    return 'none';
}

function fileExt(file: StoredFile): string {
    return ((file.originalName || file.name || file.url || '').split('?')[0].match(/\.([a-z0-9]+)$/i)?.[1] || '').toUpperCase();
}

function FilePreview({ file }: { file: StoredFile }) {
    const [failed, setFailed] = useState(false);
    const kind = failed || !file.url ? 'none' : previewKind(file);
    return (
        <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="file-preview block relative h-44 -mx-6 -mt-6 mb-5 rounded-t-2xl overflow-hidden border-b border-white/5 bg-white/5"
            title={file.name}
        >
            {kind === 'image' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.url} alt={file.name || ''} loading="lazy" onError={() => setFailed(true)} className="w-full h-full object-contain p-3" />
            )}
            {kind === 'pdf' && (
                <iframe src={`${file.url}#toolbar=0&navpanes=0&view=FitH`} title={file.name || 'PDF'} loading="lazy" className="w-full h-full border-0 pointer-events-none bg-white" />
            )}
            {kind === 'video' && <video src={file.url} preload="metadata" muted className="w-full h-full object-contain" />}
            {kind === 'none' && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/40">
                    {fileExt(file) === 'PDF' ? <FileText size={40} /> : <FileIcon size={40} />}
                    <span className="text-xs font-bold tracking-wider">{fileExt(file) || 'FILE'}</span>
                </div>
            )}
        </a>
    );
}

export default function FilesPage() {
    const { t, isRTL } = useLanguage();
    const [files, setFiles] = useState<StoredFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingFile, setEditingFile] = useState<StoredFile | null>(null);
    const [editForm, setEditForm] = useState({ name: '', category: 'document', description: '' });
    const { areas } = useAdminSession();
    const canMove = areas.includes('finance') && areas.includes('publishing');
    const [moving, setMoving] = useState<StoredFile | null>(null);
    const [moveForm, setMoveForm] = useState({ title: '', category: 'other' });
    const [moveBusy, setMoveBusy] = useState(false);
    const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
    const f = t.admin.files;
    const vaultCategories = t.admin.biz.vault.categories as Record<string, string>;

    const openMove = (file: StoredFile) => {
        const title = (file.name || file.originalName || '').replace(/\.[a-z0-9]{1,5}$/i, '').trim();
        setMoveForm({ title, category: guessVaultCategory(`${file.name} ${file.originalName}`) });
        setMoving(file);
    };

    const handleMove = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moving) return;
        setMoveBusy(true);
        try {
            const res = await fetch('/api/biz/company-docs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'import-file', file_id: moving.id, title: moveForm.title, category: moveForm.category }),
            });
            if (!res.ok) throw new Error(String(res.status));
            setFiles(list => list.filter(x => x.id !== moving.id));
            setNotice({ ok: true, text: f.moved });
            setMoving(null);
        } catch {
            setNotice({ ok: false, text: f.moveError });
        } finally {
            setMoveBusy(false);
        }
    };

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                localStorage.removeItem('afrikyia-files');
                localStorage.removeItem('afrikyia-files-modified');

                const res = await fetch('/api/files', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setFiles(data);
                }
            } catch (error) {
                console.error("Failed to fetch files", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFiles();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا الملف؟' : 'Are you sure you want to delete this file?')) return;
        
        // Optimistic update
        const updatedFiles = files.filter(f => f.id !== id);
        setFiles(updatedFiles);

        try {
            await fetch('/api/files', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
        } catch (error) {
            console.error('Error deleting file', error);
        }
    };

    const handleEditOpen = (file: StoredFile) => {
        setEditingFile(file);
        setEditForm({ name: file.name || '', category: file.category || 'document', description: file.description || '' });
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFile) return;

        // Optimistic update
        const updatedFiles = files.map(f => {
            if (f.id === editingFile.id) {
                return { ...f, ...editForm };
            }
            return f;
        });
        
        setFiles(updatedFiles);
        setEditingFile(null);

        try {
            await fetch('/api/files', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingFile.id, updates: editForm })
            });
        } catch (error) {
            console.error('Error updating file', error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b border-white/5 pb-4`}>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    {t.admin.files.title}
                </h1>
                <Link 
                    href="/admin/files/new"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20"
                >
                    {t.admin.files.addFile}
                </Link>
            </div>

            <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">{f.publicWarning}</p>
            {notice && (
                <p className={`text-sm rounded-lg px-3 py-2 border ${notice.ok ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>{notice.text}</p>
            )}

            {/* List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-20 text-white/50">
                        {isRTL ? "جاري التحميل..." : "Loading..."}
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-20 bg-[#1a1a1a] border border-white/5 rounded-2xl">
                        <div className="text-white/60 mb-2">{t.admin.files.noFiles}</div>
                        <p className="text-white/20 text-sm">{t.admin.files.noFilesSub}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {files.map((file) => (
                            <div key={file.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-yellow-400/30 transition-all group overflow-hidden">
                                <div>
                                    <FilePreview file={file} />
                                    <div className="flex justify-between items-center mb-3 gap-2">
                                        <span className="text-xs font-medium text-white/40 bg-white/5 px-2 py-1 rounded">
                                            {file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : '0.00 MB'}
                                        </span>
                                        <div className="flex gap-1">
                                            {canMove && (
                                                <button onClick={() => openMove(file)} aria-label={f.moveToVault} title={f.moveToVault} className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all">
                                                    <FolderLock size={14} />
                                                </button>
                                            )}
                                            <button onClick={() => handleEditOpen(file)} aria-label={isRTL ? 'تعديل' : 'Edit'} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(file.id)} aria-label={isRTL ? 'حذف' : 'Delete'} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-white mb-1 truncate">{file.name || 'Unknown File'}</h3>
                                    <p className="text-sm text-white/50 mb-4">{file.date ? new Date(file.date).toLocaleDateString() : 'N/A'}</p>
                                    
                                    {file.description && (
                                        <p className="text-sm text-white/70 mb-6 line-clamp-2">{file.description}</p>
                                    )}
                                </div>
                                <a 
                                    href={file.url} 
                                    download={file.originalName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-white/5 hover:bg-yellow-400 hover:text-black text-white text-center py-2.5 rounded-xl text-sm font-bold transition-all block mt-4"
                                >
                                    {isRTL ? "تحميل الملف" : "Download File"}
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Move to the private company documents */}
            {moving && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <form onSubmit={handleMove} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">{f.moveTitle}</h3>
                            <button type="button" onClick={() => setMoving(null)} className="text-white/50 hover:text-white" aria-label="close"><X size={20} /></button>
                        </div>
                        <p className="text-sm text-white/60">{f.moveHint}</p>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">{t.admin.biz.vault.titleField}</label>
                            <input value={moveForm.title} onChange={e => setMoveForm({ ...moveForm, title: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1">{t.admin.biz.vault.category}</label>
                            <select value={moveForm.category} onChange={e => setMoveForm({ ...moveForm, category: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400">
                                {Object.entries(vaultCategories).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setMoving(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                            <button type="submit" disabled={moveBusy} className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold disabled:opacity-60">{moveBusy ? f.moving : f.moveButton}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {editingFile && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">{isRTL ? 'تعديل بيانات الملف' : 'Edit File Details'}</h3>
                                <button onClick={() => setEditingFile(null)} className="text-white/50 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1">{t.admin.files.fileName}</label>
                                    <input 
                                        type="text" 
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1">{t.admin.files.category}</label>
                                    <select 
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all"
                                    >
                                        <option value="document">{t.admin.files.catDocument}</option>
                                        <option value="invoice">{t.admin.files.catInvoice}</option>
                                        <option value="design">{t.admin.files.catDesign}</option>
                                        <option value="other">{t.admin.files.catOther}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-1">{t.admin.files.description}</label>
                                    <textarea 
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all resize-none h-24"
                                    />
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setEditingFile(null)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-all"
                                    >
                                        {isRTL ? 'إلغاء' : 'Cancel'}
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold transition-all shadow-lg shadow-yellow-400/20"
                                    >
                                        {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
