import { notifications } from "@mantine/notifications"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
	notifyDeployError,
	notifyDeploySuccess,
} from "@/frontend/features/signatures/notifyDeployResult"

vi.mock("@mantine/notifications", () => ({
	notifications: {
		show: vi.fn(),
	},
}))

describe("notifyDeployResult", () => {
	beforeEach(() => {
		vi.mocked(notifications.show).mockClear()
	})

	it("shows a yellow notice when nobody resolves to the template", () => {
		notifyDeploySuccess(0)

		expect(notifications.show).toHaveBeenCalledWith({
			color: "yellow",
			message: "No users currently resolve to this signature",
		})
	})

	it("shows a green notice with the queued user count", () => {
		notifyDeploySuccess(2)

		expect(notifications.show).toHaveBeenCalledWith({
			color: "green",
			message: "Signature queued for deploy to 2 users",
		})
	})

	it("shows the error message when deploy fails", () => {
		notifyDeployError(new Error("Template not found"))

		expect(notifications.show).toHaveBeenCalledWith({
			color: "red",
			message: "Template not found",
		})
	})
})
