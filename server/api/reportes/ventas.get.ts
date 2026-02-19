import { db, schema } from 'hub:db'
import { sql, and, eq, gte, lte } from 'drizzle-orm'

function parseDate(value: unknown, fallback: Date): string {
  if (!value) return fallback.toISOString().split('T')[0]
  const d = new Date(value as string)
  if (isNaN(d.getTime())) throw createError({ statusCode: 400, message: `Fecha inválida: ${value}` })
  return d.toISOString().split('T')[0]
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

    const fechaInicio = parseDate(query.fechaInicio, inicioMes)
    const fechaFin = parseDate(query.fechaFin, hoy)

    const condicionesVentas = [
      gte(schema.ventas.fecha_venta, fechaInicio),
      lte(schema.ventas.fecha_venta, fechaFin),
      ...(query.productoId ? [eq(schema.ventas.producto_id, Number(query.productoId))] : []),
      ...(query.categoria ? [eq(schema.productos.categoria, query.categoria as string)] : [])
    ]

    // All 3 queries run concurrently
    const [ventas, totalesRaw, ventasPorDia] = await Promise.all([

      // Ventas detalladas
      db.select({
        id: schema.ventas.id,
        producto_id: schema.ventas.producto_id,
        producto: schema.productos.nombre,
        categoria: schema.productos.categoria,
        cantidad: schema.ventas.cantidad,
        precio_venta: schema.ventas.precio_venta,
        ganancia: schema.ventas.ganancia,
        fecha: schema.ventas.fecha_venta,
        subtotal: sql<number>`${schema.ventas.cantidad} * ${schema.ventas.precio_venta}`
      })
        .from(schema.ventas)
        .innerJoin(schema.productos, eq(schema.ventas.producto_id, schema.productos.id))
        .where(and(...condicionesVentas))
        .orderBy(sql`${schema.ventas.fecha_venta} DESC`),

      // Totales agregados
      db.select({
        cantidad_ventas: sql<number>`COUNT(*)`,
        unidades_vendidas: sql<number>`SUM(${schema.ventas.cantidad})`,
        ingresos_totales: sql<number>`SUM(${schema.ventas.cantidad} * ${schema.ventas.precio_venta})`,
        ganancia_total: sql<number>`SUM(${schema.ventas.ganancia})`,
        ticket_promedio: sql<number>`AVG(${schema.ventas.cantidad} * ${schema.ventas.precio_venta})`
      })
        .from(schema.ventas)
        .innerJoin(schema.productos, eq(schema.ventas.producto_id, schema.productos.id))
        .where(and(...condicionesVentas)),

      // Ventas por día para gráfico
      db.select({
        fecha: sql<string>`DATE(${schema.ventas.fecha_venta})`,
        ventas: sql<number>`COUNT(*)`,
        ingresos: sql<number>`SUM(${schema.ventas.cantidad} * ${schema.ventas.precio_venta})`,
        ganancias: sql<number>`SUM(${schema.ventas.ganancia})`
      })
        .from(schema.ventas)
        .innerJoin(schema.productos, eq(schema.ventas.producto_id, schema.productos.id))
        .where(and(...condicionesVentas))
        .groupBy(sql`DATE(${schema.ventas.fecha_venta})`)
        .orderBy(sql`DATE(${schema.ventas.fecha_venta})`)
    ])

    const totalesDefault = {
      cantidad_ventas: 0,
      unidades_vendidas: 0,
      ingresos_totales: 0,
      ganancia_total: 0,
      ticket_promedio: 0
    }

    return {
      success: true,
      data: {
        ventas,
        totales: totalesRaw[0] ?? totalesDefault,
        ventas_por_dia: ventasPorDia,
        periodo: { inicio: fechaInicio, fin: fechaFin },
        filtros: {
          productoId: query.productoId || null,
          categoria: query.categoria || null
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error

    console.error('[reportes] Error al generar reporte de ventas:', error)
    throw createError({
      statusCode: 500,
      message: 'Error al generar reporte de ventas'
    })
  }
})
