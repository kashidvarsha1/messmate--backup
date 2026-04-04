import nodemailer from 'nodemailer';

const appUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendPasswordResetOtp = async ({ email, name, otp }) => {
  const mailOptions = {
    from: `"MessMate" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'MessMate password reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ea580c;">Password Reset Request</h1>
        <p>Hello ${name || 'there'},</p>
        <p>Use this OTP to reset your MessMate password:</p>
        <div style="margin: 20px 0; padding: 16px; background: #fff7ed; border: 1px solid #fdba74; border-radius: 12px; text-align: center;">
          <div style="font-size: 28px; letter-spacing: 6px; font-weight: bold; color: #9a3412;">${otp}</div>
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this reset, you can ignore this email.</p>
        <p><a href="${appUrl}" style="color: #ea580c;">Open MessMate</a></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: `"MessMate" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Welcome to MessMate! 🍽️',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Welcome to MessMate, ${user.name}!</h1>
        <p>Thank you for joining MessMate. We're excited to help you find delicious meals!</p>
        <p>Your account has been created with role: <strong>${user.role}</strong></p>
        <a href="${appUrl}" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a>
        <hr style="margin: 20px 0;">
        <p style="color: #666;">If you didn't create this account, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendStatusUpdateEmail = async (provider, owner) => {
  const mailOptions = {
    from: `"MessMate" <${process.env.SMTP_USER}>`,
    to: owner.email,
    subject: `Provider Status Updated: ${provider.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Status Update</h1>
        <p>Your provider <strong>${provider.name}</strong> status has been updated to:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center;">
          <strong style="font-size: 20px; color: ${provider.status === 'open' ? '#16a34a' : provider.status === 'closed' ? '#dc2626' : '#eab308'}">
            ${provider.status.toUpperCase()}
          </strong>
          ${provider.reason ? `<p>Reason: ${provider.reason}</p>` : ''}
        </div>
        <p>Valid until: ${new Date(provider.validTill).toLocaleString()}</p>
        <a href="${appUrl}/dashboard" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
