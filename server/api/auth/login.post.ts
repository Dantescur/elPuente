import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)

  if (!username || !password) {
    throw createError({ statusCode: 400, message: 'Credenciales requeridas' })
  }

  const user = await db.query.usuarios.findFirst({
    where: eq(schema.usuarios.username, username)
  })

  if (!user || !user.activo) {
    throw createError({ statusCode: 401, message: 'Credenciales inválidas' })
  }

  const valid = await verifyPassword(user.password_hash, password)

  if (!valid) {
    throw createError({ statusCode: 401, message: 'Credenciales inválidas' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      username: user.username,
      rol: user.rol
    }
  })

  return { success: true }
})
