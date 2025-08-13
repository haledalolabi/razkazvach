import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTestEmail(to: string) {
  if (!process.env.EMAIL_FROM) throw new Error('EMAIL_FROM not set')
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Test email',
    html: '<p>ok</p>',
  })
}

export default resend
