export function verifySecret(req: Request) {
  if (process.env.NODE_ENV === 'development') return true
  const header = req.headers.get('x-health-secret')
  return header && header === process.env.HEALTH_SECRET
}

export function unauthorized() {
  return new Response('Unauthorized', { status: 401 })
}
