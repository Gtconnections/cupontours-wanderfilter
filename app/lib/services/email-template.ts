/**
 * Plantilla de correo branded (Cupon Tours) para los formularios del front.
 * HTML seguro para clientes de correo: layout en tablas, estilos inline, 600px.
 * Estética: charcoal + acento dorado, serif para titulares, sans para el cuerpo.
 */
import { clientConfig } from '../config';

export interface EmailRow {
  label: string;
  value: string;
}

export interface EmailSection {
  heading?: string;
  rows: EmailRow[];
}

export interface InquiryEmailInput {
  title: string;
  eyebrow?: string;
  sections: EmailSection[];
  message?: { label: string; body: string };
}

// Paleta
const GOLD = '#c8a24b';
const INK = '#17191c';
const CHARCOAL = '#0f1113';
const MUTED = '#8a8f98';
const LINE = '#ececec';
const BODY_BG = '#f4f2ee';

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// Escapa texto del usuario para no romper el HTML.
function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderRow(row: EmailRow): string {
  return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid ${LINE};">
        <div style="font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: ${MUTED};">${esc(row.label)}</div>
        <div style="font-family: ${SANS}; font-size: 15px; color: ${INK}; margin-top: 4px;">${esc(row.value)}</div>
      </td>
    </tr>`;
}

function renderSection(section: EmailSection): string {
  const heading = section.heading
    ? `<div style="font-family: ${SANS}; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${GOLD}; margin: 26px 0 6px 0;">${esc(section.heading)}</div>`
    : '';
  return `
    ${heading}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
      ${section.rows.map(renderRow).join('')}
    </table>`;
}

export function renderInquiryEmail(input: InquiryEmailInput): string {
  const logo = clientConfig.brand.whiteLogo || clientConfig.brand.logo;
  const company = clientConfig.company.name;
  const site = (clientConfig.site.url || '').replace(/\/$/, '');
  const email = clientConfig.company.email;
  const phone = clientConfig.company.phone;

  const eyebrow = input.eyebrow
    ? `<div style="font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: ${GOLD}; margin-bottom: 10px;">${esc(input.eyebrow)}</div>`
    : '';

  const sectionsHtml = input.sections.map(renderSection).join('');

  const messageHtml = input.message
    ? `
      <div style="margin-top: 26px; background: #faf9f6; border-left: 3px solid ${GOLD}; border-radius: 0 8px 8px 0; padding: 18px 20px;">
        <div style="font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: ${MUTED}; margin-bottom: 8px;">${esc(input.message.label)}</div>
        <div style="font-family: ${SANS}; font-size: 15px; line-height: 1.6; color: ${INK}; white-space: pre-wrap;">${esc(input.message.body)}</div>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(input.title)}</title>
</head>
<body style="margin: 0; padding: 0; background: ${BODY_BG};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: ${BODY_BG};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width: 600px; max-width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(15,17,19,0.10);">

          <!-- Header -->
          <tr>
            <td style="background: ${CHARCOAL}; padding: 30px 40px 26px 40px;" align="center">
              <img src="${logo}" alt="${esc(company)}" width="160" style="display: block; max-width: 160px; height: auto; margin: 0 auto;">
            </td>
          </tr>
          <!-- Gold rule -->
          <tr><td style="height: 3px; background: ${GOLD};"></td></tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 40px 8px 40px;">
              ${eyebrow}
              <h1 style="font-family: ${SERIF}; font-size: 26px; font-weight: 400; color: ${INK}; margin: 0 0 6px 0; line-height: 1.25;">${esc(input.title)}</h1>
              <div style="width: 44px; height: 2px; background: ${GOLD}; margin: 14px 0 6px 0;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 40px 36px 40px;">
              ${sectionsHtml}
              ${messageHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: ${CHARCOAL}; padding: 26px 40px;" align="center">
              <div style="font-family: ${SERIF}; font-size: 16px; color: #ffffff; letter-spacing: 0.5px;">${esc(company)}</div>
              <div style="font-family: ${SANS}; font-size: 12px; color: ${MUTED}; margin-top: 8px;">
                ${esc(email)}${phone ? ` &nbsp;·&nbsp; ${esc(phone)}` : ''}
              </div>
              ${site ? `<div style="font-family: ${SANS}; font-size: 12px; margin-top: 6px;"><a href="${site}" style="color: ${GOLD}; text-decoration: none;">${esc(site.replace(/^https?:\/\//, ''))}</a></div>` : ''}
              <div style="font-family: ${SANS}; font-size: 11px; color: #5b616b; margin-top: 14px;">This message was generated from the ${esc(company)} website.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
