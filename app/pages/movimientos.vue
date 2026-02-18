<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-7xl">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-6 flex-wrap sm:flex-nowrap">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Movimientos de stock</h1>
        <p class="text-xs font-mono text-zinc-500 mt-1">
          {{ movimientos.length }} movimientos · Última actualización:
          <NuxtTime :datetime="lastUpdate" relative locale="es" />
        </p>
      </div>

      <!-- Resumen rápido -->
      <div class="flex items-center gap-3 text-xs">
        <div class="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span class="text-emerald-400 font-mono font-bold">{{ resumen.entradas }}</span>
          <span class="text-zinc-500 ml-1">entradas</span>
        </div>
        <div class="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <span class="text-red-400 font-mono font-bold">{{ resumen.salidas }}</span>
          <span class="text-zinc-500 ml-1">salidas</span>
        </div>
        <div class="px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <span class="text-violet-400 font-mono font-bold">{{ resumen.ajustes }}</span>
          <span class="text-zinc-500 ml-1">ajustes</span>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      <!-- Búsqueda por producto -->
      <div class="relative lg:col-span-2">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="filtros.producto" placeholder="Buscar por producto..."
          class="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors">
      </div>

      <!-- Filtro por tipo -->
      <select v-model="filtros.tipo"
        class="px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer">
        <option value="">Todos los tipos</option>
        <option value="entrada">Entrada</option>
        <option value="salida">Salida</option>
        <option value="ajuste">Ajuste</option>
      </select>

      <!-- Fecha desde -->
      <div class="relative">
        <input v-model="filtros.fecha_desde" type="date"
          class="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors">
      </div>

      <!-- Fecha hasta -->
      <div class="relative">
        <input v-model="filtros.fecha_hasta" type="date"
          class="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors">
      </div>
    </div>

    <!-- Botones de acción rápida -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        class="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors flex items-center gap-1.5"
        @click="limpiarFiltros">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        Limpiar filtros
      </button>

      <button
        class="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors flex items-center gap-1.5"
        @click="exportarCSV">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Exportar CSV
      </button>
    </div>

    <!-- Skeletons -->
    <div v-if="cargando" class="space-y-2">
      <div v-for="i in 10" :key="i" class="h-16 rounded-xl bg-zinc-900 animate-pulse" />
    </div>

    <!-- Tabla de movimientos -->
    <div v-else-if="movimientosFiltrados.length" class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-zinc-800">
              <th class="th">Fecha</th>
              <th class="th">Producto</th>
              <th class="th">Tipo</th>
              <th class="th">Cantidad</th>
              <th class="th">Stock anterior</th>
              <th class="th">Stock nuevo</th>
              <th class="th">Motivo</th>
              <th class="th text-right">Detalles</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in movimientosFiltrados" :key="m.id"
              class="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/40 transition-colors">
              <td class="td">
                <span class="text-xs font-mono text-zinc-400">
                  <NuxtTime :datetime="m.fecha" />
                </span>
                <span class="text-[10px] text-zinc-600 block">
                  <NuxtTime :datetime="m.fecha" />
                </span>
              </td>
              <td class="td">
                <p class="font-medium text-sm">{{ m.producto?.nombre }}</p>
                <p class="text-[10px] text-zinc-600">{{ m.producto?.categoria }}</p>
              </td>
              <td class="td">
                <span class="badge" :class="tipoClass(m.tipo)">
                  {{ tipoLabel(m.tipo) }}
                </span>
              </td>
              <td class="td">
                <span class="mono text-sm font-semibold" :class="cantidadClass(m)">
                  {{ m.tipo === 'salida' ? '-' : '+' }}{{ Math.abs(m.cantidad) }}
                </span>
              </td>
              <td class="td">
                <span class="mono text-sm">{{ m.stock_anterior }}</span>
              </td>
              <td class="td">
                <span class="mono text-sm font-semibold" :class="stockNuevoClass(m)">
                  {{ m.stock_nuevo }}
                </span>
              </td>
              <td class="td">
                <span class="text-xs text-zinc-400">{{ m.motivo || '-' }}</span>
              </td>
              <td class="td text-right">
                <button class="p-1.5 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-700 rounded-md transition-all"
                  @click="verDetalle(m)">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="py-20 text-center text-zinc-600">
      <svg class="w-12 h-12 mx-auto mb-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
      <p class="text-sm">No se encontraron movimientos</p>
      <p class="text-xs text-zinc-700 mt-1">Prueba con otros filtros</p>
    </div>

    <!-- Modal de detalle -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="detalleAbierto"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          @click.self="detalleAbierto = false">
          <Transition name="scale">
            <div v-if="detalleAbierto"
              class="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <h2 class="text-white font-bold tracking-tight">Detalle del movimiento</h2>
                <button class="p-1.5 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all"
                  @click="detalleAbierto = false">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div v-if="movimientoSeleccionado" class="p-6 space-y-4">
                <!-- Producto -->
                <div class="flex items-start gap-3 pb-4 border-b border-zinc-800">
                  <div class="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold">{{ movimientoSeleccionado.producto?.nombre }}</p>
                    <p class="text-xs text-zinc-500">{{ movimientoSeleccionado.producto?.categoria }}</p>
                  </div>
                  <span class="badge" :class="tipoClass(movimientoSeleccionado.tipo)">
                    {{ tipoLabel(movimientoSeleccionado.tipo) }}
                  </span>
                </div>

                <!-- Detalles en grid -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Cantidad</p>
                    <p class="text-xl font-mono font-bold" :class="cantidadClass(movimientoSeleccionado)">
                      {{ movimientoSeleccionado.tipo === 'salida' ? '-' : '+' }}{{
                        Math.abs(movimientoSeleccionado.cantidad) }}
                    </p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Fecha</p>
                    <p class="text-sm font-mono">
                      <NuxtTime :datetime="movimientoSeleccionado.fecha" />
                    </p>
                  </div>
                </div>

                <!-- Stock histórico -->
                <div class="bg-zinc-800/50 rounded-xl p-4 space-y-3">
                  <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Historial de stock</p>
                  <div class="flex items-center justify-between">
                    <div class="text-center">
                      <p class="text-xs text-zinc-500">Anterior</p>
                      <p class="text-lg font-mono font-bold">{{ movimientoSeleccionado.stock_anterior }}</p>
                    </div>
                    <div class="text-violet-400">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                    <div class="text-center">
                      <p class="text-xs text-zinc-500">Nuevo</p>
                      <p class="text-lg font-mono font-bold" :class="stockNuevoClass(movimientoSeleccionado)">
                        {{ movimientoSeleccionado.stock_nuevo }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Motivo -->
                <div v-if="movimientoSeleccionado.motivo" class="space-y-1">
                  <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Motivo</p>
                  <p class="text-sm bg-zinc-800/50 rounded-lg p-3">{{ movimientoSeleccionado.motivo }}</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <div class="fixed bottom-6 right-4 flex flex-col gap-2 z-[100]">
        <TransitionGroup name="toast">
          <div v-for="t in toasts" :key="t.id"
            class="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 border text-sm shadow-2xl min-w-[240px]"
            :class="t.type === 'success' ? 'border-emerald-500/30' : 'border-red-500/30'">
            <div class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="t.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'" />
            {{ t.msg }}
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Movimiento {
  id: number
  producto_id: number
  tipo: 'entrada' | 'salida' | 'ajuste'
  cantidad: number
  stock_anterior: number
  stock_nuevo: number
  motivo?: string | null
  fecha: string
  producto?: {
    id: number
    nombre: string
    categoria: string
  }
}

// Data fetching
const { data: raw, pending: cargando, refresh } = await useFetch('/api/movimientos')
const movimientos = computed<Movimiento[]>(() => raw.value?.data ?? [])

// Filtros
const filtros = ref({
  producto: '',
  tipo: '',
  fecha_desde: '',
  fecha_hasta: ''
})

// Computed para movimientos filtrados
const movimientosFiltrados = computed(() => {
  return movimientos.value.filter(m => {
    // Filtro por producto (búsqueda en nombre)
    if (filtros.value.producto && !m.producto?.nombre.toLowerCase().includes(filtros.value.producto.toLowerCase())) {
      return false
    }

    // Filtro por tipo
    if (filtros.value.tipo && m.tipo !== filtros.value.tipo) {
      return false
    }

    // Filtro por fecha desde
    if (filtros.value.fecha_desde && m.fecha < filtros.value.fecha_desde) {
      return false
    }

    // Filtro por fecha hasta
    if (filtros.value.fecha_hasta) {
      const fechaHasta = new Date(filtros.value.fecha_hasta)
      fechaHasta.setDate(fechaHasta.getDate() + 1) // Incluir todo el día
      if (new Date(m.fecha) > fechaHasta) {
        return false
      }
    }

    return true
  })
})

// Resumen estadístico
const resumen = computed(() => {
  const stats = movimientosFiltrados.value.reduce((acc, m) => {
    if (m.tipo === 'entrada') acc.entradas += Math.abs(m.cantidad)
    else if (m.tipo === 'salida') acc.salidas += Math.abs(m.cantidad)
    else if (m.tipo === 'ajuste') acc.ajustes += 1
    return acc
  }, { entradas: 0, salidas: 0, ajustes: 0 })

  return stats
})

// Última actualización
const lastUpdate = computed(() => {
  if (!movimientos.value.length) return '-'
  const latest = new Date(Math.max(...movimientos.value.map(m => new Date(m.fecha).getTime())))
  return latest.toISOString()
})

// Modal de detalle
const detalleAbierto = ref(false)
const movimientoSeleccionado = ref<Movimiento | null>(null)

function verDetalle(m: Movimiento) {
  movimientoSeleccionado.value = m
  detalleAbierto.value = true
}

function limpiarFiltros() {
  filtros.value = {
    producto: '',
    tipo: '',
    fecha_desde: '',
    fecha_hasta: ''
  }
}

function exportarCSV() {
  const headers = ['Fecha', 'Producto', 'Categoría', 'Tipo', 'Cantidad', 'Stock Anterior', 'Stock Nuevo', 'Motivo']
  const rows = movimientosFiltrados.value.map(m => [
    m.fecha,
    m.producto?.nombre || '',
    m.producto?.categoria || '',
    tipoLabel(m.tipo),
    (m.tipo === 'salida' ? '-' : '+') + Math.abs(m.cantidad),
    m.stock_anterior,
    m.stock_nuevo,
    m.motivo || ''
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `movimientos_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)

  toast('Exportado correctamente', 'success')
}

// Clases y labels para tipos
const tipoClass = (tipo: string) => ({
  'entrada': 'badge--green',
  'salida': 'badge--red',
  'ajuste': 'badge--violet'
}[tipo] || 'badge--violet')

const tipoLabel = (tipo: string) => ({
  'entrada': 'Entrada',
  'salida': 'Salida',
  'ajuste': 'Ajuste'
}[tipo] || tipo)

const cantidadClass = (m: Movimiento) => ({
  'entrada': 'text-emerald-400',
  'salida': 'text-red-400',
  'ajuste': 'text-violet-400'
}[m.tipo] || 'text-zinc-100')

const stockNuevoClass = (m: Movimiento) =>
  m.stock_nuevo === 0 ? 'text-red-400' : 'text-zinc-100'

// Toast
const toasts = ref<{ id: number; msg: string; type: string }[]>([])
let tid = 0
function toast(msg: string, type = 'success') {
  const id = tid++
  toasts.value.push({ id, msg, type })
  setTimeout(() => toasts.value = toasts.value.filter(t => t.id !== id), 3000)
}

// Refresh cada 30 segundos
onMounted(() => {
  const interval = setInterval(refresh, 30000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped>
.th {
  @apply px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500;
}

.td {
  @apply px-4 py-3;
}

.badge {
  @apply inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono;
}

.badge--green {
  @apply bg-emerald-500/10 text-emerald-400;
}

.badge--red {
  @apply bg-red-500/10 text-red-400;
}

.badge--violet {
  @apply bg-violet-500/10 text-violet-400;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
