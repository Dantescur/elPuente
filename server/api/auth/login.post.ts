export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)

  if (!username || !password) {
    throw createError({ statusCode: 400, message: 'Usuario y contraseña requeridos' })
  }

  const runtimeConfig = useRuntimeConfig()

  const validUsername = runtimeConfig.auth.username
  const validPassword = runtimeConfig.auth.password

  if (!validUsername || !validPassword) {
    console.error('[auth] AUTH_USERNAME / AUTH_PASSWORD env vars not set')
    throw createError({ statusCode: 500, message: 'Error de configuración del servidor' })
  }

  const usernameOk = username === validUsername
  const passwordOk = password === validPassword

  if (!usernameOk || !passwordOk) {
    throw createError({ statusCode: 401, message: 'Credenciales incorrectas' })
  }

  await setUserSession(event, {
    user: { username }
  })

  return { success: true }
})