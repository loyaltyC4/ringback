/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // the old onboarding prototype is retired — /start is the real flow
      { source: "/journey", destination: "/start", permanent: true },
      { source: "/legacy/dashboard", destination: "/dashboard", permanent: true },
    ];
  },
};
export default nextConfig;
