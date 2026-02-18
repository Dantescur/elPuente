import { db, schema } from 'hub:db'
import { desc, eq, and, gte, lte } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const filters = []

    if (query.producto_id) {
        filters.push(eq(schema.movimientos.producto_id, Number(query.producto_id)))
    }

    if (query.tipo) {
        filters.push(eq(schema.movimientos.tipo, query.tipo as string))
    }

    if (query.fecha_desde) {
        filters.push(gte(schema.movimientos.fecha, query.fecha_desde as string))
    }

    if (query.fecha_hasta) {
        filters.push(lte(schema.movimientos.fecha, query.fecha_hasta as string))
    }

    try {
        const movimientos = await db.query.movimientos.findMany({
            where: filters.length ? and(...filters) : undefined,
            orderBy: [desc(schema.movimientos.fecha)],
            with: {
                producto: true
            }
        })

        return {
            success: true,
            data: movimientos
        }
    } catch (error) {
        console.error(error)

        throw createError({
            statusCode: 500,
            message: 'Error al obtener movimientos'
        })
    }
})