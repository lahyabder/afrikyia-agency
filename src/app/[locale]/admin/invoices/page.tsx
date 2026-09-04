"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Trash2, Download, FileSpreadsheet, FileText, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Invoice = {
    id: string;
    ref: string;
    clientName: string;
    clientAddress: string;
    date: string;
    netAmount: number;
    vatAmount: number;
    totalAmount: number;
    status: 'paid' | 'unpaid' | 'overdue';
    description: string;
};

export default function InvoicesPage() {
    const { t, isRTL } = useLanguage();
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        const load = () => {
            try {
                const data = localStorage.getItem('afrikyia-invoices');
                if (data) {
                    setInvoices(JSON.parse(data));
                }
            } catch(e) {}
        };
        load();
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
            const updated = invoices.filter(i => i.id !== id);
            setInvoices(updated);
            localStorage.setItem('afrikyia-invoices', JSON.stringify(updated));
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'paid': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[11px] font-bold">مدفوعة</span>;
            case 'unpaid': return <span className="bg-white/5 text-white/70 border border-white/10 px-2.5 py-1 rounded-md text-[11px] font-bold">غير مدفوعة</span>;
            case 'overdue': return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-md text-[11px] font-bold">متأخرة</span>;
            default: return null;
        }
    };

    const exportToExcel = () => {
        const data = invoices.map(inv => ({
            'رقم الفاتورة': inv.ref,
            'التاريخ': inv.date,
            'اسم العميل': inv.clientName,
            'العنوان': inv.clientAddress || '',
            'طبيعة الخدمة': inv.description || '',
            'المبلغ الصافي': inv.netAmount || 0,
            'الضريبة': inv.vatAmount || 0,
            'الإجمالي': inv.totalAmount || 0,
            'الحالة': inv.status === 'paid' ? 'مدفوعة' : inv.status === 'unpaid' ? 'غير مدفوعة' : 'متأخرة السداد'
        }));
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "الفواتير");
        XLSX.writeFile(wb, "invoices_report.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF('landscape');
        
        // Use english headers to avoid Arabic rendering issues in default jsPDF fonts
        const tableColumn = ["Total", "VAT", "Net Amount", "Service", "Client Name", "Date", "Ref"];
        const tableRows: any[] = [];

        invoices.forEach(inv => {
            const invData = [
                inv.totalAmount || 0,
                inv.vatAmount || 0,
                inv.netAmount || 0,
                inv.description || '-',
                inv.clientName || '-',
                inv.date || '-',
                inv.ref || '-'
            ];
            tableRows.push(invData);
        });

        // Add a title
        doc.setFontSize(14);
        doc.text("Invoices Report", 14, 22);
        
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [20, 20, 20] }
        });

        doc.save('invoices_report.pdf');
    };

    return (
        <div className="space-y-6 animate-fade-in text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 gap-4 ${isRTL ? 'md:flex-row' : 'md:flex-row'}`}>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {t.admin.invoices.title || 'النظام المحاسبي (الفواتير)'}
                    </h1>
                    <p className="text-white/60 text-sm mt-1">سجل فواتير العملاء والضرائب المستحقة</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={exportToExcel}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all flex-1 md:flex-none"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Excel
                    </button>
                    <button 
                        onClick={exportToPDF}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all flex-1 md:flex-none"
                    >
                        <FileText className="w-4 h-4" /> PDF
                    </button>
                    <Link 
                        href="/admin/invoices/new"
                        className="bg-brand-red hover:bg-brand-red/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-red/20 flex-1 md:flex-none"
                    >
                        <Plus className="w-4 h-4" /> إضافة فاتورة
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-white/70">
                        <thead className="text-xs text-white/50 uppercase bg-black/40 border-b border-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">رقم الفاتورة</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">التاريخ</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">العميل</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">طبيعة الخدمة</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">المبلغ الصافي</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-amber-400">الضريبة (16%)</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-emerald-400">الإجمالي</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-center">الحالة</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-white/50 bg-[#1a1a1a]">
                                        لا توجد فواتير مسجلة بعد.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice, i) => (
                                    <motion.tr 
                                        key={invoice.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b border-white/5 bg-[#1a1a1a] hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{invoice.ref}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-white/60">{invoice.date}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white truncate max-w-[150px]">{invoice.clientName}</div>
                                            {invoice.clientAddress && <div className="text-xs text-white/40 truncate max-w-[150px] mt-0.5">{invoice.clientAddress}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white/70 line-clamp-2 max-w-[200px] text-xs leading-relaxed">{invoice.description || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono">{invoice.netAmount?.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono text-amber-400/80">{invoice.vatAmount?.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono text-emerald-400 font-bold">{invoice.totalAmount?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(invoice.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <button 
                                                    onClick={() => handleDelete(invoice.id)} 
                                                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                    title="حذف الفاتورة"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
