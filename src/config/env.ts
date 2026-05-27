function requireEnv(name: 'VITE_API_URL'): string {
  const value = import.meta.env[name]
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env and configure the variable.`,
    )
  }
  return value
}

export const API_URL = requireEnv('VITE_API_URL')
