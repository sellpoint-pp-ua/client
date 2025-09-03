const shouldLog = () => {
  // Allow explicit enabling in development, but disable when DISABLE_SERVER_LOGS is set
  if (process.env.DISABLE_SERVER_LOGS === 'true') return false
  if (process.env.NODE_ENV === 'production') return false
  return true
}

export const info = (...args: unknown[]) => {
  if (!shouldLog()) return
  // eslint-disable-next-line no-console
  console.log(...args)
}

export const warn = (...args: unknown[]) => {
  if (!shouldLog()) return
  // eslint-disable-next-line no-console
  console.warn(...args)
}

export const error = (...args: unknown[]) => {
  if (!shouldLog()) return
  // eslint-disable-next-line no-console
  console.error(...args)
}

export default { info, warn, error }
