export default defineEventHandler(async (event) => {
    const path = event.path

    if (!path.startsWith('/api/')) return

    if (path.startsWith('/api/auth/')) return

    try {
        await requireUserSession(event)
    } catch {
        throw createError({
            statusCode: 401,
            message: 'No autenticado'
        })
    }
})