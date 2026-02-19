<template>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 sm:divide-x sm:divide-zinc-800">
      <div class="sm:pr-8">
        <p class="text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">Valor de costo</p>
        <p class="mono text-xl font-medium">{{ fmt(valor.valor_costo) }}</p>
      </div>
      <div class="sm:px-8">
        <p class="text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">Valor de venta</p>
        <p class="mono text-xl font-medium text-violet-400">{{ fmt(valor.valor_venta) }}</p>
      </div>
      <div class="sm:pl-8">
        <p class="text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">Ganancia potencial</p>
        <p class="mono text-xl font-medium text-emerald-400">{{ fmt(valor.ganancia_potencial) }}</p>
      </div>
    </div>
    <div class="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/60 text-sm text-zinc-400">
      Margen potencial: <strong class="mono text-emerald-400">{{ margen }}%</strong>
</div></template>

<script setup lang="ts">

defineProps<{
  valor: {
    valor_costo: number
    valor_venta: number
    ganancia_potencial: number
  }
  margen: string | number
}>()

const { fmt } = useFmt()
</script>
