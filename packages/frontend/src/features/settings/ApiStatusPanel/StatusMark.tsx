import { IconCircle, IconCircleCheck, IconCircleX, IconLoader2 } from "@tabler/icons-react"

import * as classes from "./ApiStatusPanel.css"
import { type ApiStatusRowState } from "./apiStatusRows"

const statusIcons = {
	idle: IconCircle,
	checking: IconLoader2,
	success: IconCircleCheck,
	error: IconCircleX,
} as const

interface StatusMarkProps {
	state: ApiStatusRowState
}

export function StatusMark({ state }: StatusMarkProps) {
	const Icon = statusIcons[state]
	return (
		<span className={ classes.mark } data-state={ state } aria-hidden>
			<Icon className={ classes.glyph } size={ 22 } stroke={ 1.75 } />
		</span>
	)
}
