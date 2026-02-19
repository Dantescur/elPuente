import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'
import { H3Error } from 'h3'

interface ProductoUpdate {
  nombre?: string
  costo?: number
  precio_venta?: number
  stock?: number
  stock_minimo?: number
  categoria?: string
  descripcion?: string | null
  fecha_actualizacion: string
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, message: 'ID inválido' })
  }

  const body = await readBody(event)

  try {
    const productoExistente = await db.query.productos.findFirst({
      where: eq(schema.productos.id, id)
    })

    if (!productoExistente) {
      throw createError({ statusCode: 404, message: 'Producto no encontrado' })
    }

    if (!productoExistente.activo) {
      throw createError({ statusCode: 400, message: 'No se puede editar un producto eliminado' })
    }

    const datosActualizar: ProductoUpdate = {
      fecha_actualizacion: new Date().toISOString()
    }

    if (body.nombre !== undefined && body.nombre !== null) datosActualizar.nombre = body.nombre
    if (body.costo !== undefined && body.costo !== null) datosActualizar.costo = body.costo
    if (body.precio_venta !== undefined && body.precio_venta !== null) datosActualizar.precio_venta = body.precio_venta
    if (body.stock !== undefined && body.stock !== null) datosActualizar.stock = body.stock
    if (body.stock_minimo !== undefined && body.stock_minimo !== null) datosActualizar.stock_minimo = body.stock_minimo
    if (body.categoria !== undefined && body.categoria !== null) datosActualizar.categoria = body.categoria
    if (body.descripcion !== undefined) datosActualizar.descripcion = body.descripcion

    const nuevoCosto = body.costo ?? productoExistente.costo
    const nuevoPrecioVenta = body.precio_venta ?? productoExistente.precio_venta

    if (nuevoCosto >= nuevoPrecioVenta) {
      throw createError({
        statusCode: 400,
        message: 'El precio de venta debe ser mayor al costo'
      })
    }

    const productoActualizado = await db.transaction(async (tx) => {
      const [updated] = await tx.update(schema.productos)
        .set(datosActualizar)
        .where(eq(schema.productos.id, id))
        .returning()

      if (body.stock !== undefined && body.stock !== null && body.stock !== productoExistente.stock) {
        const delta = body.stock - productoExistente.stock
        const tipo = delta > 0 ? 'entrada' : 'salida'
        const motivoDefault = delta > 0 ? 'Entrada de inventario' : 'Salida de inventario'

        await tx.insert(schema.movimientos).values({
          producto_id: id,
          tipo,
          cantidad: delta,
          stock_anterior: productoExistente.stock,
          stock_nuevo: body.stock,
          motivo: body.motivo || motivoDefault
        })
      }

      return updated
    })

    return {
      success: true,
      data: productoActualizado
    }
  } catch (error) {
    // ✅ H3Error is now properly imported — instanceof check works correctly
    if (error instanceof H3Error) throw error

    console.error('[productos] Error al actualizar producto:', error)
    throw createError({
      statusCode: 500,
      message: 'Error al actualizar el producto'
    })
  }
})