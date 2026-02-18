export const movimientosIcon = defineComponent({
  render: () => h('svg', { width: '100%', height: '100%', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('polyline', { points: '1 4 1 10 7 10' }),
    h('polyline', { points: '23 20 23 14 17 14' }),
    h('path', { d: 'M20.49 9A9 9 0 1 0 14.51 15' }),
    h('line', { x1: '1', y1: '10', x2: '7', y2: '10' }),
    h('line', { x1: '17', y1: '14', x2: '23', y2: '14' }),
  ])
})