<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: {
    type: Object as () => NuxtError,
    default: null,
  },
})

const is404 = computed(() => props.error?.statusCode === 404)

const title = computed(() => is404.value ? 'Página no encontrada' : 'Algo salió mal')
const description = computed(() =>
  is404.value
    ? 'La página que buscas no existe o fue movida.'
    : props.error?.message || 'Ocurrió un error inesperado. Intenta de nuevo.'
)

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-dvh bg-zinc-950 text-zinc-100 font-syne flex items-center justify-center p-4">
    <div class="w-full max-w-sm text-center">

      <!-- Logo -->
      <div class="flex items-center gap-2.5 justify-center mb-10">
        <div class="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span class="text-[17px] font-extrabold tracking-tight">KOI<em class="text-violet-400 not-italic">track</em></span>
      </div>

      <!-- Error code -->
      <p class="mono text-7xl font-bold text-zinc-800 leading-none mb-4 select-none">
        {{ error?.status ?? '?' }}
      </p>

      <!-- Message -->
      <h1 class="text-xl font-extrabold tracking-tight mb-2">{{ title }}</h1>
      <p class="text-sm text-zinc-500 mb-8 leading-relaxed">{{ description }}</p>

      <!-- Actions -->
      <div class="flex flex-col gap-2">
        <button
          class="w-full py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors"
          @click="handleError"
        >
          Ir al inicio
        </button>
        <button
          class="w-full py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors"
          @click="$router.back()"
        >
          Volver atrás
        </button>
      </div>

      <!-- Dev detail -->
      <details v-if="error?.stack" class="mt-8 text-left">
        <summary class="mono text-[10px] text-zinc-700 cursor-pointer hover:text-zinc-500 transition-colors select-none">
          Detalles del error
        </summary>
        <pre class="mt-2 p-3 text-[10px] text-red-400/70 bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto leading-relaxed">{{ error.stack }}</pre>
      </details>
    </div>
  </div>
</template>