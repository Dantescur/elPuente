import { db, schema } from 'hub:db'
import { sql, and, eq, gte, lte, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    try {
        // Parsear fechas
        const fechaInicio: string = query.fechaInicio
            ? new Date(query.fechaInicio as string).toISOString().split('T')[0]
            : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

        const fechaFin: string = query.fechaFin
            ? new Date(query.fechaFin as string).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]

        // Construir condiciones BASE (sin categoría)
        const condicionesBase = [
            gte(schema.ventas.fecha_venta, fechaInicio),
            lte(schema.ventas.fecha_venta, fechaFin)
        ]

        if (query.productoId) {
            condicionesBase.push(eq(schema.ventas.producto_id, Number(query.productoId)))
        }

        // Si hay filtro de categoría, necesitamos obtener los IDs de productos de esa categoría
        let productosIds: number[] | undefined
        const condicionesConCategoria = [...condicionesBase]

        if (query.categoria) {
            // Obtener todos los productos de la categoría
            const productos = await db.query.productos.findMany({
                where: eq(schema.productos.categoria, query.categoria as string),
                columns: { id: true }
            })

            productosIds = productos.map(p => p.id)

            if (productosIds.length === 0) {
                // Si no hay productos en esa categoría, retornar vacío
                return {
                    success: true,
                    data: {
                        ventas: [],
                        totales: {
                            cantidad_ventas: 0,
                            unidades_vendidas: 0,
                            ingresos_totales: 0,
                            ganancia_total: 0,
                            ticket_promedio: 0
                        },
                        ventas_por_dia: [],
                        periodo: { inicio: fechaInicio, fin: fechaFin },
                        filtros: { productoId: query.productoId || null, categoria: query.categoria }
                    }
                }
            }

            condicionesConCategoria.push(inArray(schema.ventas.producto_id, productosIds))
        }

        // Obtener ventas del período (con JOIN para incluir datos del producto)
        const ventas = await db.select({
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
            .where(and(...condicionesConCategoria))
            .orderBy(sql`${schema.ventas.fecha_venta} DESC`)

        // Calcular totales (usando subquery para aplicar el filtro de categoría)
        const baseQuery = db.select({
            cantidad_ventas: sql<number>`COUNT(*)`,
            unidades_vendidas: sql<number>`SUM(${schema.ventas.cantidad})`,
            ingresos_totales: sql<number>`SUM(${schema.ventas.cantidad} * ${schema.ventas.precio_venta})`,
            ganancia_total: sql<number>`SUM(${schema.ventas.ganancia})`,
            ticket_promedio: sql<number>`AVG(${schema.ventas.cantidad} * ${schema.ventas.precio_venta})`
        })
            .from(schema.ventas)

        // Aplicar condiciones a totales
        const totalesQuery = query.categoria && productosIds
            ? baseQuery.where(
                and(
                    ...condicionesBase,
                    inArray(schema.ventas.producto_id, productosIds)
                )
            )
            : baseQuery.where(and(...condicionesBase))

        const totales = await totalesQuery

        // Ventas por día para gráfico
        const baseDiaQuery = db.select({
            fecha: sql<string>`DATE(${schema.ventas.fecha_venta})`,
            ventas: sql<number>`COUNT(*)`,
            ingresos: sql<number>`SUM(${schema.ventas.cantidad} * ${schema.ventas.precio_venta})`,
            ganancias: sql<number>`SUM(${schema.ventas.ganancia})`
        })
            .from(schema.ventas)

        // Aplicar condiciones a ventas por día
        const ventasPorDiaQuery = query.categoria && productosIds
            ? baseDiaQuery.where(
                and(
                    ...condicionesBase,
                    inArray(schema.ventas.producto_id, productosIds)
                )
            )
            : baseDiaQuery.where(and(...condicionesBase))

        const ventasPorDia = await ventasPorDiaQuery
            .groupBy(sql`DATE(${schema.ventas.fecha_venta})`)
            .orderBy(sql`DATE(${schema.ventas.fecha_venta})`)

        return {
            success: true,
            data: {
                ventas,
                totales: totales[0] || {
                    cantidad_ventas: 0,
                    unidades_vendidas: 0,
                    ingresos_totales: 0,
                    ganancia_total: 0,
                    ticket_promedio: 0
                },
                ventas_por_dia: ventasPorDia,
                periodo: {
                    inicio: fechaInicio,
                    fin: fechaFin
                },
                filtros: {
                    productoId: query.productoId || null,
                    categoria: query.categoria || null
                }
            }
        }
    } catch (error) {
        console.error('Error en reporte:', error)
        throw createError({
            statusCode: 500,
            message: 'Error al generar reporte de ventas'
        })
    }
})