import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'CHRONEX <noreply@chronex.in>',
    to,
    subject,
    html,
  });
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderNumber: string,
  total: number,
  items: any[]
): Promise<void> => {
  const itemsHtml = items.map(i =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #1a1a2e">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #1a1a2e;text-align:center">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #1a1a2e;text-align:right">₹${i.price.toLocaleString('en-IN')}</td>
    </tr>`
  ).join('');

  await sendEmail({
    to: email,
    subject: `CHRONEX — Order Confirmed #${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#050A14;font-family:Inter,sans-serif;color:#f0f4ff">
        <div style="max-width:600px;margin:40px auto;background:#0A1020;border-radius:16px;border:1px solid rgba(201,168,76,0.2);overflow:hidden">
          <div style="background:linear-gradient(135deg,#0A1020,#050A14);padding:40px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.15)">
            <div style="font-family:Orbitron,monospace;font-size:28px;font-weight:900;color:#C9A84C;letter-spacing:0.2em">⟨◈⟩ CHRONEX</div>
          </div>
          <div style="padding:40px">
            <h2 style="color:#C9A84C;margin-bottom:8px">Order Confirmed! ✅</h2>
            <p style="color:#6B7FA3">Order #<strong style="color:#f0f4ff">${orderNumber}</strong></p>
            <table style="width:100%;border-collapse:collapse;margin:24px 0">
              <thead>
                <tr style="background:rgba(201,168,76,0.1)">
                  <th style="padding:10px;text-align:left;color:#C9A84C">Item</th>
                  <th style="padding:10px;text-align:center;color:#C9A84C">Qty</th>
                  <th style="padding:10px;text-align:right;color:#C9A84C">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="text-align:right;font-size:20px;color:#C9A84C;font-weight:700">
              Total: ₹${total.toLocaleString('en-IN')}
            </div>
            <p style="color:#6B7FA3;margin-top:32px;font-size:14px">
              Estimated delivery: 3–5 business days.<br>
              Questions? Email us at support@chronex.in
            </p>
          </div>
          <div style="padding:20px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);color:#6B7FA3;font-size:12px">
            © 2024 CHRONEX. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  });
};
