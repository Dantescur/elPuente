<template>
  <div :class="['kpi-card', accentClass, warnClass]">
    <p class="kpi-label">{{ label }}</p>
    <p class="kpi-value mono">{{ value }}</p>
    <p v-if="sub" class="kpi-sub mono">{{ sub }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  warn?: boolean
}>()

const accentClass = computed(() => props.accent ? 'kpi-card--accent' : '')
const warnClass = computed(() => props.warn ? 'kpi-card--warn' : '')
</script>

<style scoped>
.kpi-card {
  @apply bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors;
}

.kpi-card--accent {
  @apply border-violet-500/30 bg-violet-500/5;
}

.kpi-card--warn {
  @apply border-amber-500/30;
}

.kpi-label {
  @apply text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2;
}

.kpi-value {
  @apply text-3xl font-medium leading-none text-zinc-100 mb-1.5;
}

.kpi-sub {
  @apply text-[11px] text-zinc-500;
}

</style>