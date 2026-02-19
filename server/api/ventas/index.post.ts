import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

interface VentaInput {
  productoId: number
  cantidad: number
  motivo?: string
}

function validarVenta(venta: VentaInput, index: number): void {
  if (!Number.isInteger(venta.productoId) || venta.productoId <= 0) {
    throw createError({ statusCode: 400, message: `Venta[${index}]: productoId inválido` })
  }
  if (!Number.isInteger(venta.cantidad) || venta.cantidad <= 0) {
    throw createError({ statusCode: 400, message: `Venta[${index}]: cantidad debe ser un entero positivo` })
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const ventas: VentaInput[] = Array.isArray(body) ? body : [body]

  if (ventas.length === 0) {
    throw createError({ statusCode: 400, message: 'Debe incluir al menos una venta' })
  }

  ventas.forEach((v, i) => validarVenta(v, i))

  const resultados: Array<{
    id: number
    producto: string
    cantidad: number
    subtotal: number
    ganancia: number
  }> = []

  let totalGanancias = 0
  let totalVenta = 0

  try {
    await db.transaction(async (tx) => {
      for (const venta of ventas) {
        const producto = await tx.query.productos.findFirst({
          where: eq(schema.productos.id, venta.productoId)
        })

        if (!producto) {
          throw createError({
            statusCode: 404,
            message: `Producto ${venta.productoId} no encontrado`
          })
        }

        if (!producto.activo) {
          throw createError({
            statusCode: 400,
            message: `El producto "${producto.nombre}" no está disponible`
          })
        }

        if (producto.stock < venta.cantidad) {
          throw createError({
            statusCode: 409,
            message: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`
          })
        }

        const ganancia = (producto.precio_venta - producto.costo) * venta.cantidad
        const subtotal = producto.precio_venta * venta.cantidad

        const ventasInsertadas = await tx.insert(schema.ventas).values({
          producto_id: venta.productoId,
          cantidad: venta.cantidad,
          precio_venta: producto.precio_venta,
          ganancia
        }).returning()

        const nuevaVenta = ventasInsertadas[0]
        if (!nuevaVenta) {
          throw createError({ statusCode: 500, message: 'Error al registrar la venta' })
        }

        await tx.update(schema.productos)
          .set({
            stock: producto.stock - venta.cantidad,
            fecha_actualizacion: new Date().toISOString()
          })
          .where(eq(schema.productos.id, venta.productoId))

        await tx.insert(schema.movimientos).values({
          producto_id: venta.productoId,
          tipo: 'salida',
          cantidad: venta.cantidad,
          stock_anterior: producto.stock,
          stock_nuevo: producto.stock - venta.cantidad,
          motivo: venta.motivo || 'Venta'
        })

        resultados.push({ id: nuevaVenta.id, producto: producto.nombre, cantidad: venta.cantidad, subtotal, ganancia })
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
    if (error instanceof Error && 'statusCode' in error) throw error

    console.error('[ventas] Error en transacción:', error)
    throw createError({
      statusCode: 500,
      message: 'Error interno al procesar la venta'
    })
  }
})
