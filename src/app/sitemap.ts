import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import achievementsData from '@/data/achievements.json';

const BASE_URL = 'https://www.afrikyia.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapUrls: MetadataRoute.Sitemap = [];
  
  // Base routes for each locale
  const routes = ['', '/privacy', '/terms'];
  
  routes.forEach((route) => {
    routing.locales.forEach((locale) => {
      sitemapUrls.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : 0.8,
        alternates: {
          languages: routing.locales.reduce((acc, l) => {
            acc[l] = `${BASE_URL}/${l}${route}`;
            return acc;
          }, {} as Record<string, string>),
        },
      });
    });
  });

  // Dynamic routes for achievements/works
  achievementsData.forEach((work: any) => {
    routing.locales.forEach((locale) => {
      sitemapUrls.push({
        url: `${BASE_URL}/${locale}/works/${work.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: routing.locales.reduce((acc, l) => {
            acc[l] = `${BASE_URL}/${l}/works/${work.id}`;
            return acc;
          }, {} as Record<string, string>),
        },
      });
    });
  });

  return sitemapUrls;
}
