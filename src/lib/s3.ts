import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
})

export async function headBucket() {
  const Bucket = process.env.S3_BUCKET || ''
  await s3.send(new HeadBucketCommand({ Bucket }))
}

export default s3
