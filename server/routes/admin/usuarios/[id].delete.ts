import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))

    if (!Number.isInteger(id) || id <= 0) {
        throw createError({ statusCode: 400, message: 'ID inválido' })
    }

    const [updated] = await db.update(schema.usuarios)
        .set({ activo: false })
        .where(eq(schema.usuarios.id, id))
        .returning()

    if (!updated) {
        throw createError({ statusCode: 404, message: 'Usuario no encontrado' })
    }

    return { success: true }
})
