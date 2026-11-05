import { Image } from "@mantine/core"
import clsx from "clsx"

interface BrandLogoProps {
	className?: string
	size?: number
}

export function BrandLogo({ className, size = 28 }: BrandLogoProps) {
	return (
		<Image
			src="/suiteocean-logo.png"
			alt=""
			width={ size }
			height={ size }
			decoding="async"
			aria-hidden
			className={ clsx(className) }
		/>
	)
}
