import { db, schema } from 'hub:db'
import { sql, desc, eq, and, gte, lte } from 'drizzle-orm'

export default defineEventHandler(async () => {
    try {
        // Ventas del día
        const hoy = new Date().toISOString().split('T')[0]

        const ventasHoy = await db.select({
            total_ventas: sql<number>`COUNT(*)`,
            ingresos: sql<number>`SUM(cantidad * precio_venta)`,
            ganancias: sql<number>`SUM(ganancia)`
        })
            .from(schema.ventas)
            .where(sql`DATE(fecha_venta) = ${hoy}`)

        // Productos con stock bajo
        const stockBajo = await db.query.productos.findMany({
            where: sql`stock <= stock_minimo`,
            orderBy: (productos) => [productos.stock]
        })

        // Top productos más vendidos
        const topProductos = await db.select({
            id: schema.productos.id,
            nombre: schema.productos.nombre,
            total_vendido: sql<number>`SUM(ventas.cantidad)`,
            ganancia_total: sql<number>`SUM(ventas.ganancia)`,
            ingresos: sql<number>`SUM(ventas.cantidad * ventas.precio_venta)`
        })
            .from(schema.ventas)
            .innerJoin(schema.productos, eq(schema.ventas.producto_id, schema.productos.id))
            .groupBy(schema.ventas.producto_id)
            .orderBy(desc(sql`SUM(ventas.cantidad)`))
            .limit(5)

        // Valor total del inventario
        const valorInventario = await db.select({
            valor_costo: sql<number>`SUM(stock * costo)`,
            valor_venta: sql<number>`SUM(stock * precio_venta)`,
            ganancia_potencial: sql<number>`SUM(stock * (precio_venta - costo))`
        })
            .from(schema.productos)

        // Totales del mes
        const inicioMes = new Date()
        inicioMes.setDate(1)
        const finMes = new Date()
        finMes.setMonth(finMes.getMonth() + 1)
        finMes.setDate(0)

        const inicioMesStr = inicioMes.toISOString().split('T')[0] || ''
        const finMesStr = finMes.toISOString().split('T')[0] || ''

        const ventasMes = await db.select({
            total: sql<number>`SUM(cantidad * precio_venta)`,
            ganancias: sql<number>`SUM(ganancia)`
        })
            .from(schema.ventas)
            .where(
                and(
                    gte(schema.ventas.fecha_venta, inicioMesStr),
                    lte(schema.ventas.fecha_venta, finMesStr)
                )
            )

        return {
            success: true,
            data: {
                ventas_hoy: ventasHoy[0] || { total_ventas: 0, ingresos: 0, ganancias: 0 },
                stock_bajo: stockBajo,
                top_productos: topProductos,
                valor_inventario: valorInventario[0] || { valor_costo: 0, valor_venta: 0, ganancia_potencial: 0 },
                ventas_mes: ventasMes[0] || { total: 0, ganancias: 0 },
                fecha: new Date().toISOString()
            }
        }
    } catch (error) {
        console.error('Error en dashboard:', error)
        throw createError({
            statusCode: 500,
            message: 'Error al obtener resumen del dashboard'
        })
    }
})