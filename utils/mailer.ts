import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'

dotenv.config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export const sendEmailWithOtp = async (email: string, otp: string) => {
  await sgMail.send({
    to: email,
    from: process.env.EMAIL_SENDER!,
    subject: 'Votre code OTP pour réinitialiser le mot de passe',
    text: `Votre code OTP est : ${otp}. Il expire dans 15 minutes.`,
    html: `<p>Bonjour,</p>
           <p>Votre code OTP est : <strong>${otp}</strong></p>
           <p>Il expire dans 15 minutes.</p>`
  })
}
