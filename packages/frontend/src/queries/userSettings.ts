import {
	type TableRecordLimit,
	type TableViewPreferences,
	USER_SETTINGS_COLLECTION,
	type UserSettings,
} from "@gsuite/shared"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { doc, getDoc, setDoc } from "firebase/firestore"

import { useAuth } from "@/frontend/hooks/useAuth"
import { getFirebaseDb } from "@/frontend/lib/firebase"
import { emptyUserSettings, parseUserSettings } from "@/frontend/lib/tableView"

export const USER_SETTINGS_QUERY_KEY = "userSettings"

async function fetchUserSettings(uid: string): Promise<UserSettings> {
	const snapshot = await getDoc(doc(getFirebaseDb(), USER_SETTINGS_COLLECTION, uid))
	if(!snapshot.exists()) return emptyUserSettings()
	return parseUserSettings(snapshot.data())
}

export function useUserSettingsQuery() {
	const { user } = useAuth()
	const uid = user?.uid
	return useQuery({
		queryKey: [USER_SETTINGS_QUERY_KEY, uid],
		queryFn: () => {
			if(!uid) throw new Error("You must be signed in")
			return fetchUserSettings(uid)
		},
		enabled: Boolean(uid),
	})
}

export interface SaveTableViewPreferencesInput {
	viewId: string
	visibleColumnIds: string[]
	recordLimit: TableRecordLimit
}

async function saveTableViewPreferences(
	uid: string,
	input: SaveTableViewPreferencesInput,
	currentSettings: UserSettings,
): Promise<UserSettings> {
	const viewPreferences: TableViewPreferences = {
		visibleColumnIds: input.visibleColumnIds,
		recordLimit: input.recordLimit,
	}
	const nextSettings: UserSettings = {
		...currentSettings,
		tableViews: {
			...currentSettings.tableViews,
			[input.viewId]: viewPreferences,
		},
		updatedAt: new Date().toISOString(),
	}

	await setDoc(
		doc(getFirebaseDb(), USER_SETTINGS_COLLECTION, uid),
		{
			tableViews: {
				[input.viewId]: viewPreferences,
			},
			defaultTableRecordLimit: nextSettings.defaultTableRecordLimit,
			updatedAt: nextSettings.updatedAt,
		},
		{ merge: true },
	)

	return nextSettings
}

export function useSaveTableViewPreferencesMutation() {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const uid = user?.uid

	return useMutation({
		mutationFn: async (input: SaveTableViewPreferencesInput) => {
			if(!uid) throw new Error("You must be signed in")
			const currentSettings = queryClient.getQueryData<UserSettings>([USER_SETTINGS_QUERY_KEY, uid])
				?? await fetchUserSettings(uid)
			return saveTableViewPreferences(uid, input, currentSettings)
		},
		onSuccess: async (settings) => {
			if(!uid) return
			queryClient.setQueryData([USER_SETTINGS_QUERY_KEY, uid], settings)
			await queryClient.invalidateQueries({ queryKey: [USER_SETTINGS_QUERY_KEY, uid] })
		},
	})
}
