/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // /dashboard is now a real Next route (see app/dashboard/*). The old
      // static prototype is still browsable under /legacy for reference.
      { source: "/legacy/dashboard", destination: "/legacy/dashboard/index.html" },
      { source: "/journey", destination: "/legacy/journey/index.html" },
    ];
  },
};
export default nextConfig;
