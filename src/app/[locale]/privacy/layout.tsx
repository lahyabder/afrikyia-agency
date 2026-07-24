import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: `Privacy Policy | ${t('title').split('|')[0]}`,
    description: "Read the Privacy Policy of AFRIKYia. We are committed to protecting your personal information and your right to privacy while using our platform.",
  };
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
