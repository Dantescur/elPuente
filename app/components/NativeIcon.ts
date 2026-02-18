export const icon = (paths: string) => defineComponent({
  render: () => h('svg', { width: '100%', height: '100%', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    paths.split('|').map(d => h('path', { d })))
})