import fs from 'fs';
import path from 'path';

const achievementsPath = path.join(process.cwd(), 'src', 'data', 'achievements.json');
const achievements = JSON.parse(fs.readFileSync(achievementsPath, 'utf8'));

const baseUrl = 'https://www.afrikyia.com';
const today = new Date().toISOString();

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

const staticRoutes = [
    { url: '/', priority: '1.0', changefreq: 'yearly' },
    { url: '/privacy', priority: '0.8', changefreq: 'monthly' },
    { url: '/terms', priority: '0.8', changefreq: 'monthly' }
];

for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${route.url === '/' ? '' : route.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
}

for (const item of achievements) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/works/${item.id}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
}

xml += `</urlset>`;

fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), xml);
console.log('Static sitemap generated at public/sitemap.xml');
