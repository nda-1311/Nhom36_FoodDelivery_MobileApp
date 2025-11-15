/**
 * Email Service
 *
 * Handles sending emails using nodemailer
 */

import nodemailer from 'nodemailer';
import { config } from '../config/environment';
import { logger } from './logger';

// Email configuration from environment
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: `"Food Delivery App" <${emailConfig.auth.user}>`,
      to: email,
      subject: 'Đặt lại mật khẩu - Food Delivery App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF6B6B; margin: 0;">🍔 Food Delivery</h1>
          </div>
          
          <div style="background-color: #f9f9f9; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Đặt lại mật khẩu</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.
            </p>
            
            <p style="color: #333; font-size: 16px; font-weight: bold; margin-top: 25px;">
              Mã xác thực của bạn là:
            </p>
            
            <div style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; box-shadow: 0 4px 6px rgba(255,107,107,0.2);">
              <div style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${resetToken}
              </div>
            </div>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                ⚠️ <strong>Lưu ý:</strong> Vui lòng quay lại ứng dụng và nhập mã này để đặt lại mật khẩu.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 25px;">
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                ⏰ Mã này sẽ hết hạn sau <strong>1 giờ</strong>
              </p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                🔒 Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này
              </p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                📱 Mã OTP chỉ sử dụng được một lần
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 5px 0;">
              © 2025 Food Delivery App. All rights reserved.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0;">
              Email này được gửi tự động, vui lòng không trả lời.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to: ${email}`);
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send welcome email after registration
 */
export const sendWelcomeEmail = async (
  email: string,
  fullName: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: `"Food Delivery App" <${emailConfig.auth.user}>`,
      to: email,
      subject: 'Chào mừng đến với Food Delivery App!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B6B;">Chào mừng ${fullName}!</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại Food Delivery App.</p>
          <p>Bạn có thể bắt đầu đặt món ăn yêu thích ngay bây giờ!</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}" style="display: inline-block; padding: 12px 24px; background-color: #FF6B6B; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
            Khám phá ngay
          </a>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Food Delivery App. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to: ${email}`);
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
    // Don't throw error for welcome email
  }
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    logger.info('✅ Email configuration verified');
    return true;
  } catch (error) {
    logger.error('❌ Email configuration failed:', error);
    return false;
  }
};
