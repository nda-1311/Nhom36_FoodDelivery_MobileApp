# 🔧 Hướng Dẫn Setup Database + RPC Function cho Forgot Password

## Cách này ĐƠN GIẢN HƠN Edge Function - Không cần Supabase CLI!

---

## 📋 Tổng Quan

**Cách hoạt động:**

1. User nhập email → App gửi OTP về email (qua EmailJS)
2. App lưu OTP vào database `password_reset_tokens`
3. User nhập OTP + password mới
4. App gọi RPC function `reset_password_with_otp`
5. Function verify OTP và đổi password (dùng SECURITY DEFINER để có quyền admin)

**Ưu điểm:**

- ✅ Không cần deploy Edge Function
- ✅ Không cần Supabase CLI
- ✅ Chỉ cần copy-paste SQL vào Supabase Dashboard
- ✅ Dễ debug hơn

---

## 🚀 Bước 1: Tạo Bảng Database

1. Mở **Supabase Dashboard**: https://supabase.com/dashboard
2. Chọn project của bạn
3. Click **SQL Editor** (icon ⚡ bên trái)
4. Click **New query**
5. Copy toàn bộ nội dung file `supabase/migrations/create_password_reset.sql`
6. Paste vào SQL Editor
7. Click **Run** (hoặc Ctrl+Enter)

**Kiểm tra:**

- Vào **Table Editor** → Bạn sẽ thấy bảng `password_reset_tokens`
- Bảng có các cột: `id`, `email`, `otp_code`, `expires_at`, `created_at`, `used`

---

## 🔧 Bước 2: Tạo RPC Function

1. Vẫn ở **SQL Editor**
2. Click **New query** (tạo query mới)
3. Copy toàn bộ nội dung file `supabase/migrations/reset_password_function.sql`
4. Paste vào SQL Editor
5. Click **Run**

**Kiểm tra:**

- Vào **Database** → **Functions** (bên trái)
- Bạn sẽ thấy function `reset_password_with_otp`

---

## ✅ Bước 3: Test Thử

### Test trong Supabase Dashboard:

1. Vào **SQL Editor**
2. Chạy query sau để test function:

```sql
-- Thêm OTP test vào database
INSERT INTO password_reset_tokens (email, otp_code, expires_at)
VALUES ('test@example.com', '123456', NOW() + INTERVAL '5 minutes');

-- Test function
SELECT reset_password_with_otp(
  'test@example.com',
  '123456',
  'newpassword123'
);
```

**Kết quả mong đợi:**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 📱 Bước 4: Test Trong App

1. Chạy app:

   ```bash
   npx expo start
   ```

2. Test flow hoàn chỉnh:
   - Vào màn hình **Quên Mật Khẩu**
   - Nhập email của user đã đăng ký
   - Click **Gửi mã OTP**
   - Check email → Nhận OTP 6 số
   - Nhập OTP + mật khẩu mới
   - Click **Đổi Mật Khẩu**
   - ✅ Đăng nhập lại bằng mật khẩu mới

---

## 🐛 Troubleshooting

### Lỗi: "Failed to find user"

- **Nguyên nhân**: Email không tồn tại trong `auth.users`
- **Giải pháp**: Đảm bảo user đã đăng ký trước đó

### Lỗi: "Invalid or expired OTP code"

- **Nguyên nhân**:
  - OTP sai
  - OTP đã hết hạn (> 5 phút)
  - OTP đã được dùng rồi
- **Giải pháp**: Gửi lại OTP mới

### Lỗi: "Permission denied for table auth.users"

- **Nguyên nhân**: Function không có quyền update `auth.users`
- **Giải pháp**: Đảm bảo function có `SECURITY DEFINER`:

```sql
-- Chạy lại command này trong SQL Editor:
ALTER FUNCTION reset_password_with_otp(TEXT, TEXT, TEXT)
SECURITY DEFINER;
```

### Lỗi: "could not find the function reset_password_with_otp"

- **Nguyên nhân**: Function chưa được tạo
- **Giải pháp**: Chạy lại file `reset_password_function.sql`

---

## 🔍 Debug Tips

### Xem OTP trong database:

```sql
SELECT * FROM password_reset_tokens
WHERE email = 'your-email@example.com'
ORDER BY created_at DESC;
```

### Xem log function (nếu có lỗi):

```sql
SELECT reset_password_with_otp(
  'test@example.com',
  'wrong-otp',
  'newpass'
);
```

### Xóa OTP cũ (nếu test nhiều lần):

```sql
DELETE FROM password_reset_tokens
WHERE email = 'your-email@example.com';
```

---

## 📊 So Sánh Với Edge Function

| Tiêu chí    | Database + RPC    | Edge Function         |
| ----------- | ----------------- | --------------------- |
| Setup       | Copy-paste SQL    | Cần Supabase CLI      |
| Deploy      | Không cần         | Phải deploy           |
| Debug       | Dễ (xem database) | Khó (xem logs)        |
| Bảo mật     | SECURITY DEFINER  | Service Role Key      |
| Performance | Nhanh hơn         | Chậm hơn (cold start) |

---

## ✨ Hoàn Thành!

Bây giờ bạn có thể test chức năng **Quên Mật Khẩu** hoàn chỉnh:

1. ✅ Gửi OTP về email thật (EmailJS)
2. ✅ Lưu OTP vào database
3. ✅ Verify OTP và đổi password (RPC function)
4. ✅ Không cần Edge Function, không cần Supabase CLI!

---

## 🔐 Lưu Ý Bảo Mật

- ✅ OTP tự động expire sau 5 phút
- ✅ OTP chỉ dùng được 1 lần (column `used`)
- ✅ Function có SECURITY DEFINER (chạy với quyền admin)
- ✅ RLS enabled cho bảng `password_reset_tokens`
- ✅ Password được hash bằng bcrypt

---

Có vấn đề gì cứ hỏi nhé! 🚀
