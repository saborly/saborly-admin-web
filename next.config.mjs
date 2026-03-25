/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Image optimization ──────────────────────────────────────────────────────
  images: {
    // Allow images from these remote origins to be optimised by next/image
    remotePatterns: [
      { protocol: 'https', hostname: 'api.saborly.es' },
      // Keep Vercel hostname only as fallback during transition
      { protocol: 'https', hostname: 'soleybackend.vercel.app' },
      { protocol: 'http',  hostname: 'localhost' },
      // Blob/CDN origins if you use Vercel Blob
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
    // Serve WebP/AVIF automatically when the browser supports it
    formats: ['image/avif', 'image/webp'],
    // Cache optimised images for up to 60 s in dev, 1 day in prod
    minimumCacheTTL: 86400,
  },

  // ── HTTP response headers ───────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Static assets (JS, CSS, fonts, images under /_next/static)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // Immutable — these files are content-hashed so safe to cache forever
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Public folder assets (favicon, logo, etc.)
        source: '/(.*)\\.(png|jpg|jpeg|webp|avif|svg|ico|woff2|woff)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },

  // ── Bundle optimisation ─────────────────────────────────────────────────────
  // Enables SWC minifier (on by default in Next 13+, explicit here for clarity)
  swcMinify: true,

  // Compress HTML/JSON responses with gzip
  compress: true,

  // ── Experimental: React compiler / partial pre-rendering ───────────────────
  experimental: {
    // Optimise how packages are imported so unused exports are tree-shaken
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
