import Mailjet from 'node-mailjet';

// Mailjet requires both API Key and API Secret
// Get your API Secret from: https://app.mailjet.com/account/apikeys
const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY || '9f340667dc6bb2d9d34e31f6641bca5c',
  apiSecret: process.env.MAILJET_API_SECRET || '',
});

export const sendPasswordResetEmail = async (
  toEmail: string,
  companyName: string,
  newPassword: string
): Promise<void> => {
  try {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL || 'noreply@optops.com',
            Name: 'OptOps',
          },
          To: [
            {
              Email: toEmail,
              Name: companyName,
            },
          ],
          Subject: 'Password Reset - OptOps',
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #D4AF37;">Password Reset Request</h2>
              <p>Hello ${companyName},</p>
              <p>Your password has been reset successfully. Please use the following password to log in:</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                <strong style="font-size: 18px; color: #333; letter-spacing: 2px;">${newPassword}</strong>
              </div>
              <p><strong>Important:</strong> Please change this password after logging in from your Company Settings page for security purposes.</p>
              <p>If you did not request this password reset, please contact support immediately.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #666; font-size: 12px;">This is an automated email from OptOps. Please do not reply to this email.</p>
            </div>
          `,
          TextPart: `
            Password Reset Request
            
            Hello ${companyName},
            
            Your password has been reset successfully. Please use the following password to log in:
            
            ${newPassword}
            
            Important: Please change this password after logging in from your Company Settings page for security purposes.
            
            If you did not request this password reset, please contact support immediately.
            
            ---
            This is an automated email from OptOps. Please do not reply to this email.
          `,
        },
      ],
    });

    await request;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

