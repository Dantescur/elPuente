import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    try {
        // Verificar si es una venta múltiple o individual
        const ventas = Array.isArray(body) ? body : [body]
        const resultados: Array<{
            id: number
            producto: string
            cantidad: number
            subtotal: number
            ganancia: number
        }> = []

        let totalGanancias = 0
        let totalVenta = 0

        // Usar transacción
        await db.transaction(async (tx) => {
            for (const venta of ventas) {
                // Obtener producto actual
                const producto = await tx.query.productos.findFirst({
                    where: eq(schema.productos.id, venta.productoId)
                })

                if (!producto) {
                    throw new Error(`Producto ${venta.productoId} no encontrado`)
                }

                if (producto.stock < venta.cantidad) {
                    throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`)
                }

                // Calcular ganancia
                const ganancia = (producto.precio_venta - producto.costo) * venta.cantidad
                const subtotal = producto.precio_venta * venta.cantidad

                // Registrar venta
                const ventasInsertadas = await tx.insert(schema.ventas).values({
                    producto_id: venta.productoId,
                    cantidad: venta.cantidad,
                    precio_venta: producto.precio_venta,
                    ganancia: ganancia
                }).returning()

                const nuevaVenta = ventasInsertadas[0]
                if (!nuevaVenta) {
                    throw new Error('Error al registrar la venta')
                }

                // Actualizar stock
                await tx.update(schema.productos)
                    .set({
                        stock: producto.stock - venta.cantidad,
                        fecha_actualizacion: new Date().toISOString()
                    })
                    .where(eq(schema.productos.id, venta.productoId))

                // Registrar movimiento
                await tx.insert(schema.movimientos).values({
                    producto_id: venta.productoId,
                    tipo: 'salida',
                    cantidad: venta.cantidad,
                    stock_anterior: producto.stock,
                    stock_nuevo: producto.stock - venta.cantidad,
                    motivo: venta.motivo || 'Venta'
                })

                resultados.push({
                    id: nuevaVenta.id,
                    producto: producto.nombre,
                    cantidad: venta.cantidad,
                    subtotal,
                    ganancia
                })

                totalGanancias += ganancia
                totalVenta += subtotal
            }
        })

        return {
            success: true,
            data: {
                ventas: resultados,
                total: totalVenta,
                ganancia_total: totalGanancias,
                fecha: new Date().toISOString()
            }
        }
    } catch (error) {
        throw createError({
            statusCode: 400,
            message: error instanceof Error ? error.message : 'Error al procesar la venta',
            data: error
        })
    }
})