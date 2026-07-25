import xml.etree.ElementTree as ET
from datetime import datetime

locales = ['ar', 'en', 'fr']
base_paths = [
    '',
    '/privacy',
    '/terms',
    '/works/nagha-festival',
    '/works/maatamoulana',
    '/works/dar-mauritanie',
    '/works/cinemasa',
    '/works/pan-mauritania',
    '/works/accespan',
    '/works/cultural-map',
    '/works/bankily-ledger'
]

urlset = ET.Element('urlset', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
today = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')

for locale in locales:
    for path in base_paths:
        url = ET.SubElement(urlset, 'url')
        loc = ET.SubElement(url, 'loc')
        loc.text = f'https://www.afrikyia.com/{locale}{path}'
        
        lastmod = ET.SubElement(url, 'lastmod')
        lastmod.text = today
        
        changefreq = ET.SubElement(url, 'changefreq')
        changefreq.text = 'monthly'
        
        priority = ET.SubElement(url, 'priority')
        if path == '':
            priority.text = '1.0'
            changefreq.text = 'yearly'
        elif path in ['/privacy', '/terms']:
            priority.text = '0.8'
        else:
            priority.text = '0.7'

# Prettify the XML
from xml.dom import minidom
xmlstr = minidom.parseString(ET.tostring(urlset)).toprettyxml(indent="  ")

with open('public/sitemap.xml', 'w') as f:
    f.write(xmlstr)

print("Sitemap generated successfully.")
