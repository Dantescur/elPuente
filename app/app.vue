<template>
  <div class="min-h-dvh bg-zinc-950 text-zinc-100 font-syne">

    <!-- Desktop sidebar -->
    <aside class="hidden md:flex fixed inset-y-0 left-0 w-56 flex-col bg-zinc-900 border-r border-zinc-800 z-40">
      <div class="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-800">
        <div class="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span class="text-[17px] font-extrabold tracking-tight">HUB<em
            class="text-violet-400 not-italic">store</em></span>
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

      <div class="px-5 py-4 border-t border-zinc-800">
        <span class="font-mono text-[11px] text-zinc-600 tracking-widest">{{ time }}</span>
      </div>
    </aside>

    <!-- Page content -->
    <main class="md:ml-56 pb-20 md:pb-0">
      <NuxtPage />
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
import { defineComponent, h } from 'vue'

const time = ref('')
onMounted(() => {
  const tick = () => time.value = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  tick(); setInterval(tick, 30000)
})

const icon = (paths: string) => defineComponent({
  render: () => h('svg', { width: '100%', height: '100%', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    paths.split('|').map(d => h('path', { d })))
})

const gridIcon = defineComponent({
  render: () => h('svg', { width: '100%', height: '100%', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '3', width: '7', height: '7' }),
    h('rect', { x: '14', y: '3', width: '7', height: '7' }),
    h('rect', { x: '14', y: '14', width: '7', height: '7' }),
    h('rect', { x: '3', y: '14', width: '7', height: '7' }),
  ])
})

const cartIcon = defineComponent({
  render: () => h('svg', { width: '100%', height: '100%', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '9', cy: '21', r: '1' }),
    h('circle', { cx: '20', cy: '21', r: '1' }),
    h('path', { d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' }),
  ])
})

const barIcon = defineComponent({
  render: () => h('svg', { width: '100%', height: '100%', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('line', { x1: '18', y1: '20', x2: '18', y2: '10' }),
    h('line', { x1: '12', y1: '20', x2: '12', y2: '4' }),
    h('line', { x1: '6', y1: '20', x2: '6', y2: '14' }),
  ])
})

const cubeIcon = icon('M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z')

const navItems = [
  { to: '/', label: 'Inicio', icon: gridIcon },
  { to: '/productos', label: 'Productos', icon: cubeIcon },
  { to: '/ventas', label: 'Vender', icon: cartIcon },
  { to: '/reportes', label: 'Reportes', icon: barIcon },
]
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: 'Syne', sans-serif;
}

.font-mono,
.mono {
  font-family: 'DM Mono', monospace !important;
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 2px;
}
</style>
