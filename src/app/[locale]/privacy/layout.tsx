import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  const isRTL = locale === 'ar';
  const title = isRTL ? 'سياسة الخصوصية | AFRIKYia' : locale === 'fr' ? 'Politique de Confidentialité | AFRIKYia' : 'Privacy Policy | AFRIKYia';
  const desc = isRTL ? 'تعرف على كيفية قيامنا في أفريقيا بجمع بياناتك واستخدامها وحمايتها، والتزامنا القوي بالخصوصية عبر جميع منصاتنا الرقمية.' : locale === 'fr' ? "Découvrez comment nous collectons, utilisons et protégeons vos données. Notre engagement envers votre vie privée sur toutes nos plateformes numériques." : "Learn how AFRIKYia collects, uses, and protects your personal data, and our strong commitment to your privacy across our digital platforms.";

  return {
    title: title,
    description: desc,
    openGraph: {
      title: title,
      description: desc,
      url: 'https://www.afrikyia.com/privacy',
    },
    twitter: {
      title: title,
      description: desc,
    },
  };
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
