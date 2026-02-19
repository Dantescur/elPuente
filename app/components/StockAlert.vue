<template>
  <div v-if="!productos.length" class="py-8 text-center">
    <Icon name="heroicons:check-circle" class="w-8 h-8 mx-auto mb-2 text-emerald-500/40" />
    <p class="text-sm text-zinc-600">Inventario en buen estado</p>
  </div>
  <div v-else class="space-y-3">
    <div v-for="p in productos" :key="p.id">
      <div class="flex items-center justify-between mb-1.5">
        <p class="text-sm font-medium">{{ p.nombre }}</p>
        <div class="flex items-center gap-1.5">
          <span class="mono text-sm font-semibold" :class="p.stock === 0 ? 'text-red-400' : 'text-amber-400'">{{ p.stock
          }}</span>
          <span class="text-xs text-zinc-600">/ {{ p.stock_minimo }}</span>
        </div>
      </div>
      <div class="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
class="h-full rounded-full transition-all duration-500"
          :class="p.stock === 0 ? 'bg-red-500' : 'bg-amber-500'" :style="{ width: barWidth(p) + '%' }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProductoBajoStock {
  id: number
  nombre: string
  stock: number
  stock_minimo: number
}

defineProps<{ productos: ProductoBajoStock[] }>()

const barWidth = (p: ProductoBajoStock) =>
  Math.min(100, p.stock_minimo > 0 ? (p.stock / p.stock_minimo) * 100 : 0)
</script>
