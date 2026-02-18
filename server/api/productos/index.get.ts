import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async () => {

  try {
    const products = await db.query.productos.findMany({
      where: eq(schema.productos.activo, true),
      orderBy: (p, { asc }) => [asc(p.nombre)]
    })

    return {
      success: true,
      data: products
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Error al obtener los productos',
      data: error
    })
  }

})
