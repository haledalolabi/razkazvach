import { Redis } from '@upstash/redis'

let client: Redis | null = null

export function getRedisClient() {
  if (client) return client
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  client = new Redis({ url, token })
  return client
}

export default getRedisClient
