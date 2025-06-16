/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Habilitar el worker de webpack para mejor performance
    webpackBuildWorker: true,
  },
  // Remover webpack config innecesaria
  // Los fallbacks no son necesarios para tu aplicación
}

module.exports = nextConfig
