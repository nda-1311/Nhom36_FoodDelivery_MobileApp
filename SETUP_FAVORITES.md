# Hướng dẫn Setup Bảng Favorites

## Vấn đề
- Favorites không được lưu vào database
- F5 là mất hết dữ liệu
- Ảnh không hiển thị

## Giải pháp

### Bước 1: Tạo bảng `favorites` trong Supabase

**Cách 1: Sử dụng Supabase Dashboard (Khuyến nghị)**

1. Mở Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Click vào **SQL Editor** (biểu tượng `</>` ở sidebar trái)
4. Click **New query**
5. Copy toàn bộ nội dung file `supabase/migrations/create_favorites_table.sql`
6. Paste vào SQL Editor
7. Click **Run** để thực thi

**Cách 2: Sử dụng Supabase CLI**

```bash
# Cài đặt Supabase CLI (nếu chưa có)
npm install -g supabase

# Link project với Supabase
npx supabase link --project-ref <your-project-ref>

# Push migration lên Supabase
npx supabase db push
```

### Bước 2: Kiểm tra bảng đã tạo thành công

1. Vào **Table Editor** trong Supabase Dashboard
2. Tìm bảng `favorites`
3. Kiểm tra các cột:
   - `id` (UUID)
   - `user_id` (UUID)
   - `food_item_id` (TEXT)
   - `food_name` (TEXT)
   - `food_image` (TEXT)
   - `price` (NUMERIC)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

### Bước 3: Kiểm tra RLS Policies

Vào **Authentication** > **Policies** > Chọn bảng `favorites`

Đảm bảo có 4 policies:
- ✅ Users can view own favorites (SELECT)
- ✅ Users can insert own favorites (INSERT)
- ✅ Users can update own favorites (UPDATE)
- ✅ Users can delete own favorites (DELETE)

### Bước 4: Test lại app

1. Restart Expo server:
   ```bash
   npx expo start -c
   ```

2. Mở app và thử:
   - ❤️ Thêm món vào favorites
   - ✅ Kiểm tra console log (sẽ thấy log từ useFavorites hook)
   - 🔄 F5 reload app → favorites vẫn còn
   - 🖼️ Ảnh hiển thị đúng

### Bước 5: Debug nếu vẫn lỗi

Mở Chrome DevTools Console và xem log:
- `✅ [useFavorites] Adding favorite:` - thành công
- `❌ [useFavorites] Insert error:` - lỗi khi insert
- `❌ [useFavorites] No userId available` - chưa đăng nhập

**Nếu thấy lỗi "No userId":**
- Đảm bảo user đã đăng nhập
- Kiểm tra `auth.users` table có user không

**Nếu thấy lỗi RLS:**
- Kiểm tra lại policies
- Đảm bảo `auth.uid()` khớp với `user_id` trong table

## Kết quả mong đợi

✅ Click ❤️ → Lưu vào database
✅ F5 reload → Dữ liệu vẫn còn
✅ Ảnh hiển thị đúng
✅ Xóa favorites → Cập nhật realtime
