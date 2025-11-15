# 🔐 Authentication System - Fixed & Updated

## ✅ Vấn đề đã được khắc phục

### 1. **Thêm chức năng Forgot Password & Reset Password**

- ✅ Endpoint: `POST /api/v1/auth/forgot-password`
- ✅ Endpoint: `POST /api/v1/auth/reset-password`
- ✅ Endpoint: `POST /api/v1/auth/verify-reset-token`
- ✅ Gửi mã OTP 6 số qua email
- ✅ Token có thời hạn 1 giờ

### 2. **Cấu hình Email Service**

- ✅ Sử dụng SMTP Gmail đã có trong `.env`
- ✅ Email template đẹp với mã OTP
- ✅ Gửi welcome email khi đăng ký

### 3. **Migration Users từ Supabase Auth**

- ✅ Đã tạo lại tài khoản trong Prisma DB:
  - `1dap2xoe@gmail.com` - Password: `123456`
  - `admin@gmail.com` - Password: `admin123`
  - `chaobuoilangnda@gmail.com` - Password: `123456`

### 4. **Kiểm tra & Xác nhận các chức năng**

- ✅ Đăng ký: Tạo user trong Prisma DB và trả về token
- ✅ Đăng nhập: Kiểm tra user trong Prisma DB
- ✅ Quên mật khẩu: Gửi OTP qua email
- ✅ Reset mật khẩu: Dùng OTP để đặt lại mật khẩu

---

## 📋 API Endpoints

### Public Endpoints

#### 1. Đăng ký (Register)

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "User Name",
  "phone": "0901234567"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### 2. Đăng nhập (Login)

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "1dap2xoe@gmail.com",
  "password": "123456"
}
```

#### 3. Quên mật khẩu (Forgot Password)

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "1dap2xoe@gmail.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "If the email exists, a reset token has been sent"
}
```

⚠️ **Kiểm tra email để lấy mã OTP 6 số!**

#### 4. Xác thực mã OTP

```http
POST /api/v1/auth/verify-reset-token
Content-Type: application/json

{
  "token": "123456"
}
```

#### 5. Đặt lại mật khẩu (Reset Password)

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "123456",
  "newPassword": "newpassword123"
}
```

### Protected Endpoints (Cần Authorization Header)

#### 6. Lấy thông tin profile

```http
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

#### 7. Đổi mật khẩu

```http
POST /api/v1/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "oldPassword": "123456",
  "newPassword": "newpassword123"
}
```

---

## 🚀 Cách sử dụng

### 1. Khởi động Backend

```bash
cd backend
npm run dev
```

### 2. Test Authentication APIs

```bash
# Chạy script test
powershell -File test-auth.ps1
```

### 3. Đăng nhập với tài khoản đã migration

```
Email: 1dap2xoe@gmail.com
Password: 123456
```

### 4. Test Forgot Password Flow

**Bước 1:** Gọi API Forgot Password

```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"1dap2xoe@gmail.com"}'
```

**Bước 2:** Kiểm tra email để lấy mã OTP 6 số

**Bước 3:** Reset password với OTP

```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"123456","newPassword":"newpass123"}'
```

---

## 📊 Database Schema Changes

### Bảng mới: `password_reset_tokens`

```prisma
model PasswordResetToken {
  id          String   @id @default(uuid())
  email       String
  token       String   @unique
  expiresAt   DateTime
  used        Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@map("password_reset_tokens")
  @@index([email])
  @@index([token])
}
```

---

## 🔧 Scripts hữu ích

### Kiểm tra users trong database

```bash
node check-user.js
```

### Tạo user mới

```bash
node create-user.js
```

### Migration users từ Supabase

```bash
node migrate-supabase-users.js
```

---

## ⚠️ Lưu ý quan trọng

1. **Tài khoản hiện tại:**
   - Tất cả tài khoản cũ từ Supabase Auth đã được migrate vào Prisma DB
   - Password tạm thời: `123456` (nên đổi ngay sau khi login)

2. **Email Service:**
   - Đang sử dụng Gmail SMTP
   - Credentials đã được cấu hình trong `.env`

3. **Token Expiry:**
   - Access Token: 15 phút
   - Refresh Token: 7 ngày
   - Reset Token: 1 giờ

4. **Security:**
   - Passwords được hash bằng bcrypt (10 rounds)
   - JWT được sign với secret keys
   - Reset tokens chỉ dùng được 1 lần

---

## 🐛 Troubleshooting

### Email không gửi được?

- Kiểm tra SMTP credentials trong `.env`
- Verify rằng Gmail App Password đúng
- Check logs: `logs/app.log`

### Không thể login?

- Chạy `node check-user.js` để xem user có tồn tại không
- Verify password đúng
- Check database connection

### Token hết hạn?

- Access token hết hạn sau 15 phút
- Dùng refresh token để lấy token mới
- Hoặc login lại

---

## 📝 Testing Checklist

- [x] ✅ Đăng ký user mới
- [x] ✅ Đăng nhập với email/password
- [x] ✅ Quên mật khẩu - gửi OTP
- [x] ✅ Reset mật khẩu với OTP
- [x] ✅ Đổi mật khẩu (khi đã login)
- [x] ✅ Lấy thông tin profile
- [x] ✅ Migration users từ Supabase

---

## 📞 Support

Nếu có vấn đề, kiểm tra:

1. Logs: `logs/app.log`
2. Database: Chạy `node check-user.js`
3. Email service: Check `.env` config

**Chúc bạn thành công! 🎉**
