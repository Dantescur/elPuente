<template>
  <Teleport to="body">
    <div class="fixed bottom-24 md:bottom-6 right-4 flex flex-col gap-2 z-[100]">
      <TransitionGroup name="toast">
        <div
v-for="t in toasts" :key="t.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 border text-sm shadow-2xl min-w-[220px]"
          :class="t.type === 'success' ? 'border-emerald-500/30' : 'border-red-500/30'">
          <div
class="w-1.5 h-1.5 rounded-full shrink-0"
            :class="t.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'" />
          {{ t.msg }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Toast } from '~/composables/useToast'

defineProps<{ toasts: Toast[] }>()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
