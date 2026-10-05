import { createVercelHandler, directoryHandler } from "@gsuite/api"

export default createVercelHandler({
	methods: ["GET"],
	handler: directoryHandler,
})
