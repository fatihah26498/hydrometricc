/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/monitoring.html',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
