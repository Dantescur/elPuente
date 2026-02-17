import type { schema } from '@nuxthub/db'

export type Product = typeof schema.productos.$inferSelect
export type NewProduct = typeof schema.productos.$inferInsert
export type Venta = typeof schema.ventas.$inferSelect
export type NewVenta = typeof schema.ventas.$inferInsert
export type Movimiento = typeof schema.movimientos.$inferSelect