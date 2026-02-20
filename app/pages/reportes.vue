<template>
  <div class="p-4 sm:p-6 lg:p-8 xl:p-10">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-6 flex-wrap sm:flex-nowrap">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Reportes</h1>
        <p class="text-xs font-mono text-zinc-500 mt-1">Analiza el desempeño del negocio</p>
      </div>
      <button v-if="data"
        class="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-all shrink-0"
        @click="exportarCSV">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span class="hidden sm:inline">Exportar CSV</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-5">
      <div class="grid grid-cols-2 sm:flex sm:items-end gap-3">
        <div>
          <label class="field-label">Desde</label>
          <input v-model="filtros.fechaInicio" type="date" class="field-input">
        </div>
        <div>
          <label class="field-label">Hasta</label>
          <input v-model="filtros.fechaFin" type="date" class="field-input">
        </div>
        <div class="col-span-2 sm:flex-1">
          <label class="field-label">Categoría</label>
          <!-- ✅ Categories derived from report results — no extra /api/productos fetch needed -->
          <select v-model="filtros.categoria" class="field-input cursor-pointer">
            <option value="">Todas</option>
            <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="col-span-2 sm:col-auto flex gap-2">
          <button :disabled="cargando"
            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors disabled:opacity-50"
            @click="cargar">
            <span v-if="cargando"
              class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Buscar
          </button>
          <button
            class="px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
            @click="resetFiltros">Resetear</button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="py-16 text-center flex flex-col items-center gap-3 text-zinc-600">
      <div class="w-6 h-6 border-2 border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
      <p class="text-sm">Generando reporte...</p>
    </div>

    <!-- ✅ Error state — was swallowed silently before, user had no feedback -->
    <div v-else-if="error" class="py-16 text-center">
      <svg class="w-10 h-10 mx-auto mb-3 text-red-500/40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p class="text-sm text-zinc-400">Error al generar el reporte</p>
      <p class="text-xs text-zinc-600 mt-1">{{ error }}</p>
      <button
        class="mt-4 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
        @click="cargar">
        Reintentar
      </button>
    </div>

    <!-- Empty prompt -->
    <div v-else-if="!data" class="py-16 text-center text-zinc-600">
      <svg class="w-10 h-10 mx-auto mb-3 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.5">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
      <p class="text-sm">Aplica los filtros y presiona <strong class="text-zinc-400">Buscar</strong></p>
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 xl:gap-4 mb-5">
        <div class="kpi-card">
          <p class="kpi-label">Ventas</p>
          <p class="kpi-value mono">{{ data.totales.cantidad_ventas }}</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-label">Unidades</p>
          <p class="kpi-value mono">{{ data.totales.unidades_vendidas }}</p>
        </div>
        <div class="kpi-card kpi-card--accent">
          <p class="kpi-label">Ingresos</p>
          <p class="kpi-value mono">{{ fmt(data.totales.ingresos_totales) }}</p>
        </div>
        <div class="kpi-card kpi-card--green">
          <p class="kpi-label">Ganancia</p>
          <p class="kpi-value mono text-emerald-400">{{ fmt(data.totales.ganancia_total) }}</p>
        </div>
      </div>

      <!-- Bar chart -->
      <div v-if="data.ventas_por_dia.length > 1" class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
        <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">Ingresos por día</p>
        <div class="flex items-end gap-1 h-28 xl:h-40 overflow-x-auto pb-1">
          <div v-for="d in data.ventas_por_dia" :key="d.fecha"
            class="flex flex-col items-center gap-1.5 flex-1 min-w-[28px] max-w-[56px] h-full">
            <div class="flex-1 w-full flex items-end">
              <div class="w-full rounded-t-sm bg-violet-500/70 hover:bg-violet-500 transition-colors cursor-default"
                :style="{ height: barHeight(d.ingresos) + '%', minHeight: '4px' }"
                :title="`${d.fecha}: ${fmt(d.ingresos)}`" />
            </div>
            <span class="mono text-[9px] text-zinc-600 whitespace-nowrap">{{ shortDate(d.fecha) }}</span>
          </div>
        </div>
      </div>

      <!-- Detail table -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-800">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Detalle <span class="text-zinc-600">({{ data.ventas.length }})</span>
          </p>
          <div class="relative">
            <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 pointer-events-none"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input v-model="busquedaTabla" placeholder="Filtrar..."
              class="pl-7 pr-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors w-36 sm:w-48">
          </div>
        </div>

        <div v-if="!ventasFiltradas.length" class="py-10 text-center text-sm text-zinc-600">
          Sin ventas en el período seleccionado
        </div>

        <!-- Mobile -->
        <div class="md:hidden divide-y divide-zinc-800/60">
          <div v-for="v in ventasFiltradas" :key="v.id" class="flex items-center gap-3 px-4 py-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ v.producto }}</p>
              <p class="mono text-[11px] text-zinc-500 mt-0.5">{{ fmtFecha(v.fecha) }} · ×{{ v.cantidad }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="mono text-sm font-medium">{{ fmt(v.subtotal) }}</p>
              <p class="mono text-xs text-emerald-400">+{{ fmt(v.ganancia) }}</p>
            </div>
          </div>
        </div>

        <!-- Desktop -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-zinc-800">
                <th class="th">#</th>
                <th class="th">Producto</th>
                <th class="th">Categoría</th>
                <th class="th">Fecha</th>
                <th class="th">Cant.</th>
                <th class="th">Precio</th>
                <th class="th">Subtotal</th>
                <th class="th">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in ventasFiltradas" :key="v.id"
                class="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/30 transition-colors">
                <td class="td mono text-xs text-zinc-600">{{ v.id }}</td>
                <td class="td font-medium text-sm">{{ v.producto }}</td>
                <td class="td"><span
                    class="mono text-[10px] bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full">{{ v.categoria
                    }}</span></td>
                <td class="td mono text-xs text-zinc-500">{{ fmtFecha(v.fecha) }}</td>
                <td class="td mono text-sm">{{ v.cantidad }}</td>
                <td class="td mono text-sm">{{ fmt(v.precio_venta) }}</td>
                <td class="td mono text-sm font-medium">{{ fmt(v.subtotal) }}</td>
                <td class="td mono text-sm text-emerald-400">+{{ fmt(v.ganancia) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">

useSeoMeta({ title: 'Reportes' })

interface VentaDetalle { id: number; producto: string; categoria: string; cantidad: number; precio_venta: number; ganancia: number; fecha: string; subtotal: number }
interface DiaStat { fecha: string; ventas: number; ingresos: number; ganancias: number }
interface ReporteData {
  ventas: VentaDetalle[]
  totales: { cantidad_ventas: number; unidades_vendidas: number; ingresos_totales: number; ganancia_total: number; ticket_promedio: number }
  ventas_por_dia: DiaStat[]
}

// ✅ Uses shared composable — was using MXN/es-MX (bug) while the rest of the app uses CUP/es-ES
const { fmt } = useFmt()

const hoy = new Date().toISOString().split('T')[0]
const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
const filtros = ref({ fechaInicio: inicioMes, fechaFin: hoy, categoria: '' })
const busquedaTabla = ref('')
const data = ref<ReporteData | null>(null)
const cargando = ref(false)
const error = ref<string | null>(null)

// ✅ Categories derived from existing report data — removed the extra useFetch('/api/productos')
const categorias = computed(() => {
  if (!data.value?.ventas.length) return []
  return [...new Set(data.value.ventas.map(v => v.categoria))].sort()
})

async function cargar() {
  cargando.value = true
  error.value = null
  try {
    const params: Record<string, string> = {
      fechaInicio: filtros.value.fechaInicio,
      fechaFin: filtros.value.fechaFin
    }
    if (filtros.value.categoria) params.categoria = filtros.value.categoria
    const res = await $fetch<any>('/api/reportes/ventas', { params })
    data.value = res.data
  } catch (e: any) {
    // ✅ Error is now surfaced to the user instead of silently console.error'd
    error.value = e?.data?.message || e?.message || 'Error desconocido'
  } finally {
    cargando.value = false
  }
}

function resetFiltros() {
  filtros.value = { fechaInicio: inicioMes, fechaFin: hoy, categoria: '' }
  data.value = null
  error.value = null
}

onMounted(cargar)

const ventasFiltradas = computed(() => {
  if (!data.value) return []
  const q = busquedaTabla.value.toLowerCase()
  return !q ? data.value.ventas : data.value.ventas.filter(v =>
    v.producto.toLowerCase().includes(q) || v.categoria.toLowerCase().includes(q)
  )
})

const maxIngreso = computed(() =>
  !data.value?.ventas_por_dia?.length ? 1 : Math.max(...data.value.ventas_por_dia.map(d => d.ingresos), 1)
)
const barHeight = (n: number) => Math.max(4, (n / maxIngreso.value) * 100)

const fmtFecha = (f: any) =>
  f ? new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'
const shortDate = (f: string) => { const p = f?.split('-'); return p ? `${p[2]}/${p[1]}` : '' }

function exportarCSV() {
  if (!data.value?.ventas?.length) return
  const h = ['ID', 'Producto', 'Categoría', 'Fecha', 'Cantidad', 'Precio', 'Subtotal', 'Ganancia']
  const r = data.value.ventas.map(v => [v.id, v.producto, v.categoria, v.fecha, v.cantidad, v.precio_venta, v.subtotal, v.ganancia])
  const csv = [h, ...r].map(row => row.join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `ventas-${filtros.value.fechaInicio}-${filtros.value.fechaFin}.csv`
  a.click()
  // ✅ Revoke object URL to prevent memory leak (was missing before)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.field-label {
  @apply block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5;
}

.field-input {
  @apply w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors;
}

.kpi-card {
  @apply bg-zinc-800/50 border border-zinc-800 rounded-xl p-4;
}

.kpi-card--accent {
  @apply border-violet-500/25;
}

.kpi-card--green {
  @apply border-emerald-500/25;
}

.kpi-label {
  @apply text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2;
}

.kpi-value {
  @apply text-2xl sm:text-3xl font-medium tracking-tight;
}

.th {
  @apply px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500;
}

.td {
  @apply px-4 py-3;
}
</style>
