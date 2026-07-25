import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  const isRTL = locale === 'ar';
  const title = isRTL ? 'الشروط القانونية | AFRIKYia' : locale === 'fr' ? 'Conditions Générales | AFRIKYia' : 'Legal Terms | AFRIKYia';
  const desc = isRTL ? 'اقرأ الشروط والأحكام القانونية التي تحكم استخدامك لمنصات وخدمات أفريقيا الرقمية لضمان تجربة آمنة وشفافة للجميع.' : locale === 'fr' ? "Lisez les conditions générales d'utilisation régissant nos plateformes et services numériques pour garantir une expérience transparente." : "Read the legal terms and conditions governing your use of AFRIKYia's digital platforms and services to ensure a transparent experience.";

  return {
    title: title,
    description: desc,
    openGraph: {
      title: title,
      description: desc,
      url: 'https://www.afrikyia.com/terms',
    },
    twitter: {
      title: title,
      description: desc,
    },
  };
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
