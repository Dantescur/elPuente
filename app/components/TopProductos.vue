<template>
  <div>
    <div
v-for="(p, i) in productos" :key="p.id"
      class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors">
      <span class="mono text-xs text-zinc-600 w-4 text-center shrink-0">{{ i + 1 }}</span>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">{{ p.nombre }}</p>
        <p class="mono text-[11px] text-zinc-500">{{ p.total_vendido }} uds · {{ fmt(p.ingresos) }}</p>
      </div>
      <span class="mono text-sm text-emerald-400 shrink-0">+{{ fmt(p.ganancia_total) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  productos: Array<any>
}>()
const fmt = (n: any) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CUP', maximumFractionDigits: 0 }).format(Number(n) || 0)
</script>
