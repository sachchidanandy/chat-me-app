import { Resend } from 'resend';

const resend = new Resend(process.env.RESENT_API_KEY);

export const sendEmail = async (to: [string], subject: string, html: string) => {
  const { data, error } = await resend.emails.send({
    from: process.env.MAIL_USER!,
    to,
    subject,
    html,
  });

  if (!data && error) {
    throw new Error(error.message);
  }
};
