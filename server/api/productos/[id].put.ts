import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

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
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    try {
        // Verificar que el producto existe
        const productoExistente = await db.query.productos.findFirst({
            where: eq(schema.productos.id, Number(id))
        })

        if (!productoExistente) {
            throw createError({
                statusCode: 404,
                message: 'Producto no encontrado'
            })
        }

        // Preparar datos para actualizar
        const datosActualizar: ProductoUpdate = {
            fecha_actualizacion: new Date().toISOString()
        }

        if (body.nombre) datosActualizar.nombre = body.nombre
        if (body.costo) datosActualizar.costo = body.costo
        if (body.precio_venta) datosActualizar.precio_venta = body.precio_venta
        if (body.stock !== undefined) datosActualizar.stock = body.stock
        if (body.stock_minimo) datosActualizar.stock_minimo = body.stock_minimo
        if (body.categoria) datosActualizar.categoria = body.categoria
        if (body.descripcion !== undefined) datosActualizar.descripcion = body.descripcion

        // Validar precios
        const nuevoCosto = body.costo || productoExistente.costo
        const nuevoPrecioVenta = body.precio_venta || productoExistente.precio_venta

        if (nuevoCosto >= nuevoPrecioVenta) {
            throw createError({
                statusCode: 400,
                message: 'El precio de venta debe ser mayor al costo'
            })
        }

        // Actualizar producto
        const [productoActualizado] = await db.update(schema.productos)
            .set(datosActualizar)
            .where(eq(schema.productos.id, Number(id)))
            .returning()

        // Registrar movimiento si cambió el stock
        if (body.stock !== undefined && body.stock !== productoExistente.stock) {
            await db.insert(schema.movimientos).values({
                producto_id: Number(id),
                tipo: 'ajuste',
                cantidad: body.stock - productoExistente.stock,
                stock_anterior: productoExistente.stock,
                stock_nuevo: body.stock,
                motivo: body.motivo || 'Ajuste de inventario'
            })
        }

        return {
            success: true,
            data: productoActualizado
        }
    } catch (error) {
        throw createError({
            statusCode: error instanceof H3Error ? error.statusCode : 500,
            message: error instanceof H3Error ? error.message : 'Error al actualizar el producto'
        })
    }
})