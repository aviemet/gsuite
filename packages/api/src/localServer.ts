import { createLocalApiServer } from "./http"
import { apiRoutes } from "./routes"

const port = Number(process.env.API_PORT ?? 3000)

const server = createLocalApiServer({
	port,
	routes: apiRoutes,
})

await server.listen()
