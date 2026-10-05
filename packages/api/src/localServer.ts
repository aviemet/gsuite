import { getAdminFirestore } from "./firebase/admin"
import { createLocalApiServer } from "./http"
import { apiRoutes } from "./routes"
import { ensureEmulatorTenant } from "./workspace/emulatorSeed"

const port = Number(process.env.API_PORT ?? 3000)

await ensureEmulatorTenant(getAdminFirestore())

const server = createLocalApiServer({
	port,
	routes: apiRoutes,
})

await server.listen()
