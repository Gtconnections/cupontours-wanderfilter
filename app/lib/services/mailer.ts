/**
 * Mailer (Gmail SMTP)
 * Envío de correos de los formularios del front vía Gmail SMTP con App Password.
 * Reemplaza a SendGrid. Credenciales por variables de entorno (setear en Vercel):
 *   EMAIL_HOST_USER      -> tu-correo@gmail.com
 *   EMAIL_HOST_PASSWORD  -> App Password de 16 caracteres (sin espacios)
 *   EMAIL_FROM_NAME      -> (opcional) nombre visible, default "Cupon Tours"
 *   DEFAULT_FROM_EMAIL   -> (opcional) remitente; default = EMAIL_HOST_USER
 */
import nodemailer from 'nodemailer';

export interface MailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  // Gmail exige que el remitente sea la cuenta autenticada (o un alias verificado),
  // asi que este campo se ignora y se usa la cuenta de EMAIL_HOST_USER. Se acepta
  // en el tipo solo para no romper el código existente que lo pasa.
  from?: string;
  replyTo?: string;
}

// Transporter reutilizable entre invocaciones (module-scope singleton).
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false, // STARTTLS en el puerto 587
    auth: {
      user: process.env.EMAIL_HOST_USER || '',
      pass: process.env.EMAIL_HOST_PASSWORD || '',
    },
  });
  return transporter;
}

export async function sendMail(msg: MailMessage): Promise<void> {
  const user = process.env.EMAIL_HOST_USER || '';
  const fromName = process.env.EMAIL_FROM_NAME || 'Cupon Tours';
  const fromEmail = process.env.DEFAULT_FROM_EMAIL || user;

  await getTransporter().sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    // Las respuestas van al remitente del formulario (cliente), no a la cuenta de Gmail.
    replyTo: msg.replyTo,
  });
}
