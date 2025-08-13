import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3'

let client: S3Client | null = null

export function getS3Client() {
  if (client) return client
  const endpoint = process.env.S3_ENDPOINT
  const region = process.env.S3_REGION
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
  if (!endpoint || !region || !accessKeyId || !secretAccessKey) return null
  client = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
  })
  return client
}

export async function headBucket() {
  const s3 = getS3Client()
  const Bucket = process.env.S3_BUCKET
  if (!s3 || !Bucket) throw new Error('S3 not configured')
  await s3.send(new HeadBucketCommand({ Bucket }))
}

export default getS3Client
