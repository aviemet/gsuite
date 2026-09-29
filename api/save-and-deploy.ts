import { createVercelHandler, saveAndDeployHandler } from "@gsuite/api"

export default createVercelHandler({
	methods: ["POST"],
	handler: saveAndDeployHandler,
})
