// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  hub: {
    db: 'sqlite'
  },
  nitro: {
    experimental: {
      tasks: true
    },
    compressPublicAssets: true,
    minify: true,
  },
  runtimeConfig: {
    session: {
      password: 'QOkue9uTIVUsqXsw1VK8N3VLjJivUwW3Q7h2zDiXBOo=',
    },
  },
  app: {
    head: {
      title: 'KOItrack',
      titleTemplate: '%s · KOItrack',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Sistema de inventario y ventas KOItrack' },
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'theme-color', content: '#09090b' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'KOItrack' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ]
    }
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxthub/core',
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    'nuxt-auth-utils'
  ],
  sourcemap: false,
  routeRules: {
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/.env*': { redirect: '/' }
  }
})
