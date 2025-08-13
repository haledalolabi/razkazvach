import { Resend } from 'resend'

let client: Resend | null = null

export function getResendClient() {
  if (client) return client
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  client = new Resend(apiKey)
  return client
}

export async function sendTestEmail(to: string) {
  const resend = getResendClient()
  if (!resend || !process.env.EMAIL_FROM) {
    throw new Error('RESEND_API_KEY or EMAIL_FROM is not set')
  }
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Test email',
    html: '<p>ok</p>',
  })
}

export default getResendClient
