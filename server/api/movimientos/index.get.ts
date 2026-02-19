import { db, schema } from 'hub:db'
import { TIPO_MOVIMIENTO } from '../../db/schema'
import { desc, eq, and, gte, lte } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // ✅ Validate `tipo` against known enum values
  if (query.tipo && !TIPO_MOVIMIENTO.includes(query.tipo as typeof TIPO_MOVIMIENTO[number])) {
    throw createError({
      statusCode: 400,
      message: `Tipo inválido. Valores permitidos: ${TIPO_MOVIMIENTO.join(', ')}`
    })
  }

  // ✅ Validate producto_id is a positive integer
  if (query.producto_id !== undefined) {
    const pid = Number(query.producto_id)
    if (!Number.isInteger(pid) || pid <= 0) {
      throw createError({ statusCode: 400, message: 'producto_id debe ser un entero positivo' })
    }
  }

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
    console.error('[movimientos] Error al obtener movimientos:', error)

    throw createError({
      statusCode: 500,
      message: 'Error al obtener movimientos'
    })
  }
})
