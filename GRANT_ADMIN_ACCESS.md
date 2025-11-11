# Hướng dẫn cấp quyền Admin cho tài khoản 1dnp2woo@gmail.com

## Các bước thực hiện

### Bước 1: Truy cập Supabase Dashboard

1. Mở https://supabase.com
2. Đăng nhập vào project của bạn
3. Click vào **SQL Editor** (biểu tượng ⚡ bên trái)

### Bước 2: Chạy SQL để cấp quyền Admin

Copy toàn bộ SQL dưới đây và paste vào SQL Editor, sau đó click **RUN**:

```sql
-- Bước 1: Fix RLS policy (cho phép user xem admin config của chính họ)
DROP POLICY IF EXISTS "Only admins can view admin config" ON public.admin_config;

CREATE POLICY "Users can view own admin config"
    ON public.admin_config FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.admin_config
            WHERE user_id = auth.uid()
        )
    );

-- Bước 2: Thêm user 1dnp2woo@gmail.com làm super_admin
INSERT INTO public.admin_config (user_id, role, permissions)
SELECT
    id as user_id,
    'super_admin' as role,
    '["read", "write", "delete", "manage_admins", "*"]'::jsonb as permissions
FROM auth.users
WHERE email = '1dnp2woo@gmail.com'
ON CONFLICT (user_id)
DO UPDATE SET
    role = 'super_admin',
    permissions = '["read", "write", "delete", "manage_admins", "*"]'::jsonb,
    updated_at = timezone('utc'::text, now());

-- Bước 3: Verify (kiểm tra kết quả)
SELECT
    u.email,
    ac.role,
    ac.permissions,
    ac.created_at
FROM auth.users u
JOIN public.admin_config ac ON u.id = ac.user_id
WHERE u.email = '1dnp2woo@gmail.com';
```

### Bước 3: Kiểm tra kết quả

Sau khi chạy SQL, bạn sẽ thấy kết quả cuối cùng hiển thị:

```
email                | role         | permissions
---------------------|--------------|-------------
1dnp2woo@gmail.com   | super_admin  | ["read", "write", "delete", "manage_admins", "*"]
```

### Bước 4: Test đăng nhập

1. Reload trang web: http://localhost:8081
2. Đăng nhập với email: `1dnp2woo@gmail.com`
3. ✅ **Tick vào checkbox "Đăng nhập với quyền Admin"**
4. Click "Đăng nhập"
5. Bạn sẽ được chuyển đến **Admin Dashboard** 🎉

## Giải thích

- **super_admin**: Quyền cao nhất, có thể quản lý tất cả
- **admin**: Quyền quản trị thông thường
- **moderator**: Quyền điều hành

## Nếu gặp lỗi

Nếu vẫn bị lỗi "Tài khoản này không có quyền Admin!", hãy:

1. Kiểm tra xem SQL có chạy thành công không
2. Kiểm tra lại email có đúng không (phân biệt hoa thường)
3. Chạy lại query verify để đảm bảo user đã được thêm vào admin_config
4. Logout và login lại

## Troubleshooting

### Lỗi: "new row violates row-level security policy"

→ Có nghĩa là RLS policy chưa được update. Chạy lại Bước 1 trong SQL trên.

### Lỗi: "could not establish connection"

→ Kiểm tra connection string trong .env file

### User vẫn không vào được Admin Dashboard

→ Đảm bảo đã tick checkbox "Đăng nhập với quyền Admin" trước khi login
