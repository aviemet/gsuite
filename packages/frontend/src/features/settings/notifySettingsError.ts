import { notifications } from "@mantine/notifications"

export function notifySettingsSuccess(message: string) {
	notifications.show({ color: "green", message })
}

export function notifySettingsError(error: unknown, fallback: string) {
	notifications.show({
		color: "red",
		message: error instanceof Error ? error.message : fallback,
	})
}
