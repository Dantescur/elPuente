<template>
  <div class="min-h-dvh bg-zinc-950 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">

      <!-- Logo -->
      <div class="flex items-center gap-3 mb-8 justify-center">
        <div class="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span class="text-2xl font-extrabold tracking-tight">KOI<em class="text-violet-400 not-italic">track</em></span>
      </div>

      <!-- Card -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div>
          <h1 class="text-lg font-bold">Iniciar sesión</h1>
          <p class="text-xs text-zinc-500 mt-0.5">Accede a tu panel de inventario</p>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Usuario
            </label>
            <input v-model="form.username" type="text" autocomplete="username" placeholder="usuario"
              class="w-full px-3 py-2.5 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              :class="error ? 'border-red-500/60' : ''" @keydown.enter="login">
          </div>

          <div>
            <label class="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Contraseña
            </label>
            <div class="relative">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password"
                placeholder="••••••••"
                class="w-full px-3 py-2.5 pr-10 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                :class="error ? 'border-red-500/60' : ''" @keydown.enter="login">
              <button type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                @click="showPassword = !showPassword">
                <!-- Eye / Eye-off -->
                <svg v-if="!showPassword" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Error -->
        <Transition name="err">
          <div v-if="error"
            class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ error }}
          </div>
        </Transition>

        <button :disabled="cargando || !form.username || !form.password"
          class="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="login">
          <span v-if="cargando" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {{ cargando ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>

      <p class="text-center text-[11px] text-zinc-700 mt-5 mono">KOItrack · Sistema de inventario</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'empty' })

useSeoMeta({ title: 'Iniciar sesión' })

const { fetch: refreshSession } = useUserSession()

const form = ref({ username: '', password: '' })
const showPassword = ref(false)
const cargando = ref(false)
const error = ref('')

async function login() {
  if (!form.value.username || !form.value.password) return
  cargando.value = true
  error.value = ''

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: form.value
    })
    // Refresh the client-side session state before navigating
    await refreshSession()
    await navigateTo('/')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    error.value = e?.data?.message || 'Error al iniciar sesión'
    form.value.password = '' // Clear password on failure
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.err-enter-active,
.err-leave-active {
  transition: all 0.2s ease;
}

.err-enter-from,
.err-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
