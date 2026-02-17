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
    }
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxthub/core',
    '@nuxtjs/tailwindcss'
  ]
})