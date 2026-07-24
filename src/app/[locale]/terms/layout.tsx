import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: `Legal Terms | ${t('title').split('|')[0]}`,
    description: "Review the Legal Terms of AFRIKYia. By accessing and using afrikyia.com, you agree to be bound by these terms and conditions.",
  };
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
