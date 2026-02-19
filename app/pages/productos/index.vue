<template>
    <div class="p-4 sm:p-6 lg:p-8 max-w-6xl">
        <!-- Header -->
        <div class="flex items-start justify-between gap-3 mb-6 flex-wrap sm:flex-nowrap">
            <div>
                <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Productos</h1>
                <p class="text-xs font-mono text-zinc-500 mt-1">{{ productos.length }} en inventario</p>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
                <button
                    class="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
                    @click="abrirNuevo">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nuevo producto
                </button>
                <NuxtLink to="/productos/eliminados" class="text-sm text-zinc-400 hover:text-white">
                    Ver eliminados
                </NuxtLink>
            </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-2 mb-4">
            <div class="relative flex-1">
                <svg
class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
v-model="busqueda" placeholder="Buscar producto..."
                    class="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors">
            </div>
            <select
v-model="filtroCategoria"
                class="sm:w-48 px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer">
                <option value="">Todas las categorías</option>
                <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
            </select>
        </div>

        <!-- Skeletons -->
        <div v-if="cargando" class="space-y-2">
            <div v-for="i in 6" :key="i" class="h-14 rounded-xl bg-zinc-900 animate-pulse" />
        </div>

        <!-- Mobile: card list -->
        <div v-else-if="productosFiltrados.length" class="md:hidden space-y-2">
            <div
v-for="p in productosFiltrados" :key="p.id"
                class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 active:scale-[0.99] transition-transform cursor-pointer hover:border-zinc-700"
                @click="abrirEditar(p)">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <p class="font-semibold text-sm">{{ p.nombre }}</p>
                            <span class="badge" :class="badgeClass(p)">{{ labelEstado(p) }}</span>
                        </div>
                        <div class="flex items-center gap-2 text-[11px] text-zinc-500 flex-wrap">
                            <span class="mono">{{ fmt(p.precio_venta) }}</span>
                            <span class="text-zinc-700">·</span>
                            <span class="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 font-mono">{{ p.categoria }}</span>
                            <span class="text-zinc-700">·</span>
                            <span class="mono" :class="margenColor(p)">{{ calcMargen(p) }}% margen</span>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <p class="mono text-white font-semibold" :class="stockColor(p)">{{ p.stock }}</p>
                        <p class="text-[10px] text-zinc-600">stock</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Desktop: table -->
        <div
v-if="productosFiltrados.length"
            class="hidden md:block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-zinc-800">
                        <th class="th">Nombre</th>
                        <th class="th">Categoría</th>
                        <th class="th">Costo</th>
                        <th class="th">Precio venta</th>
                        <th class="th">Margen</th>
                        <th class="th">Stock</th>
                        <th class="th">Estado</th>
                        <th class="th text-right">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
v-for="p in productosFiltrados" :key="p.id"
                        class="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/40 transition-colors">
                        <td class="td">
                            <p class="font-medium text-sm">{{ p.nombre }}</p>
                            <p v-if="p.descripcion" class="text-[11px] text-zinc-600 mt-0.5">{{ p.descripcion }}</p>
                        </td>
                        <td class="td"><span class="badge badge--violet">{{ p.categoria }}</span></td>
                        <td class="td mono text-sm">{{ fmt(p.costo) }}</td>
                        <td class="td mono text-sm">{{ fmt(p.precio_venta) }}</td>
                        <td class="td"><span class="mono text-sm font-medium" :class="margenColor(p)">{{ calcMargen(p) }}%</span></td>
                        <td class="td">
                            <span class="mono text-sm font-semibold" :class="stockColor(p)">{{ p.stock }}</span>
                            <span class="text-[11px] text-zinc-600 ml-1">/ {{ p.stock_minimo }}</span>
                        </td>
                        <td class="td"><span class="badge" :class="badgeClass(p)">{{ labelEstado(p) }}</span></td>
                        <td class="td text-right">
                            <button
                                class="p-1.5 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-700 rounded-md transition-all"
                                @click="abrirEditar(p)">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button
                                class="p-1.5 text-red-500 hover:text-red-300 hover:bg-zinc-700 rounded-md transition-all"
                                @click.stop="eliminar(p.id)">
                                🗑
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Empty state -->
        <div v-else class="py-16 text-center text-zinc-600">
            <svg class="w-10 h-10 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <p class="text-sm">No se encontraron productos</p>
        </div>

        <!-- Modal / Bottom sheet -->
        <Teleport to="body">
            <Transition name="fade">
                <div
v-if="modalAbierto"
                    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
                    @click.self="cerrarModal">
                    <Transition name="sheet">
                        <div
