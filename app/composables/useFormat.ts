export const useFormat = () => {
  const currency = (n: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'CUP', maximumFractionDigits: 0 }).format(n || 0)
  return { currency }
}
