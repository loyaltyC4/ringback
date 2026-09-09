/** @type {import('next').NextConfig} */
const nextConfig = {
  // The legacy operator prototypes are still served as static HTML out of /public.
  async rewrites() {
    return [
      { source: "/dashboard", destination: "/legacy/dashboard/index.html" },
      { source: "/journey", destination: "/legacy/journey/index.html" },
    ];
  },
};
export default nextConfig;
