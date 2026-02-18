import { relations, sql } from "drizzle-orm";
import * as t from "drizzle-orm/sqlite-core";

export const productos = t.sqliteTable('productos', {
    id: t.integer('id').primaryKey({ autoIncrement: true }),
    nombre: t.text('nombre').notNull(),
    costo: t.integer('costo').notNull(),
    precio_venta: t.integer('precio_venta').notNull(),
    stock: t.integer('stock').notNull(),
    descripcion: t.text('descripcion'),
    stock_minimo: t.integer('stock_minimo').notNull(),
    categoria: t.text('categoria').notNull(),
    activo: t.integer('activo', { mode: 'boolean' }).notNull().default(true),
    fecha_creacion: t.text().default(sql`(CURRENT_TIMESTAMP)`),
    fecha_actualizacion: t.text().default(sql`(CURRENT_TIMESTAMP)`),
    fecha_eliminacion: t.text('fecha_eliminacion')
},
    (table) => [
        t.index('categoria_idx').on(table.categoria),
    ]
)

export const ventas = t.sqliteTable('ventas', {
    id: t.integer('id').primaryKey({ autoIncrement: true }),
    producto_id: t.integer('producto_id').references(() => productos.id).notNull(),
    cantidad: t.integer('cantidad').notNull(),
    precio_venta: t.integer('precio_venta').notNull(),
    ganancia: t.integer('ganancia').notNull(),
    fecha_venta: t.text().default(sql`(CURRENT_TIMESTAMP)`),
},
    (table) => [
        t.index('idx_ventas_producto').on(table.producto_id),
        t.index('idx_ventas_fecha').on(table.fecha_venta),
    ]
)

export const movimientos = t.sqliteTable('movimientos', {
    id: t.integer('id').primaryKey({ autoIncrement: true }),
    producto_id: t.integer('producto_id').references(() => productos.id).notNull(),
    tipo: t.text('tipo').notNull(),
    cantidad: t.integer('cantidad').notNull(),
    stock_anterior: t.integer('stock_anterior').notNull(),
    stock_nuevo: t.integer('stock_nuevo').notNull(),
    motivo: t.text('motivo'),
    fecha: t.text().default(sql`(CURRENT_TIMESTAMP)`),
},
    (table) => [
        t.index('idx_movimientos_producto').on(table.producto_id),
        t.index('idx_movimientos_fecha').on(table.fecha),
    ]
)

export const movimientosRelations = relations(movimientos, ({ one }) => ({
    producto: one(productos, {
        fields: [movimientos.producto_id],
        references: [productos.id],
    }),
}))
