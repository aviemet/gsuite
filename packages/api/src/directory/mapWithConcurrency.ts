export async function mapWithConcurrency<Item, Result>(
	items: readonly Item[],
	limit: number,
	mapItem: (item: Item) => Promise<Result>,
): Promise<Result[]> {
	if(items.length === 0) return []
	const results = new Array<Result>(items.length)
	let nextIndex = 0
	const workerCount = Math.min(Math.max(limit, 1), items.length)

	async function worker(): Promise<void> {
		while(nextIndex < items.length) {
			const index = nextIndex
			nextIndex += 1
			const item = items[index]
			if(item === undefined) continue
			results[index] = await mapItem(item)
		}
	}

	await Promise.all(Array.from({ length: workerCount }, () => worker()))
	return results
}
