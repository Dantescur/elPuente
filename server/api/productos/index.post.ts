import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Validaciones
    if (!body.nombre || !body.costo || !body.precio_venta || !body.categoria) {
        throw createError({
            statusCode: 400,
            message: 'Faltan campos requeridos: nombre, costo, precio_venta, categoria'
        })
    }

    if (body.costo >= body.precio_venta) {
        throw createError({
            statusCode: 400,
            message: 'El precio de venta debe ser mayor al costo'
        })
    }

    try {
        const [nuevoProducto] = await db.insert(schema.productos).values({
            nombre: body.nombre,
            costo: body.costo,
            precio_venta: body.precio_venta,
            stock: body.stock || 0,
            stock_minimo: body.stock_minimo || 5,
            categoria: body.categoria,
            descripcion: body.descripcion || ''
        }).returning()

        return {
            success: true,
            data: nuevoProducto
        }
    } catch (error) {
        throw createError({
            statusCode: 500,
            message: 'Error al crear el producto',
            data: error
        })
    }
})