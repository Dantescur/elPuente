import { db, schema } from 'hub:db'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const productos = await db.query.productos.findMany({
      where: eq(schema.productos.activo, false),
      orderBy: [desc(schema.productos.fecha_eliminacion)]
    })

    return {
      success: true,
      data: productos
    }
  } catch (error) {
    console.error('[productos] Error al obtener productos eliminados:', error)
    throw createError({
      statusCode: 500,
      message: 'Error al obtener productos eliminados'
    })
  }
})
