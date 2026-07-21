// Server-only env helpers — never import from client components

export function getRequiredServerEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export function getOptionalServerEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue
}
