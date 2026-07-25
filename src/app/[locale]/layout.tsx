import { Geist, Geist_Mono, Almarai } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { headers } from 'next/headers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["arabic"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    metadataBase: new URL('https://www.afrikyia.com'),
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://www.afrikyia.com',
      siteName: 'AFRIKYia',
      images: [
        {
          url: '/logo.png',
          width: 1200,
          height: 630,
        },
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/logo.png'],
    },
  };
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  const t = await getTranslations({ locale, namespace: 'metadata' });

  const headersList = await headers();
  const fullPathname = headersList.get('x-pathname') || '';
  let pathWithoutLocale = fullPathname;
  routing.locales.forEach((l) => {
    if (pathWithoutLocale === `/${l}` || pathWithoutLocale.startsWith(`/${l}/`)) {
      pathWithoutLocale = pathWithoutLocale.substring(l.length + 1);
    }
  });
  if (!pathWithoutLocale.startsWith('/')) {
    pathWithoutLocale = '/' + pathWithoutLocale;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AFRIKYia',
    url: 'https://www.afrikyia.com',
    logo: 'https://www.afrikyia.com/logo.png',
    description: t('description'),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+222 24232202',
      email: 'contact@afrikyia.com',
      contactType: 'customer service'
    }
  };

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="no-js">
      <head>
        {routing.locales.map((l) => (
          <link
            key={l}
            rel="alternate"
            hrefLang={l}
            href={`https://www.afrikyia.com/${l}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`https://www.afrikyia.com/en${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.classList.remove('no-js');
              window.addEventListener('load', function() {
                setTimeout(function() {
                  document.documentElement.classList.add('motion-fallback');
                }, 3500);
              });
            `
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${almarai.variable} antialiased ${locale === 'ar' ? 'arabic-font' : ''}`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
