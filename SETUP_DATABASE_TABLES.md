# Setup Database Tables cho Address, Payment Methods và Notifications

## 📋 Hướng dẫn tạo các bảng trong Supabase

### Bước 1: Truy cập Supabase Dashboard
1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** từ menu bên trái

### Bước 2: Tạo các bảng

Chạy lần lượt 3 file SQL sau trong SQL Editor:

#### 1. Tạo bảng `addresses` (Địa chỉ giao hàng)
```sql
-- Copy nội dung từ file: supabase/migrations/create_addresses_table.sql
```
**Paste toàn bộ nội dung file và nhấn RUN**

#### 2. Tạo bảng `payment_methods` (Phương thức thanh toán)
```sql
-- Copy nội dung từ file: supabase/migrations/create_payment_methods_table.sql
```
**Paste toàn bộ nội dung file và nhấn RUN**

#### 3. Tạo bảng `notifications` (Thông báo)
```sql
-- Copy nội dung từ file: supabase/migrations/create_notifications_table.sql
```
**Paste toàn bộ nội dung file và nhấn RUN**

### Bước 3: Kiểm tra

1. Vào **Table Editor** trong Supabase Dashboard
2. Bạn sẽ thấy 3 bảng mới:
   - ✅ `addresses`
   - ✅ `payment_methods`
   - ✅ `notifications`

### 📊 Cấu trúc các bảng

#### `addresses` - Địa chỉ giao hàng
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| label | TEXT | Loại địa chỉ (home/work/other) |
| full_address | TEXT | Địa chỉ đầy đủ |
| recipient_name | TEXT | Tên người nhận |
| recipient_phone | TEXT | SĐT người nhận |
| is_default | BOOLEAN | Địa chỉ mặc định |
| latitude | DECIMAL | Vĩ độ (optional) |
| longitude | DECIMAL | Kinh độ (optional) |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

#### `payment_methods` - Phương thức thanh toán
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| type | TEXT | Loại (card/momo/zalopay/cash) |
| card_number | TEXT | Số thẻ (nếu là card) |
| card_holder | TEXT | Tên chủ thẻ |
| expiry_date | TEXT | Ngày hết hạn |
| phone_number | TEXT | SĐT (nếu là ví điện tử) |
| is_default | BOOLEAN | Phương thức mặc định |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

#### `notifications` - Thông báo
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| type | TEXT | Loại (order/promotion/system/info) |
| title | TEXT | Tiêu đề thông báo |
| message | TEXT | Nội dung thông báo |
| is_read | BOOLEAN | Đã đọc chưa |
| link | TEXT | Link liên quan (optional) |
| created_at | TIMESTAMP | Ngày tạo |

### 🔒 Bảo mật (Row Level Security)

Tất cả 3 bảng đều được bảo vệ bởi RLS với các policy:
- ✅ Users chỉ có thể xem/sửa/xóa dữ liệu của chính họ
- ✅ Tự động lọc theo `user_id` = `auth.uid()`
- ✅ Ngăn chặn truy cập trái phép

### 🎯 Sau khi setup xong

Reload lại app:
```bash
npx expo start -c
```

Các trang sau sẽ hoạt động:
- ✅ Quản lý địa chỉ giao hàng
- ✅ Quản lý phương thức thanh toán
- ✅ Thông báo

### ❗ Lưu ý quan trọng

1. **Phải đăng nhập** trước khi sử dụng các tính năng này
2. Dữ liệu được lưu trên Supabase cloud
3. Mỗi user chỉ thấy dữ liệu của mình
4. Có thể thêm sample data để test

### 🧪 Thêm dữ liệu test (Optional)

Sau khi đăng nhập, bạn có thể thêm dữ liệu test bằng SQL:

```sql
-- Thêm địa chỉ test (thay YOUR_USER_ID bằng user_id thực)
INSERT INTO public.addresses (user_id, label, full_address, recipient_name, recipient_phone, is_default)
VALUES 
  ('YOUR_USER_ID', 'home', '123 Nguyen Hue, Quan 1, TP.HCM', 'Nguyen Van A', '0123456789', true);

-- Thêm phương thức thanh toán test
INSERT INTO public.payment_methods (user_id, type, is_default)
VALUES 
  ('YOUR_USER_ID', 'cash', true);

-- Thêm thông báo test
INSERT INTO public.notifications (user_id, type, title, message)
VALUES 
  ('YOUR_USER_ID', 'system', 'Chào mừng!', 'Chào mừng bạn đến với ứng dụng Food Delivery');
```

### 📞 Hỗ trợ

Nếu gặp lỗi khi chạy SQL, kiểm tra:
1. ✅ Đã chọn đúng project trong Supabase
2. ✅ Có quyền admin/owner của project
3. ✅ Database đang hoạt động bình thường
