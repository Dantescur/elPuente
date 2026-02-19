export default defineNuxtRouteMiddleware((to) => {

    const { loggedIn } = useUserSession()

    if (to.path === '/login') {
        // Already logged in → redirect to dashboard
        if (loggedIn.value) return navigateTo('/')
        return
    }

    // Any other route → must be authenticated
    if (!loggedIn.value) {
        return navigateTo('/login')
    }
})