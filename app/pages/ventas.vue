<template>
  <div class="p-4 sm:p-6 lg:p-8 xl:p-10">
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Nueva Venta</h1>
      <p class="text-xs font-mono text-zinc-500 mt-1">Registra una o varias ventas</p>
    </div>

    <div class="grid md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-4 xl:gap-6 items-start">

      <!-- Product picker -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5">
        <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Catálogo</p>

        <div class="relative mb-3">
          <svg
class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
v-model="busqueda" placeholder="Buscar..."
            class="w-full pl-9 pr-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors">
        </div>

        <div class="flex gap-1.5 flex-wrap mb-3">
          <button
v-for="c in ['Todos', ...categorias]" :key="c"
            class="px-3 py-1 rounded-full text-xs font-medium transition-all border"
            :class="catActiva === c
              ? 'bg-violet-600 border-violet-600 text-white'
              : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'"
            @click="catActiva = c">{{ c }}</button>
        </div>

        <div v-if="cargando" class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div v-for="i in 9" :key="i" class="h-20 rounded-lg bg-zinc-800 animate-pulse" />
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[48dvh] md:max-h-[calc(100dvh-340px)] overflow-y-auto pr-0.5">
          <button
v-for="p in productosFiltrados" :key="p.id"
            :disabled="p.stock === 0"
            class="relative text-left flex flex-col gap-1 p-3 rounded-xl border transition-all"
            :class="[
              p.stock === 0
                ? 'opacity-40 cursor-not-allowed bg-zinc-800/30 border-zinc-800'
                : enCarrito(p)
                  ? 'border-violet-500/60 bg-violet-500/8 cursor-pointer'
                  : 'border-zinc-800 bg-zinc-800/40 hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer active:scale-[0.97]'
            ]"
            @click="agregarAlCarrito(p)">
            <span class="text-[9px] uppercase tracking-widest text-zinc-600">{{ p.categoria }}</span>
            <span class="text-[13px] font-semibold text-zinc-100 leading-tight">{{ p.nombre }}</span>
            <span class="mono text-sm text-violet-400 mt-0.5">{{ fmt(p.precio_venta) }}</span>
            <span
class="text-[10px]"
              :class="p.stock === 0 ? 'text-red-500' : p.stock <= p.stock_minimo ? 'text-amber-400' : 'text-zinc-600'">
              {{ p.stock === 0 ? 'Sin stock' : `${stockDisponible(p)} disp.` }}
            </span>
            <span
