import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { SECURITY_HEADERS } from './src/lib/securityHeaders';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
