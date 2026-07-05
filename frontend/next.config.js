/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Clickjacking: the site never needs to be framed.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // MIME sniffing off.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to shelter sites when users click through.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // We use no sensors/camera/mic — lock them down.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Cat images are hosted on arbitrary shelter domains; allow any https host.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
