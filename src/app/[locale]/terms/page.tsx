"use client";

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function TermsPage() {
    const { isRTL } = useLanguage();

    const content = {
        en: {
            title: "Legal Terms",
            updated: "Last updated: February 2026",
            sections: [
                { heading: "1. Acceptance of Terms", body: "By accessing and using afrikyia.com, you agree to be bound by these Legal Terms and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site." },
                { heading: "2. Use of the Site", body: "You may use this site for lawful purposes only. You agree not to use the site in any way that violates applicable laws, infringes on the rights of others, or could damage or impair the operation of the site." },
                { heading: "3. Intellectual Property", body: "All content on this site, including but not limited to text, graphics, logos, images, audio clips, and software, is the property of Afrikyia and is protected by applicable intellectual property laws. Unauthorized use is strictly prohibited." },
                { heading: "4. Limitation of Liability", body: "Afrikyia shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the site or its content." },
                { heading: "5. Third-Party Links", body: "Our site may contain links to third-party websites. Afrikyia is not responsible for the content or privacy practices of those sites." },
                { heading: "6. Modifications", body: "Afrikyia reserves the right to modify these terms at any time. Your continued use of the site following any changes constitutes your acceptance of the new terms." },
                { heading: "7. Governing Law", body: "These terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through appropriate legal channels." },
                { heading: "8. Contact", body: "For any legal inquiries, please contact us at: contact@afrikyia.com" }
            ]
        },
        fr: {
            title: "Mentions Légales",
            updated: "Dernière mise à jour : Février 2026",
            sections: [
                { heading: "1. Acceptation des Conditions", body: "En accédant à afrikyia.com, vous acceptez d'être lié par ces mentions légales. Si vous n'acceptez pas ces conditions, vous êtes interdit d'utiliser ce site." },
                { heading: "2. Utilisation du Site", body: "Vous ne pouvez utiliser ce site qu'à des fins légales, sans violer les droits d'autrui ni nuire au fonctionnement de la plateforme." },
                { heading: "3. Propriété Intellectuelle", body: "Tout le contenu du site (textes, graphismes, logos, images) est la propriété d'Afrikyia et est protégé par les lois applicables. Toute utilisation non autorisée est strictement interdite." },
                { heading: "4. Limitation de Responsabilité", body: "Afrikyia ne saurait être tenu responsable de dommages indirects ou cons cutifs résultant de l'utilisation du site." },
                { heading: "5. Liens Tiers", body: "Notre site peut contenir des liens vers des sites tiers. Afrikyia n'est pas responsable de leur contenu." },
                { heading: "6. Modifications", body: "Afrikyia se réserve le droit de modifier ces conditions à tout moment. Votre utilisation continue du site vaut acceptation des nouvelles conditions." },
                { heading: "7. Loi Applicable", body: "Ces conditions sont régies par les lois applicables. Tout litige sera résolu par les voies légales appropriées." },
                { heading: "8. Contact", body: "Pour toute question juridique : contact@afrikyia.com" }
            ]
        },
        ar: {
            title: "الشروط القانونية",
            updated: "آخر تحديث: فبراير 2026",
            sections: [
                { heading: "١. قبول الشروط", body: "باستخدامك لموقع afrikyia.com، فإنك توافق على الالتزام بهذه الشروط القانونية وجميع القوانين واللوائح المعمول بها. إذا لم توافق على أي من هذه الشروط، يُحظر عليك استخدام هذا الموقع." },
                { heading: "٢. استخدام الموقع", body: "يُسمح لك باستخدام هذا الموقع للأغراض القانونية فحسب. توافق على عدم استخدامه بأي طريقة تنتهك القوانين المعمول بها أو تنتهك حقوق الآخرين أو تضر بتشغيل الموقع." },
                { heading: "٣. حقوق الملكية الفكرية", body: "جميع محتويات الموقع، بما فيها النصوص والرسومات والشعارات والصور والبرمجيات، هي ملك لشركة Afrikyia وتحميها قوانين الملكية الفكرية المعمول بها. يُحظر الاستخدام غير المصرح به تمامًا." },
                { heading: "٤. تحديد المسؤولية", body: "لن تكون Afrikyia مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية ناجمة عن استخدامك للموقع أو عدم قدرتك على استخدامه." },
                { heading: "٥. روابط الأطراف الثالثة", body: "قد يحتوي موقعنا على روابط لمواقع تابعة لأطراف ثالثة. لا تتحمل Afrikyia أي مسؤولية عن محتوى تلك المواقع أو ممارساتها." },
                { heading: "٦. التعديلات", body: "تحتفظ Afrikyia بحق تعديل هذه الشروط في أي وقت. استمرارك في استخدام الموقع بعد أي تعديل يُعدّ قبولًا منك للشروط الجديدة." },
                { heading: "٧. القانون المعمول به", body: "تخضع هذه الشروط للقوانين المعمول بها، ويُحل أي نزاع من خلال القنوات القانونية المختصة." },
                { heading: "٨. تواصل معنا", body: "لأي استفسارات قانونية: contact@afrikyia.com" }
            ]
        }
    };

    const lang = isRTL ? 'ar' : (typeof window !== 'undefined' && document.documentElement.lang === 'fr') ? 'fr' : 'en';
    const c = content[lang as keyof typeof content] || content.ar;

    return (
        <div className={`min-h-screen bg-black text-white ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-6 py-24 max-w-4xl">
                <Link href="/" className="inline-flex items-center gap-2 text-brand-red text-sm uppercase tracking-widest mb-16 hover:opacity-80 transition-opacity">
                    ← {isRTL ? 'العودة' : 'Back'}
                </Link>

                <h1 className="text-4xl md:text-6xl font-bold mb-4">{c.title}</h1>
                <p className="text-white/60 text-sm mb-16 uppercase tracking-widest">{c.updated}</p>

                <div className="space-y-12">
                    {c.sections.map((section, i) => (
                        <div key={i}>
                            <h2 className="text-brand-red text-lg font-bold mb-3 uppercase tracking-wider">{section.heading}</h2>
                            <p className="text-white/70 leading-relaxed">{section.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
