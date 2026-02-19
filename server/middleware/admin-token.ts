export default defineEventHandler((event) => {
    const path = event.path

    if (!path.startsWith('/admin/')) return

    const token = getHeader(event, 'x-api-token')
    const validToken = process.env.ADMIN_API_TOKEN

    if (!validToken) {
        console.error('[admin] ADMIN_API_TOKEN not configured')
        throw createError({ statusCode: 500, message: 'Server misconfigured' })
    }

    if (!token || token !== validToken) {
        throw createError({
            statusCode: 401,
            message: 'Invalid API token'
        })
    }
})
