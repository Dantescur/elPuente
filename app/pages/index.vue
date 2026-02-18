<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-6xl">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">Dashboard</h1>
        <p class="text-xs font-mono text-zinc-500 mt-1">{{ fechaHoy }}</p>
      </div>
      <button
:disabled="cargando"
        class="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-all disabled:opacity-50"
        @click="cargar">
        <Icon v-if="!cargando" name="lucide:refresh-cw" class="w-4 h-4" />
        <span
v-else
          class="w-3.5 h-3.5 border-2 border-zinc-600 border-t-violet-500 rounded-full animate-spin inline-block" />
        <span class="hidden sm:inline">Actualizar</span>
      </button>

    </div>

    <!-- Skeleton -->
    <div v-if="cargando && !data" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <div v-for="i in 4" :key="i" class="h-28 rounded-xl bg-zinc-900 animate-pulse" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
  <KPICard label="Ventas hoy" :value="data.ventas_hoy.total_ventas" sub="transacciones" />
  <KPICard
label="Ingresos hoy" :value="fmt(data.ventas_hoy.ingresos)"
    :sub="fmt(data.ventas_hoy.ganancias) + ' ganancia'" accent />
  <KPICard label="Stock bajo" :value="data.stock_bajo.length" :warn="data.stock_bajo.length > 0" />
</div>


      <!-- Two col -->
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <!-- Top productos -->
        <HomePanel>
          <template #title>Top productos vendidos</template>
          <div v-if="!data.top_productos.length" class="py-8 text-center text-sm text-zinc-600">Sin ventas registradas
          </div>
          <div v-else class="space-y-0.5">
            <TopProductos :productos="data.top_productos" />
          </div>
        </HomePanel>


        <!-- Stock alerts -->
        <HomePanel>
          <template #title>Alertas de stock</template>
          <StockAlert :productos="data.stock_bajo" />
        </HomePanel>

      </div>

      <!-- Inventory full width -->
      <InventoryValue :valor="data.valor_inventario" :margen="margen" />

    </template>
  </div>
</template>

<script setup lang="ts">
const { data: raw, pending: cargando, refresh: cargar } = await useFetch('/api/dashboard/resumen')
const data = computed(() => (raw.value as any)?.data ?? null)
const fechaHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
const fmt = (n: any) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CUP', maximumFractionDigits: 0 }).format(Number(n) || 0)
const margen = computed(() => {
  if (!data.value) return 0
  const v = data.value.valor_inventario
  if (!v?.valor_venta) return 0
  return ((v.ganancia_potencial / v.valor_venta) * 100).toFixed(1)
})
</script>

<style scoped>
.panel {
  @apply bg-zinc-900 border border-zinc-800 rounded-xl p-5;
}

.panel-title {
  @apply text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4;
}
</style>
