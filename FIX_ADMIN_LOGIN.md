# Fix Admin Login Issue

## Vấn đề

User bị logout ngay sau khi login với quyền admin do RLS policy của bảng `admin_config` không cho phép user xem record của chính họ.

## Giải pháp

Chạy SQL sau trong Supabase SQL Editor:

### Bước 1: Mở Supabase Dashboard

1. Truy cập https://supabase.com
2. Vào project của bạn
3. Mở **SQL Editor** (biểu tượng ⚡)

### Bước 2: Chạy SQL

Copy và paste SQL sau:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Only admins can view admin config" ON public.admin_config;

-- Create new policy that allows:
-- 1. Users to view their own admin config
-- 2. Admins to view all admin configs
CREATE POLICY "Users can view own admin config"
    ON public.admin_config FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.admin_config
            WHERE user_id = auth.uid()
        )
    );
```

### Bước 3: Verify

Sau khi chạy SQL, thử login lại với checkbox admin được chọn.

## Giải thích

Policy cũ yêu cầu phải là admin mới xem được admin_config, tạo ra vòng lặp logic.
Policy mới cho phép:

- ✅ Mọi user có thể xem record admin_config của chính họ (`user_id = auth.uid()`)
- ✅ Admin có thể xem tất cả admin_config khác

## Test

1. Login với tài khoản admin → Tick checkbox "Đăng nhập với quyền Admin"
2. Nên vào được Admin Dashboard và không bị logout
