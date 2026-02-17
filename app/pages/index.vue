<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-6xl">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">Dashboard</h1>
        <p class="text-xs font-mono text-zinc-500 mt-1">{{ fechaHoy }}</p>
      </div>
      <button
:disabled="cargando" class="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-all disabled:opacity-50"
        @click="cargar">
        <svg v-if="!cargando" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        <span v-else class="w-3.5 h-3.5 border-2 border-zinc-600 border-t-violet-500 rounded-full animate-spin inline-block"/>
        <span class="hidden sm:inline">Actualizar</span>
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="cargando && !data" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <div v-for="i in 4" :key="i" class="h-28 rounded-xl bg-zinc-900 animate-pulse" />
    </div>

    <template v-else-if="data">
      <!-- KPI grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div class="kpi-card">
          <p class="kpi-label">Ventas hoy</p>
          <p class="kpi-value mono">{{ data.ventas_hoy.total_ventas }}</p>
          <p class="kpi-sub">transacciones</p>
        </div>
        <div class="kpi-card kpi-card--accent">
          <p class="kpi-label">Ingresos hoy</p>
          <p class="kpi-value mono">{{ fmt(data.ventas_hoy.ingresos) }}</p>
          <p class="kpi-sub mono">{{ fmt(data.ventas_hoy.ganancias) }} ganancia</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-label">Ingresos del mes</p>
          <p class="kpi-value mono">{{ fmt(data.ventas_mes.total) }}</p>
          <p class="kpi-sub mono">{{ fmt(data.ventas_mes.ganancias) }} ganancia</p>
        </div>
        <div class="kpi-card" :class="data.stock_bajo.length > 0 ? 'kpi-card--warn' : ''">
          <p class="kpi-label">Stock bajo</p>
          <p class="kpi-value mono">{{ data.stock_bajo.length }}</p>
          <p class="kpi-sub">productos críticos</p>
        </div>
      </div>

      <!-- Two col -->
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <!-- Top productos -->
        <div class="panel">
          <p class="panel-title">Top productos vendidos</p>
          <div v-if="!data.top_productos.length" class="py-8 text-center text-sm text-zinc-600">Sin ventas registradas</div>
          <div v-else class="space-y-0.5">
            <div
v-for="(p, i) in data.top_productos" :key="p.id"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors">
              <span class="mono text-xs text-zinc-600 w-4 text-center shrink-0">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ p.nombre }}</p>
                <p class="mono text-[11px] text-zinc-500">{{ p.total_vendido }} uds · {{ fmt(p.ingresos) }}</p>
              </div>
              <span class="mono text-sm text-emerald-400 shrink-0">+{{ fmt(p.ganancia_total) }}</span>
            </div>
          </div>
        </div>

        <!-- Stock alerts -->
        <div class="panel">
          <div class="flex items-center justify-between mb-4">
            <p class="panel-title mb-0">Alertas de stock</p>
            <NuxtLink to="/productos" class="text-[11px] font-mono font-medium text-violet-400 hover:text-violet-300 transition-colors">
              Ver todos →
            </NuxtLink>
          </div>
          <div v-if="!data.stock_bajo.length" class="py-8 text-center">
            <svg class="w-8 h-8 mx-auto mb-2 text-emerald-500/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p class="text-sm text-zinc-600">Inventario en buen estado</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="p in data.stock_bajo" :key="p.id">
              <div class="flex items-center justify-between mb-1.5">
                <p class="text-sm font-medium">{{ p.nombre }}</p>
                <div class="flex items-center gap-1.5">
                  <span class="mono text-sm font-semibold" :class="p.stock === 0 ? 'text-red-400' : 'text-amber-400'">{{ p.stock }}</span>
                  <span class="text-xs text-zinc-600">/ {{ p.stock_minimo }}</span>
                </div>
              </div>
              <div class="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
class="h-full rounded-full transition-all duration-500"
                  :class="p.stock === 0 ? 'bg-red-500' : 'bg-amber-500'"
                  :style="{ width: Math.min(100, p.stock_minimo > 0 ? (p.stock / p.stock_minimo) * 100 : 0) + '%' }" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory full width -->
      <div class="panel">
        <p class="panel-title">Valor del inventario</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 sm:divide-x sm:divide-zinc-800">
          <div class="sm:pr-8">
            <p class="text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">Valor de costo</p>
            <p class="mono text-xl font-medium">{{ fmt(data.valor_inventario.valor_costo) }}</p>
          </div>
          <div class="sm:px-8">
            <p class="text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">Valor de venta</p>
            <p class="mono text-xl font-medium text-violet-400">{{ fmt(data.valor_inventario.valor_venta) }}</p>
          </div>
          <div class="sm:pl-8">
            <p class="text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">Ganancia potencial</p>
            <p class="mono text-xl font-medium text-emerald-400">{{ fmt(data.valor_inventario.ganancia_potencial) }}</p>
          </div>
        </div>
        <div class="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/60 text-sm text-zinc-400">
          Margen potencial: <strong class="mono text-emerald-400">{{ margen }}%</strong>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { data: raw, pending: cargando, refresh: cargar } = await useFetch('/api/dashboard/resumen')
const data = computed(() => (raw.value as any)?.data ?? null)
const fechaHoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
const fmt = (n: any) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(n) || 0)
const margen = computed(() => {
  if (!data.value) return 0
  const v = data.value.valor_inventario
  if (!v?.valor_venta) return 0
  return ((v.ganancia_potencial / v.valor_venta) * 100).toFixed(1)
})
</script>

<style scoped>
.kpi-card {
  @apply bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors;
}
.kpi-card--accent { @apply border-violet-500/30 bg-violet-500/5; }
.kpi-card--warn { @apply border-amber-500/30; }
.kpi-label { @apply text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2; }
.kpi-value { @apply text-3xl font-medium leading-none text-zinc-100 mb-1.5; }
.kpi-sub { @apply text-[11px] text-zinc-500; }

.panel {
  @apply bg-zinc-900 border border-zinc-800 rounded-xl p-5;
}
.panel-title {
  @apply text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4;
}
</style>
