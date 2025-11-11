import emailjs from "@emailjs/browser";

// 🔧 Cấu hình EmailJS (bạn cần đăng ký tại https://www.emailjs.com/)
const EMAILJS_SERVICE_ID = "service_aiahg2e"; // Thay bằng Service ID của bạn
const EMAILJS_TEMPLATE_ID = "template_k7audjl"; // Thay bằng Template ID của bạn
const EMAILJS_PUBLIC_KEY = "m8NryUWomPLvi53yC"; // Thay bằng Public Key của bạn

/**
 * Tạo mã OTP ngẫu nhiên 6 số
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Gửi mã OTP qua email
 * @param email Email người nhận
 * @param otp Mã OTP 6 số
 * @returns Promise<boolean> - true nếu gửi thành công
 */
export async function sendOTPEmail(
  email: string,
  otp: string
): Promise<boolean> {
  try {
    const templateParams = {
      to_email: email,
      otp_code: otp,
      app_name: "Food Delivery App",
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log("✅ Email sent successfully:", response.status);
    return response.status === 200;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return false;
  }
}

/**
 * Xác thực OTP
 * @param inputOTP Mã OTP người dùng nhập
 * @param correctOTP Mã OTP đúng đã gửi
 * @param expiryTime Thời gian hết hạn (timestamp)
 * @returns boolean
 */
export function verifyOTP(
  inputOTP: string,
  correctOTP: string,
  expiryTime: number
): boolean {
  const now = Date.now();

  // Kiểm tra hết hạn (5 phút)
  if (now > expiryTime) {
    return false;
  }

  // Kiểm tra mã OTP
  return inputOTP === correctOTP;
}
