"use client";

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPage() {
    const { isRTL } = useLanguage();

    const content = {
        en: {
            title: "Privacy Policy",
            updated: "Last updated: February 2026",
            sections: [
                { heading: "1. Introduction", body: "Welcome to Afrikyia. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you visit afrikyia.com." },
                { heading: "2. Information We Collect", body: "We may collect information you provide directly, such as your name and email address when you contact us. We also automatically collect certain technical information, such as your IP address, browser type, and pages visited, through cookies and analytics tools." },
                { heading: "3. How We Use Your Information", body: "We use the information we collect to respond to your inquiries, improve our services, analyze usage trends, and ensure the security of our platform. We do not sell your personal data to third parties." },
                { heading: "4. Cookies", body: "Our website uses cookies to improve your browsing experience. You may choose to disable cookies in your browser settings, though this may affect certain features of the platform." },
                { heading: "5. Third-Party Services", body: "We may use third-party tools (such as analytics providers) to help us understand how our site is used. These services have their own privacy policies and may collect information as described therein." },
                { heading: "6. Data Security", body: "We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction." },
                { heading: "7. Your Rights", body: "You have the right to access, correct, or request deletion of any personal data we hold about you. To exercise these rights, please contact us at contact@afrikyia.com." },
                { heading: "8. Changes to This Policy", body: "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated revision date." },
                { heading: "9. Contact Us", body: "If you have any questions about this Privacy Policy, please contact us at: contact@afrikyia.com" }
            ]
        },
        fr: {
            title: "Politique de Confidentialité",
            updated: "Dernière mise à jour : Février 2026",
            sections: [
                { heading: "1. Introduction", body: "Bienvenue sur Afrikyia. Nous nous engageons à protéger vos informations personnelles et votre droit à la vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos données lorsque vous visitez afrikyia.com." },
                { heading: "2. Informations Collectées", body: "Nous collectons les informations que vous fournissez directement (nom, email) et des données techniques automatiques (adresse IP, type de navigateur) via des cookies et des outils d'analyse." },
                { heading: "3. Utilisation des Données", body: "Nous utilisons vos informations pour répondre à vos demandes, améliorer nos services, et assurer la sécurité de la plateforme. Nous ne vendons pas vos données à des tiers." },
                { heading: "4. Cookies", body: "Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez les désactiver dans les paramètres de votre navigateur." },
                { heading: "5. Services Tiers", body: "Nous utilisons des outils tiers d'analyse. Ces services disposent de leurs propres politiques de confidentialité." },
                { heading: "6. Sécurité", body: "Nous appliquons des mesures techniques appropriées pour protéger vos données contre tout accès non autorisé." },
                { heading: "7. Vos Droits", body: "Vous avez le droit d'accéder, de corriger ou de demander la suppression de vos données. Contactez-nous à contact@afrikyia.com." },
                { heading: "8. Modifications", body: "Nous pouvons mettre à jour cette politique. Tout changement sera affiché sur cette page avec une nouvelle date." },
                { heading: "9. Contact", body: "Pour toute question : contact@afrikyia.com" }
            ]
        },
        ar: {
            title: "سياسة الخصوصية",
            updated: "آخر تحديث: فبراير 2026",
            sections: [
                { heading: "١. مقدمة", body: "مرحبًا بك في Afrikyia. نحن ملتزمون بحماية معلوماتك الشخصية وحقك في الخصوصية. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها عند زيارتك لموقع afrikyia.com." },
                { heading: "٢. المعلومات التي نجمعها", body: "قد نجمع المعلومات التي تقدمها مباشرةً كاسمك وبريدك الإلكتروني عند التواصل معنا، إضافةً إلى بيانات تقنية تلقائية كعنوان IP ونوع المتصفح عبر ملفات تعريف الارتباط وأدوات التحليل." },
                { heading: "٣. كيفية استخدام المعلومات", body: "نستخدم المعلومات المجمعة للرد على استفساراتك، وتحسين خدماتنا، وتحليل اتجاهات الاستخدام، وضمان أمن المنصة. لا نبيع بياناتك الشخصية لأطراف ثالثة." },
                { heading: "٤. ملفات تعريف الارتباط", body: "يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربة التصفح. يمكنك تعطيلها من إعدادات متصفحك، وإن كان ذلك قد يؤثر على بعض ميزات المنصة." },
                { heading: "٥. خدمات الطرف الثالث", body: "قد نستخدم أدوات تحليل من أطراف ثالثة. تخضع هذه الخدمات لسياسات الخصوصية الخاصة بها." },
                { heading: "٦. أمن البيانات", body: "نطبق إجراءات تقنية ومؤسسية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف." },
                { heading: "٧. حقوقك", body: "يحق لك الوصول إلى بياناتك الشخصية أو تصحيحها أو طلب حذفها. للمطالبة بهذه الحقوق، تواصل معنا على: contact@afrikyia.com" },
                { heading: "٨. التعديلات", body: "قد نحدث هذه السياسة بين الحين والآخر. سنخطرك بأي تغييرات جوهرية عبر نشر السياسة الجديدة على هذه الصفحة." },
                { heading: "٩. تواصل معنا", body: "لأي استفسارات حول سياسة الخصوصية: contact@afrikyia.com" }
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
