"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useRouter } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';

export default function NewFilePage() {
    const router = useRouter();
    const { t, isRTL } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        fileName: '',
        category: 'document',
        description: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            if (!formData.fileName) {
                setFormData(prev => ({ ...prev, fileName: e.target.files![0].name }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedFile) {
            alert(isRTL ? "الرجاء اختيار ملف أولاً" : "Please select a file first");
            return;
        }

        setIsLoading(true);

        try {
            const data = new FormData();
            data.append('file', selectedFile);
            data.append('fileName', formData.fileName);
            data.append('category', formData.category);
            data.append('description', formData.description);

            const res = await fetch('/api/files', {
                method: 'POST',
                body: data,
            });

            if (res.ok) {
                const resData = await res.json();
                if (resData.error === 'ReadOnlyFileSystem' || resData.success) {
                    const newFile = resData.data;
                    const existingFiles = JSON.parse(localStorage.getItem('afrikyia-files') || '[]');
                    existingFiles.push(newFile);
                    localStorage.setItem('afrikyia-files', JSON.stringify(existingFiles));
                    localStorage.setItem('afrikyia-files-modified', 'true');
                }
                router.push('/admin/files');
            } else {
                throw new Error("Failed to upload file");
            }
        } catch (error) {
            console.error('Error saving file:', error);
            alert(isRTL ? "حدث خطأ أثناء رفع الملف" : "An error occurred while uploading the file");
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b border-white/5 pb-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {t.admin.files.newTitle}
                    </h1>
                    <p className="text-white/60 text-sm mt-1">{t.admin.files.newSub}</p>
                </div>
                <Link 
                    href="/admin/files"
                    className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                >
                    {t.admin.common.back}
                </Link>
            </div>

            {/* Form */}
            <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* File Upload Area */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-white/80">{t.admin.files.chooseFile}</label>
                        <div className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-white/5 ${selectedFile ? 'border-yellow-400 bg-yellow-400/5' : 'border-white/10 hover:border-yellow-400/50'}`}>
                            <input type="file" className="hidden" id="file-upload" onChange={handleFileChange} />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3 w-full h-full">
                                {selectedFile ? (
                                    <>
                                        <span className="text-4xl">📎</span>
                                        <span className="text-yellow-400 font-semibold">{selectedFile.name}</span>
                                        <span className="text-white/50 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                        <span className="text-white/40 text-xs mt-2 underline">{isRTL ? 'تغيير الملف' : 'Change file'}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-4xl">📄</span>
                                        <span className="text-white/60 font-semibold">{t.admin.files.uploadHintTitle}</span>
                                        <span className="text-white/70 text-xs">{t.admin.files.uploadHintSub}</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* File Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">{t.admin.files.fileName}</label>
                        <input 
                            type="text" 
                            name="fileName"
                            value={formData.fileName}
                            onChange={handleChange}
                            placeholder={t.admin.files.fileNamePlaceholder}
                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/80">{t.admin.files.category}</label>
                        <select 
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={`w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                        >
                            <option value="document">{t.admin.files.catDocument}</option>
                            <option value="invoice">{t.admin.files.catInvoice}</option>
                            <option value="design">{t.admin.files.catDesign}</option>
                            <option value="other">{t.admin.files.catOther}</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-white/80">{t.admin.files.description}</label>
                        <textarea 
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder={t.admin.files.descriptionPlaceholder}
                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition-all resize-none ${isRTL ? 'text-right' : 'text-left'}`}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button 
                        type="submit"
                        disabled={isLoading || !selectedFile}
                        className={`bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/20 ${(isLoading || !selectedFile) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? t.admin.files.saving : t.admin.files.saveFile}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
