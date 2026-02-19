export const useFmt = () => {
  const fmt = (n: number | string | null | undefined): string =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'CUP',
      maximumFractionDigits: 0
    }).format(Number(n) || 0)

  return { fmt }
}