v-if="modalAbierto"
                            class="w-full md:max-w-lg bg-zinc-900 border border-zinc-800 md:rounded-2xl rounded-t-2xl overflow-hidden">
                            <div class="md:hidden flex justify-center pt-3 pb-1">
                                <div class="w-10 h-1 rounded-full bg-zinc-700" />
                            </div>
                            <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                                <h2 class="text-white font-bold tracking-tight">
                                    {{ editando ? 'Editar producto' : 'Nuevo producto' }}
                                </h2>
                                <button
                                    class="p-1.5 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all"
                                    @click="cerrarModal">
                                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div class="p-5 space-y-4 max-h-[70dvh] overflow-y-auto">
                                <div class="grid grid-cols-2 gap-3">
                                    <div class="col-span-2">
                                        <label class="field-label">Nombre *</label>
                                        <input v-model="form.nombre" class="field-input" placeholder="Ej: Arroz 1kg">
                                    </div>
                                    <div class="col-span-2 sm:col-span-1">
                                        <label class="field-label">Categoría *</label>
                                        <input v-model="form.categoria" class="field-input" placeholder="Ej: Cereales" list="cat-opts">
                                        <datalist id="cat-opts">
                                            <option v-for="c in categorias" :key="c" :value="c" />
                                        </datalist>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="field-label">Costo *</label>
                                        <input v-model.number="form.costo" type="number" min="0" step="0.01" class="field-input" placeholder="0.00">
                                    </div>
                                    <div>
                                        <label class="field-label">Precio de venta *</label>
                                        <input v-model.number="form.precio_venta" type="number" min="0" step="0.01" class="field-input" placeholder="0.00">
                                    </div>
                                </div>

                                <!-- Live margin preview -->
                                <div
v-if="form.costo > 0 && form.precio_venta > form.costo"
                                    class="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
                                    <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                        <polyline points="17 6 23 6 23 12" />
                                    </svg>
                                    <span class="mono font-medium">{{ ((form.precio_venta - form.costo) / form.precio_venta * 100).toFixed(1) }}% margen</span>
                                    <span class="text-emerald-500/70">·</span>
                                    <span>{{ fmt(form.precio_venta - form.costo) }} / u</span>
                                </div>
                                <div
v-else-if="form.costo > 0 && form.precio_venta > 0 && form.precio_venta <= form.costo"
                                    class="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                                    <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                    El precio de venta debe ser mayor al costo
                                </div>

                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="field-label">Stock</label>
                                        <input v-model.number="form.stock" type="number" min="0" class="field-input" placeholder="0">
                                    </div>
                                    <div>
                                        <label class="field-label">Stock mínimo</label>
                                        <input v-model.number="form.stock_minimo" type="number" min="0" class="field-input" placeholder="5">
                                    </div>
                                </div>

                                <!-- ✅ Motivo label and placeholder now reflect the actual movement direction -->
                                <div v-if="editando">
                                    <label class="field-label">{{ motivoLabel }}</label>
                                    <input v-model="form.motivo" class="field-input" :placeholder="motivoPlaceholder">
                                </div>

                                <div>
                                    <label class="field-label">Descripción</label>
                                    <input v-model="form.descripcion" class="field-input" placeholder="Opcional...">
                                </div>
                            </div>

                            <div class="flex gap-2 px-5 py-4 border-t border-zinc-800">
                                <button
                                    class="flex-1 py-2.5 text-sm font-semibold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                                    @click="cerrarModal">
                                    Cancelar
                                </button>
                                <button
:disabled="guardando || !formValido"
                                    class="flex-1 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    @click="guardar">
                                    <span v-if="guardando" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {{ editando ? 'Guardar cambios' : 'Crear producto' }}
                                </button>
                            </div>
                        </div>
                    </Transition>
                </div>
            </Transition>
        </Teleport>

        <ToastList :toasts="toasts" />
    </div>
</template>

<script setup lang="ts">
interface Producto {
    id: number
    nombre: string
    costo: number
    precio_venta: number
    stock: number
    stock_minimo: number
    categoria: string
    descripcion?: string | null
}

const { fmt } = useFmt()
const { toasts, toast } = useToast()

const { data: raw, pending: cargando, refresh } = await useFetch('/api/productos')
const productos = computed<Producto[]>(() => raw.value?.data ?? [])
const busqueda = ref('')
const filtroCategoria = ref('')
const categorias = computed(() => [...new Set(productos.value.map(p => p.categoria))].sort())
const productosFiltrados = computed(() => productos.value.filter(p =>
    (!busqueda.value || p.nombre.toLowerCase().includes(busqueda.value.toLowerCase())) &&
    (!filtroCategoria.value || p.categoria === filtroCategoria.value)
))

