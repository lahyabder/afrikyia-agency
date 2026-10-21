import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  
  const isRTL = locale === 'ar';
  const title = isRTL 
    ? 'مركز الأمان والثقة الرقمية | AFRIKYIA' 
    : locale === 'fr' 
      ? 'Centre de Sécurité & Confiance | AFRIKYIA' 
      : 'Security & Trust Center | AFRIKYIA';
      
  const desc = isRTL 
    ? 'تعرف على معايير الأمان المطبقة في منصة أفريقيا: حماية المدفوعات البنكية الموريتانية، تشفير البيانات، ومطابقة معايير OWASP.' 
    : locale === 'fr' 
      ? "Découvrez l'architecture de sécurité d'AFRIKYIA : sécurisation des paiements mobiles mauritaniens, chiffrement de bout en bout et conformité OWASP." 
      : "Discover AFRIKYIA's security architecture: hardened Mauritanian payment gateways, zero-trust verification, and OWASP compliance.";

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: 'https://www.afrikyia.com/security',
    },
    twitter: {
      title,
      description: desc,
    },
  };
}

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
