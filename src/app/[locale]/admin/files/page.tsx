"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';
import { Trash2, Edit3, X } from 'lucide-react';

export default function FilesPage() {
    const { t, isRTL } = useLanguage();
    const [files, setFiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingFile, setEditingFile] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ name: '', category: 'document', description: '' });

    useEffect(() => {
        const fetchFiles = async () => {
            const hasLocalMod = localStorage.getItem('afrikyia-files-modified') === 'true';
            const cached = localStorage.getItem('afrikyia-files');
            
            if (cached) {
                try {
                    let parsedCache = JSON.parse(cached);
                    if (Array.isArray(parsedCache)) {
                        // Sanitize: remove any nested arrays caused by previous bug
                        parsedCache = parsedCache.flat().filter(item => item && typeof item === 'object' && !Array.isArray(item) && item.id);
                        
                        setFiles(parsedCache);
                        if (hasLocalMod) {
                            setIsLoading(false);
                            return;
                        }
                    }
                } catch(e) {
                    console.error("Failed to parse cached files");
                }
            }

            try {
                const res = await fetch('/api/files');
                if (res.ok) {
                    const data = await res.json();
                    if (!hasLocalMod || !cached) {
                        setFiles(data);
                        localStorage.setItem('afrikyia-files', JSON.stringify(data));
                    }
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
        localStorage.setItem('afrikyia-files', JSON.stringify(updatedFiles));
        localStorage.setItem('afrikyia-files-modified', 'true');

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

    const handleEditOpen = (file: any) => {
        setEditingFile(file);
        setEditForm({ name: file.name, category: file.category, description: file.description || '' });
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
        localStorage.setItem('afrikyia-files', JSON.stringify(updatedFiles));
        localStorage.setItem('afrikyia-files-modified', 'true');
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
            <div className={`flex justify-between items-center border-b border-white/5 pb-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
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
                            <div key={file.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-yellow-400/30 transition-all group">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-white/5 p-3 rounded-xl text-2xl">
                                            {file.category === 'document' ? '📄' : file.category === 'design' ? '🎨' : file.category === 'invoice' ? '🧾' : '📁'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-white/40 bg-white/5 px-2 py-1 rounded">
                                                {file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : '0.00 MB'}
                                            </span>
                                            {/* Action Buttons */}
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditOpen(file)} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all">
                                                    <Edit3 size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(file.id)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
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