const modalAbierto = ref(false)
const editando = ref<Producto | null>(null)
const guardando = ref(false)
const formDef = () => ({ nombre: '', costo: 0, precio_venta: 0, stock: 0, stock_minimo: 5, categoria: '', descripcion: '', motivo: '' })
const form = ref(formDef())
const formValido = computed(() =>
    form.value.nombre &&
    form.value.costo > 0 &&
    form.value.precio_venta > form.value.costo &&
    form.value.categoria
)

// ✅ Derive the movement type from the stock delta, matching what [id].put.ts will record
const stockDelta = computed(() => editando.value ? form.value.stock - editando.value.stock : 0)
const motivoLabel = computed(() => {
    if (stockDelta.value > 0) return 'Motivo de entrada'
    if (stockDelta.value < 0) return 'Motivo de salida'
    return 'Motivo de ajuste'
})
const motivoPlaceholder = computed(() => {
    if (stockDelta.value > 0) return 'Ej: Reposición de mercancía...'
    if (stockDelta.value < 0) return 'Ej: Merma, producto vencido...'
    return 'Ej: Corrección de inventario...'
})

function abrirNuevo() { editando.value = null; form.value = formDef(); modalAbierto.value = true }
function abrirEditar(p: Producto) {
    editando.value = p
    form.value = { nombre: p.nombre, costo: p.costo, precio_venta: p.precio_venta, stock: p.stock, stock_minimo: p.stock_minimo, categoria: p.categoria, descripcion: p.descripcion || '', motivo: '' }
    modalAbierto.value = true
}
function cerrarModal() { modalAbierto.value = false; editando.value = null }

async function guardar() {
    if (!formValido.value) return
    guardando.value = true
    try {
        await (editando.value
            ? $fetch(`/api/productos/${editando.value.id}`, { method: 'PUT', body: form.value })
            : $fetch('/api/productos', { method: 'POST', body: form.value }))
        toast(editando.value ? 'Producto actualizado' : 'Producto creado', 'success')
        cerrarModal()
        await refresh()
    } catch (e: unknown) {
        const msg = (e as any)?.data?.message
        toast(msg || 'Error al guardar', 'error')
    } finally {
        guardando.value = false
    }
}

async function eliminar(id: number) {
    if (!confirm('¿Eliminar producto?')) return
    try {
        await $fetch(`/api/productos/${id}`, { method: 'DELETE' })
        toast('Producto eliminado', 'success')
        await refresh()
    } catch {
        toast('Error al eliminar', 'error')
    }
}

const calcMargen = (p: Producto) => p.precio_venta ? ((p.precio_venta - p.costo) / p.precio_venta * 100).toFixed(1) : '0.0'
const margenColor = (p: Producto) => { const m = (p.precio_venta - p.costo) / p.precio_venta * 100; return m >= 15 ? 'text-emerald-400' : m >= 5 ? 'text-amber-400' : 'text-red-400' }
const stockColor = (p: Producto) => p.stock === 0 ? 'text-red-400' : p.stock <= p.stock_minimo ? 'text-amber-400' : 'text-zinc-100'
const badgeClass = (p: Producto) => p.stock === 0 ? 'badge--red' : p.stock <= p.stock_minimo ? 'badge--yellow' : 'badge--green'
const labelEstado = (p: Producto) => p.stock === 0 ? 'Sin stock' : p.stock <= p.stock_minimo ? 'Stock bajo' : 'Normal'
</script>

<style scoped>
.th { @apply px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500; }
.td { @apply px-4 py-3; }
.badge { @apply inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono; }
.badge--green { @apply bg-emerald-500/10 text-emerald-400; }
.badge--red { @apply bg-red-500/10 text-red-400; }
.badge--yellow { @apply bg-amber-500/10 text-amber-400; }
.badge--violet { @apply bg-violet-500/10 text-violet-400; }
.field-label { @apply block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5; }
.field-input { @apply w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.sheet-enter-active, .sheet-leave-active { transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
@media (min-width: 768px) {
    .sheet-enter-from, .sheet-leave-to { transform: scale(0.95); }
    .sheet-enter-active, .sheet-leave-active { transition: transform 0.15s ease, opacity 0.15s ease; }
}
.toast-enter-active, .toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from, .toast-leave-to { transform: translateX(20px); opacity: 0; }
</style>