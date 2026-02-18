<template>
  <div class="panel">
    <p class="panel-title"><slot name="title"/></p>
    <slot/>
  </div>
</template>

<style scoped>
.panel {
  @apply bg-zinc-900 border border-zinc-800 rounded-xl p-5;
}

.panel-title {
  @apply text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4;
}
</style>