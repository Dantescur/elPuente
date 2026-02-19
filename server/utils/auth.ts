import type { H3Event } from "#imports"

export function requireRole(event: H3Event, roles: string[]) {
  const session = event.context.session

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  if (!roles.includes(session.user.rol)) {
    throw createError({ statusCode: 403, message: 'No autorizado' })
  }

  return session.user
}
