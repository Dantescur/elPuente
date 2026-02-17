import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/sqlite-core";

export const productos = t.sqliteTable('productos', {
    id: t.integer('id').primaryKey({ autoIncrement: true }),
    nombre: t.text('nombre').notNull(),
    costo: t.real('costo').notNull(),
    precio_venta: t.real('precio_venta').notNull(),
    stock: t.integer('stock').notNull(),
    descripcion: t.text('descripcion'),
    stock_minimo: t.integer('stock_minimo').notNull(),
    categoria: t.text('categoria').notNull(),
    fecha_creacion: t.text().default(sql`(CURRENT_TIMESTAMP)`),
    fecha_actualizacion: t.text().default(sql`(CURRENT_TIMESTAMP)`),
})

export const ventas = t.sqliteTable('ventas', {
    id: t.integer('id').primaryKey({ autoIncrement: true }),
    producto_id: t.integer('producto_id').references(() => productos.id).notNull(),
    cantidad: t.integer('cantidad').notNull(),
    precio_venta: t.real('precio_venta').notNull(),
    ganancia: t.real('ganancia').notNull(),
    fecha_venta: t.text().default(sql`(CURRENT_TIMESTAMP)`),
})

export const movimientos = t.sqliteTable('movimientos', {
    id: t.integer('id').primaryKey({ autoIncrement: true }),
    producto_id: t.integer('producto_id').references(() => productos.id).notNull(),
    tipo: t.text('tipo').notNull(),
    cantidad: t.integer('cantidad').notNull(),
    stock_anterior: t.integer('stock_anterior').notNull(),
    stock_nuevo: t.integer('stock_nuevo').notNull(),
    motivo: t.text('motivo'),
    fecha: t.text().default(sql`(CURRENT_TIMESTAMP)`),
})