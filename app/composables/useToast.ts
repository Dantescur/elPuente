export interface Toast {
  id: number
  msg: string
  type: 'success' | 'error'
}

export const useToast = () => {
  const toasts = ref<Toast[]>([])
  let tid = 0

  function toast(msg: string, type: Toast['type'] = 'success') {
    const id = tid++
    toasts.value.push({ id, msg, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3000)
  }

  return { toasts, toast }
}
