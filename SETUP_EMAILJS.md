# 📧 Hướng dẫn Setup EmailJS để gửi OTP

## Bước 1: Đăng ký EmailJS

1. Truy cập: https://www.emailjs.com/
2. Click **"Sign Up"** (miễn phí 200 emails/tháng)
3. Đăng ký bằng email hoặc Google

## Bước 2: Tạo Email Service

1. Sau khi đăng nhập, vào **Email Services**
2. Click **"Add New Service"**
3. Chọn email provider (Gmail khuyến nghị):
   - Chọn **Gmail**
   - Đăng nhập tài khoản Gmail của bạn
   - Cho phép EmailJS truy cập
4. Copy **Service ID** (ví dụ: `service_abc123`)

## Bước 3: Tạo Email Template

1. Vào **Email Templates**
2. Click **"Create New Template"**
3. Tạo template OTP như sau:

**Subject:**

```
Mã OTP đặt lại mật khẩu - {{app_name}}
```

**Content:**

```html
Xin chào, Mã OTP để đặt lại mật khẩu của bạn là:

<h2 style="color: #06b6d4; font-size: 32px; letter-spacing: 4px;">
  {{otp_code}}
</h2>

Mã này có hiệu lực trong vòng <strong>5 phút</strong>. Nếu bạn không yêu cầu đặt
lại mật khẩu, vui lòng bỏ qua email này. --- Trân trọng, {{app_name}} Team
```

4. Copy **Template ID** (ví dụ: `template_xyz789`)

## Bước 4: Lấy Public Key

1. Vào **Account** → **General**
2. Tìm **Public Key** (ví dụ: `user_abcXYZ123`)
3. Copy Public Key

## Bước 5: Cấu hình trong Project

Mở file: `lib/emailService.ts`

Thay các giá trị sau:

```typescript
const EMAILJS_SERVICE_ID = "service_abc123"; // Service ID từ bước 2
const EMAILJS_TEMPLATE_ID = "template_xyz789"; // Template ID từ bước 3
const EMAILJS_PUBLIC_KEY = "user_abcXYZ123"; // Public Key từ bước 4
```

## Bước 6: Test Email

1. Chạy app: `npx expo start`
2. Vào màn hình **Quên Mật Khẩu**
3. Nhập email của bạn
4. Kiểm tra hộp thư (có thể trong Spam)

## 🎯 Template Variables

EmailJS template hỗ trợ các biến sau (được gửi từ code):

- `{{to_email}}` - Email người nhận
- `{{otp_code}}` - Mã OTP 6 số
- `{{app_name}}` - Tên app (Food Delivery App)

## 🔧 Troubleshooting

### Email không đến

- Kiểm tra **Spam/Junk** folder
- Verify Service ID, Template ID, Public Key đúng chưa
- Kiểm tra quota còn không (200 emails/tháng free)

### Lỗi CORS

- EmailJS hoạt động trên cả web và mobile
- Không cần config CORS

### Lỗi Authentication

- Đảm bảo đã kết nối Gmail với EmailJS
- Re-authorize nếu cần

## 📊 Monitor

Xem logs tại: https://dashboard.emailjs.com/admin/logs

## 🚀 Alternative: Dùng Resend (Professional)

Nếu muốn pro hơn, dùng **Resend**:

1. https://resend.com (1000 emails/tháng free)
2. Tạo API key
3. Cài: `npm install resend`
4. Dùng API key thay vì EmailJS

---

✅ Sau khi setup xong, app sẽ gửi OTP 6 số thật về email!
