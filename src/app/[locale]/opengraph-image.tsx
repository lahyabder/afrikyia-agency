import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

export const runtime = 'edge';

export const alt = 'AFRIKYia - Digital Culture Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const title = t('title');
  const desc = t('description');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 50% -20%, #eb2f36 0%, #0a0a0a 60%)',
          padding: '40px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '32px',
            padding: '60px',
            width: '100%',
            height: '100%',
            textAlign: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              backgroundColor: '#eb2f36',
              borderRadius: '24px',
              marginBottom: '20px',
              fontSize: '60px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            A
          </div>
          
          <h1
            style={{
              fontSize: '64px',
              fontWeight: '900',
              color: 'white',
              lineHeight: 1.2,
              margin: 0,
              textShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </h1>
          
          <p
            style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.4,
              margin: 0,
              maxWidth: '800px',
            }}
          >
            {desc}
          </p>
          
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 'auto',
              gap: '16px',
            }}
          >
            <div style={{ color: '#eb2f36', fontSize: '24px', fontWeight: 'bold' }}>AFRIKYIA.COM</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