v-if="enCarrito(p)"
              class="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-violet-500 text-white text-[10px] font-bold mono flex items-center justify-center">
              {{ cantidadEnCarrito(p) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Cart + summary -->
      <div class="space-y-3">
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Carrito</p>
            <span
v-if="carrito.length"
              class="mono text-[11px] bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded-full">
              {{ carrito.length }} items
            </span>
          </div>

          <div v-if="!carrito.length" class="py-10 text-center">
            <svg class="w-7 h-7 mx-auto mb-2 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <p class="text-xs text-zinc-600">Selecciona productos</p>
          </div>

          <div v-else class="divide-y divide-zinc-800">
            <div v-for="item in carrito" :key="item.producto.id" class="px-3 py-2.5 space-y-2">
              <div class="flex items-center gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ item.producto.nombre }}</p>
                  <p class="mono text-[11px] text-zinc-500">{{ fmt(item.producto.precio_venta) }}/u</p>
                </div>

                <!-- ✅ Direct editable input — type 312 and press Enter, no button mashing -->
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    class="w-6 h-6 rounded-md border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-all flex items-center justify-center text-base leading-none"
                    @click="cambiarCantidad(item, -1)">−</button>
                  <input
                    :value="item.cantidad"
                    type="number"
                    min="1"
                    :max="item.producto.stock"
                    class="mono text-sm w-14 text-center bg-zinc-800 border border-zinc-700 rounded-md px-1 py-0.5 text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    @change="setCantidad(item, ($event.target as HTMLInputElement).value)"
                    @focus="($event.target as HTMLInputElement).select()"
                  >
                  <button
                    :disabled="item.cantidad >= item.producto.stock"
                    class="w-6 h-6 rounded-md border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 disabled:opacity-30 transition-all flex items-center justify-center text-base leading-none"
                    @click="cambiarCantidad(item, 1)">+</button>
                </div>

                <span class="mono text-sm text-zinc-300 w-16 text-right shrink-0">
                  {{ fmt(item.producto.precio_venta * item.cantidad) }}
                </span>
                <button class="text-zinc-600 hover:text-red-400 transition-colors p-0.5 shrink-0" @click="quitarItem(item)">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <input
v-model="item.motivo" placeholder="Motivo (opcional)"
                class="w-full px-2.5 py-1.5 text-xs bg-zinc-800/60 border border-zinc-700/60 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors">
            </div>
          </div>
        </div>

        <!-- Summary + checkout -->
        <div v-if="carrito.length" class="bg-zinc-900 border border-violet-500/20 rounded-xl p-4 space-y-3">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between text-zinc-500">
              <span>Subtotal</span><span class="mono">{{ fmt(totalVenta) }}</span>
            </div>
            <div class="flex justify-between text-zinc-500">
              <span>Ganancia estimada</span><span class="mono text-emerald-400">+{{ fmt(totalGanancia) }}</span>
            </div>
          </div>
          <div class="border-t border-zinc-800 pt-3 flex justify-between font-bold text-lg">
            <span>Total</span><span class="mono">{{ fmt(totalVenta) }}</span>
          </div>
          <button
:disabled="procesando"
            class="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors disabled:opacity-50"
            @click="procesarVenta">
            <span v-if="procesando" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ procesando ? 'Procesando...' : 'Confirmar venta' }}
          </button>
          <button
            class="w-full py-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-all"
            @click="limpiarCarrito">Limpiar carrito</button>
        </div>

        <!-- Recent sales -->
        <div v-if="ultimasVentas.length" class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-3 border-b border-zinc-800">
            Últimas ventas
          </p>
          <div class="divide-y divide-zinc-800/60">
            <div v-for="v in ultimasVentas" :key="v.id" class="flex items-center justify-between px-4 py-2.5">
              <div>
                <p class="text-sm font-medium">{{ v.producto }}</p>
                <p class="mono text-[11px] text-zinc-500">
                  ×{{ v.cantidad }} · {{ fmt(v.subtotal) }}
                  <span class="text-zinc-700 mx-1">·</span>
                  <NuxtTime :datetime="v.fecha" hour="2-digit" minute="2-digit" />
                </p>
              </div>
              <span class="mono text-xs text-emerald-400">+{{ fmt(v.ganancia) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ToastList :toasts="toasts" />
  </div>
</template>

<script setup lang="ts">

interface Producto {
  id: number; nombre: string; costo: number; precio_venta: number
  stock: number; stock_minimo: number; categoria: string
}
interface CartItem { producto: Producto; cantidad: number; motivo: string }
interface VentaResult { id: number; producto: string; cantidad: number; subtotal: number; ganancia: number; fecha: string }
interface VentaResponse {
  success: boolean
  data: { ventas: Omit<VentaResult, 'fecha'>[]; total: number; ganancia_total: number; fecha: string }
}

const { fmt } = useFmt()
const { toasts, toast } = useToast()

const { data: raw, pending: cargando } = await useFetch<{ data: Producto[] }>('/api/productos')
const productosLocales = ref<Producto[]>([])
watch(() => raw.value?.data, (data) => {
  if (data) productosLocales.value = data.map(p => ({ ...p }))
}, { immediate: true })

const busqueda = ref('')
const catActiva = ref('Todos')
const categorias = computed(() => [...new Set(productosLocales.value.map(p => p.categoria))].sort())
const productosFiltrados = computed(() => productosLocales.value.filter(p =>
  (!busqueda.value || p.nombre.toLowerCase().includes(busqueda.value.toLowerCase())) &&
  (catActiva.value === 'Todos' || p.categoria === catActiva.value)
))

const carrito = ref<CartItem[]>([])
const carritoMap = computed(() => new Map(carrito.value.map(i => [i.producto.id, i])))
const enCarrito = (p: Producto) => carritoMap.value.has(p.id)
const cantidadEnCarrito = (p: Producto) => carritoMap.value.get(p.id)?.cantidad ?? 0
const stockDisponible = (p: Producto) => p.stock - cantidadEnCarrito(p)

function agregarAlCarrito(p: Producto) {
  const existente = carritoMap.value.get(p.id)
  if (existente) {
    if (existente.cantidad >= p.stock) { toast(`Stock máximo alcanzado para ${p.nombre}`, 'error'); return }
    existente.cantidad++
  } else {
    carrito.value.push({ producto: p, cantidad: 1, motivo: '' })
  }
}

function cambiarCantidad(item: CartItem, d: number) {
  const n = item.cantidad + d
  if (n < 1) { quitarItem(item); return }
  if (n > item.producto.stock) return
  item.cantidad = n
}

// ✅ Type the quantity directly — clamps to available stock, removes item if cleared
function setCantidad(item: CartItem, value: string) {
  const n = parseInt(value, 10)
  if (isNaN(n) || n < 1) { quitarItem(item); return }
  if (n > item.producto.stock) {
    item.cantidad = item.producto.stock
    toast(`Máximo disponible: ${item.producto.stock}`, 'error')
    return
  }
  item.cantidad = n
}

function quitarItem(item: CartItem) { carrito.value = carrito.value.filter(i => i.producto.id !== item.producto.id) }
function limpiarCarrito() { carrito.value = [] }

const totalVenta = computed(() => carrito.value.reduce((s, i) => s + i.producto.precio_venta * i.cantidad, 0))
const totalGanancia = computed(() => carrito.value.reduce((s, i) => s + (i.producto.precio_venta - i.producto.costo) * i.cantidad, 0))

const procesando = ref(false)
const ultimasVentas = ref<VentaResult[]>([])

async function procesarVenta() {
  if (!carrito.value.length) return
  procesando.value = true
  const snapshot = [...carrito.value]
  const totalSnapshot = totalVenta.value
  try {
    const res = await $fetch<VentaResponse>('/api/ventas', {
      method: 'POST',
      body: snapshot.map(i => ({
        productoId: i.producto.id,
        cantidad: i.cantidad,
        ...(i.motivo.trim() ? { motivo: i.motivo.trim() } : {})
      }))
    })
    for (const item of snapshot) {
      const local = productosLocales.value.find(p => p.id === item.producto.id)
      if (local) local.stock -= item.cantidad
    }
    const fecha = res.data.fecha
    ultimasVentas.value = [...res.data.ventas.map(v => ({ ...v, fecha })), ...ultimasVentas.value].slice(0, 8)
    toast(`Venta registrada · ${fmt(totalSnapshot)}`, 'success')
    limpiarCarrito()
    await refreshNuxtData()
  } catch (e: any) {
    toast(e?.data?.message || 'Error al procesar venta', 'error')
  } finally {
    procesando.value = false
  }
}
</script>