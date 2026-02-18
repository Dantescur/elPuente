import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
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

    if (producto.activo) {
        throw createError({
            statusCode: 400,
            message: 'El producto ya está activo'
        })
    }

    const [reactivado] = await db
        .update(schema.productos)
        .set({
            activo: true,
            fecha_eliminacion: null,
            fecha_actualizacion: new Date().toISOString()
        })
        .where(eq(schema.productos.id, id))
        .returning()

    return {
        success: true,
        data: reactivado
    }
})
