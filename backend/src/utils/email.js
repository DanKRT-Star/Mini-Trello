import nodemailer from 'nodemailer';

// Create transporter with lazy initialization
function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(`Missing email credentials. EMAIL_USER: ${process.env.EMAIL_USER ? 'SET' : 'MISSING'}, EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET' : 'MISSING'}`);
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

export async function sendVerificationEmail(email, code) {
  const transporter = getTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Mã xác thực Mini Trello - Skipli',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Mini Trello</h1>
            <p>Xác thực tài khoản của bạn</p>
          </div>
          <div class="content">
            <p>Xin chào,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản Mini Trello. Vui lòng sử dụng mã xác thực dưới đây để hoàn tất quá trình đăng ký:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <p><strong>Lưu ý:</strong> Mã này có hiệu lực trong <strong>3 ngày</strong>.</p>
            <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
          </div>
          <div class="footer">
            <p>© 2026 Mini Trello</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log(`[EMAIL] Sending verification email to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✓ Successfully sent to ${email}. Message ID: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`[EMAIL] ✗ Failed to send to ${email}:`, error.message);
    throw error;
  }
}

export async function sendInvitationEmail(email, boardName, inviterName) {
  const transporter = getTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Lời mời tham gia board "${boardName}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Mini Trello</h1>
            <p>Lời mời tham gia board</p>
          </div>
          <div class="content">
            <p>Xin chào,</p>
            <p><strong>${inviterName}</strong> đã mời bạn tham gia board <strong>"${boardName}"</strong>.</p>
            <p>Vui lòng đăng nhập vào ứng dụng để chấp nhận hoặc từ chối lời mời.</p>
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Xem lời mời</a>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log(`[EMAIL] Sending invitation to: ${email}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✓ Successfully sent to ${email}. Message ID: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`[EMAIL] ✗ Failed to send to ${email}:`, error.message);
    throw error;
  }
}