import { db, schema } from 'hub:db'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
    const productos = await db.query.productos.findMany({
        where: eq(schema.productos.activo, false),
        orderBy: [desc(schema.productos.fecha_eliminacion)]
    })

    return {
        success: true,
        data: productos
    }
})
