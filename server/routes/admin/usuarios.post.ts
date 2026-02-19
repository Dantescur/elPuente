import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { username, password, rol } = body

  if (!username || !password || !rol) {
    throw createError({
      statusCode: 400,
      message: 'username, password y rol son requeridos'
    })
  }

  // Validar rol
  const rolesValidos = ['admin', 'dependiente', 'sponsor']
  if (!rolesValidos.includes(rol)) {
    throw createError({
      statusCode: 400,
      message: `Rol inválido. Permitidos: ${rolesValidos.join(', ')}`
    })
  }

  const existente = await db.query.usuarios.findFirst({
    where: eq(schema.usuarios.username, username)
  })

  if (existente) {
    throw createError({
      statusCode: 409,
      message: 'El usuario ya existe'
    })
  }

  const hash = await hashPassword(password)

  const [nuevo] = await db.insert(schema.usuarios).values({
    username,
    password_hash: hash,
    rol,
    activo: true
  }).returning()

  if (!nuevo) {
    throw createError({
      statusCode: 500,
      message: 'Error al crear el usuario'
    })
  }

  return {
    success: true,
    data: {
      id: nuevo.id,
      username: nuevo.username,
      rol: nuevo.rol
    }
  }
})
