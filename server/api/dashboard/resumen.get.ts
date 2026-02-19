import { db, schema } from 'hub:db'
import { sql, desc, eq, and, gte, lte } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const hoy = new Date().toISOString().split('T')[0]

    // Calculate first and last day of current month
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0) // Last day of month

    const inicioMesStr = inicioMes.toISOString().split('T')[0]
    const finMesStr = finMes.toISOString().split('T')[0]

    // Validate that dates are defined (they will be, but TypeScript needs assurance)
    if (!inicioMesStr || !finMesStr) {
      throw new Error('Error calculating date ranges')
    }

    const [ventasHoy, stockBajo, topProductos, valorInventario, ventasMes] = await Promise.all([

      // Ventas del día
      db.select({
        total_ventas: sql<number>`COUNT(*)`,
        ingresos: sql<number>`SUM(${schema.ventas.cantidad} * ${schema.ventas.precio_venta})`,
        ganancias: sql<number>`SUM(${schema.ventas.ganancia})`
      })
        .from(schema.ventas)
        .where(sql`DATE(${schema.ventas.fecha_venta}) = ${hoy}`),

      db.query.productos.findMany({
        where: (productos, { lte, eq }) => and(
          eq(productos.activo, true),
          lte(productos.stock, productos.stock_minimo)
        ),
        orderBy: (productos) => [productos.stock]
      }),

      // Top 5 productos más vendidos (todos los tiempos)
      db.select({
        id: schema.productos.id,
        nombre: schema.productos.nombre,
        total_vendido: sql<number>`SUM(${schema.ventas.cantidad})`,
        ganancia_total: sql<number>`SUM(${schema.ventas.ganancia})`,
        ingresos: sql<number>`SUM(${schema.ventas.cantidad} * ${schema.ventas.precio_venta})`
      })
        .from(schema.ventas)
        .innerJoin(schema.productos, eq(schema.ventas.producto_id, schema.productos.id))
        .groupBy(schema.ventas.producto_id, schema.productos.id, schema.productos.nombre)
        .orderBy(desc(sql`SUM(${schema.ventas.cantidad})`))
        .limit(5),

      // Valor total del inventario (solo productos activos)
      db.select({
        valor_costo: sql<number>`SUM(${schema.productos.stock} * ${schema.productos.costo})`,
        valor_venta: sql<number>`SUM(${schema.productos.stock} * ${schema.productos.precio_venta})`,
        ganancia_potencial: sql<number>`SUM(${schema.productos.stock} * (${schema.productos.precio_venta} - ${schema.productos.costo}))`
      })
        .from(schema.productos)
        .where(eq(schema.productos.activo, true)),

      // Totales del mes
      db.select({
        total: sql<number>`SUM(${schema.ventas.cantidad} * ${schema.ventas.precio_venta})`,
        ganancias: sql<number>`SUM(${schema.ventas.ganancia})`
      })
        .from(schema.ventas)
        .where(
          and(
            gte(schema.ventas.fecha_venta, inicioMesStr),
            lte(schema.ventas.fecha_venta, finMesStr)
          )
        )
    ])

    return {
      success: true,
      data: {
        ventas_hoy: ventasHoy[0] ?? { total_ventas: 0, ingresos: 0, ganancias: 0 },
        stock_bajo: stockBajo,
        top_productos: topProductos,
        valor_inventario: valorInventario[0] ?? { valor_costo: 0, valor_venta: 0, ganancia_potencial: 0 },
        ventas_mes: ventasMes[0] ?? { total: 0, ganancias: 0 },
        fecha: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('[dashboard] Error al obtener resumen:', error)
    throw createError({
      statusCode: 500,
      message: 'Error al obtener resumen del dashboard'
    })
  }
})
