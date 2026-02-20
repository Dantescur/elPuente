<script setup lang="ts">
const { data, refresh } = await useFetch('/api/productos/eliminados')

useSeoMeta({ title: 'Productos Eliminados' })

async function reactivar(id: number) {
  if (!confirm('¿Reactivar producto?')) return

  try {
    await $fetch(`/api/productos/${id}/reactivar`, {
      method: 'POST'
    })

    await refresh()
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="p-6 space-y-4">
    <!-- Back button -->
    <div>
      <NuxtLink to="/productos"
        class="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
        Volver a productos
      </NuxtLink>
    </div>

    <!-- Header -->
    <h1 class="text-xl font-semibold">
      Productos Eliminados
    </h1>

    <!-- Lista de eliminados -->
    <div v-for="p in data?.data" :key="p.id" class="flex items-center justify-between p-3 border-b border-zinc-700">
      <div>
        <div class="font-medium">
          {{ p.nombre }}
        </div>
        <div v-if="p.fecha_eliminacion" class="text-sm text-zinc-400">
          Eliminado
          <NuxtTime :datetime="p.fecha_eliminacion" locale="es" relative />
          ·
          <NuxtTime :datetime="p.fecha_eliminacion" day="2-digit" month="2-digit" year="numeric" />
        </div>
      </div>

      <button class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-md text-sm" @click="reactivar(p.id)">
        Reactivar
      </button>
    </div>
  </div>
</template>
