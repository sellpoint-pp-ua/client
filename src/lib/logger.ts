const shouldLog = (): boolean => {
	try {
		if (process.env.DISABLE_SERVER_LOGS === 'true') return false
		if (process.env.NODE_ENV === 'production') return false
	} catch (e) {
	}
	return true
}

export const info = (...args: unknown[]) => {
	if (!shouldLog()) return
	console.log(...args)
}

export const warn = (...args: unknown[]) => {
	if (!shouldLog()) return
	console.warn(...args)
}

export const error = (...args: unknown[]) => {
	if (!shouldLog()) return
	console.error(...args)
}

export default { info, warn, error }
