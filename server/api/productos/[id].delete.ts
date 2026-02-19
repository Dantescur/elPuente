import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'
import { requireRole } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, ['admin'])

  const id = Number(getRouterParam(event, 'id'))

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID inválido'
    })
  }

  const producto = await db.query.productos.findFirst({
    where: eq(schema.productos.id, id)
  })

  if (!producto) {
    throw createError({
      statusCode: 404,
      message: 'Producto no encontrado'
    })
  }

  if (!producto.activo) {
    throw createError({
      statusCode: 400,
      message: 'El producto ya está eliminado'
    })
  }

  const [productoActualizado] = await db
    .update(schema.productos)
    .set({
      activo: false,
      fecha_eliminacion: new Date().toISOString()
    })
    .where(eq(schema.productos.id, id))
    .returning()

  return {
    success: true,
    data: productoActualizado
  }
})
