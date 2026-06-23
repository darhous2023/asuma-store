const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://asuma-backend-production.up.railway.app"

// Supabase storage hostname (for CSP img-src)
const SUPABASE_HOST = "atmbrocqpjzemfpazzax.supabase.co"

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer: send only origin on cross-origin requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable potentially dangerous browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // HSTS: enforce HTTPS for 1 year, include subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Content-Security-Policy
  // 'unsafe-inline' kept for Next.js inline styles/scripts; tighten after audit
  {
    key: "Content-Security-Policy",
    value: [
      `default-src 'self'`,
      // Scripts: self + inline (Next.js requires) + Railway/Vercel analytics
      `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
      // Styles: self + inline (Tailwind/CSS-in-JS)
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      // Fonts
      `font-src 'self' https://fonts.gstatic.com`,
      // Images: self + data URIs + Supabase + backend
      `img-src 'self' data: blob: https://${SUPABASE_HOST} ${BACKEND_URL}`,
      // Connections: self + Medusa backend
      `connect-src 'self' ${BACKEND_URL}`,
      // Frames: deny all
      `frame-src 'none'`,
      // Objects: deny all
      `object-src 'none'`,
      // Base URI: self only
      `base-uri 'self'`,
      // Form actions: self only
      `form-action 'self'`,
    ].join("; "),
  },
]

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable source maps in production to prevent source leakage
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: SUPABASE_HOST,
        pathname: "/storage/v1/object/public/**",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
