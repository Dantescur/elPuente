<template>
  <div class="min-h-dvh bg-zinc-950 text-zinc-100 font-syne">
    <!-- Sidebar: w-56 on md, w-64 on xl, w-72 on 2xl -->
    <aside class="hidden md:flex fixed inset-y-0 left-0 w-56 xl:w-64 2xl:w-72 flex-col bg-zinc-900 border-r border-zinc-800 z-40">
      <div class="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-800">
        <div class="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span class="text-[17px] font-extrabold tracking-tight">KOI<em class="text-violet-400 not-italic">track</em></span>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems" :key="item.to" :to="item.to"
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-150"
          exact-active-class="!text-violet-400 !bg-violet-500/10" active-class="!text-violet-400 !bg-violet-500/10">
          <component :is="item.icon" class="w-4 h-4 shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Sidebar footer -->
      <div class="px-4 py-4 border-t border-zinc-800 space-y-3">
        <!-- Clock -->
        <div class="space-y-0.5">
          <span class="font-mono text-[11px] text-zinc-600 tracking-widest block">{{ time }}</span>
          <span class="font-mono text-[10px] text-zinc-700 xl:block hidden">{{ fechaCorta }}</span>
        </div>

        <!-- User + logout -->
        <div v-if="loggedIn" class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center shrink-0">
            <span class="text-[10px] font-bold text-violet-400 uppercase">{{ session?.user?.username?.[0] ?? '?' }}</span>
          </div>
          <span class="mono text-[11px] text-zinc-500 flex-1 truncate">{{ session?.user?.username }}</span>
          <button
            class="p-1 text-zinc-600 hover:text-red-400 transition-colors rounded-md hover:bg-zinc-800"
            title="Cerrar sesión"
            @click="logout"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <main class="md:ml-56 xl:ml-64 2xl:ml-72 pb-20 md:pb-0">
      <div class="max-w-screen-2xl">
        <slot />
      </div>
    </main>

    <!-- Mobile bottom nav -->
    <nav class="md:hidden fixed bottom-0 inset-x-0 bg-zinc-900 border-t border-zinc-800 z-50 flex safe-bottom">
      <NuxtLink
        v-for="item in navItems" :key="item.to" :to="item.to"
        class="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-zinc-500 hover:text-zinc-300 transition-colors"
        exact-active-class="!text-violet-400" active-class="!text-violet-400">
        <component :is="item.icon" class="w-5 h-5" />
        <span class="text-[10px] font-medium">{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { barIcon } from '~/components/BarIcon'
import { cartIcon } from '~/components/CartIcon'
import { gridIcon } from '~/components/GridIcon'
import { movimientosIcon } from '~/components/MovimientosIcon'
import { icon } from '~/components/NativeIcon'

const { loggedIn, session, clear } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}

const fechaCorta = ref('')
const time = ref('')

onMounted(() => {
  const tick = () => {
    const now = new Date()
    time.value = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    fechaCorta.value = now.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
  }
  tick()
  const intervalId = setInterval(tick, 30000)
  onUnmounted(() => clearInterval(intervalId))
})

const cubeIcon = icon('M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z')

const navItems = [
  { to: '/', label: 'Inicio', icon: gridIcon },
  { to: '/productos', label: 'Productos', icon: cubeIcon },
  { to: '/ventas', label: 'Vender', icon: cartIcon },
  { to: '/reportes', label: 'Reportes', icon: barIcon },
  { to: '/movimientos', label: 'Movimientos', icon: movimientosIcon },
]
</script>