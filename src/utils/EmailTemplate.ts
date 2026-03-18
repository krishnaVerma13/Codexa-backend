export const EmailTemplate = (code: number, username?: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; border: 1px solid #e4e4e7;">
          
          <!-- Header -->
          <tr>
            <td style="background:#0f172a; padding: 24px 32px; text-align:center;">
              <span style="font-size:20px; font-weight:600; color:#f8fafc; letter-spacing:0.5px;">Codexa</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="font-size:22px; font-weight:600; color:#09090b; margin:0 0 8px;">Verify your email</p>
              ${username ? `<p style="font-size:14px; color:#71717a; margin:0 0 6px;">Hi ${username},</p>` : ""}
              <p style="font-size:14px; color:#71717a; margin:0 0 28px; line-height:1.6;">
                Use the code below to verify your account. This code expires in <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#f4f4f5; border:1px solid #e4e4e7; border-radius:8px; padding:20px; text-align:center; margin:0 0 28px;">
                <span style="font-size:36px; font-weight:700; letter-spacing:12px; color:#09090b; font-family: 'Courier New', monospace;">
                  ${code}
                </span>
              </div>

              <p style="font-size:13px; color:#a1a1aa; margin:0; line-height:1.7;">
                If you didn't request this, you can safely ignore this email. Your account won't be affected.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #e4e4e7; padding:16px 32px; text-align:center;">
              <p style="font-size:12px; color:#a1a1aa; margin:0;">© 2025 Codexa · All rights reserved</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;