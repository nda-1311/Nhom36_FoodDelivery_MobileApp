# 🔐 Hướng Dẫn Setup Admin System

## 📋 Tổng Quan

Hệ thống Admin cho phép quản lý toàn bộ ứng dụng Food Delivery, bao gồm:

- 👥 Quản lý người dùng
- 📦 Quản lý đơn hàng
- 🏪 Quản lý nhà hàng (coming soon)
- 🍔 Quản lý món ăn (coming soon)
- 📊 Thống kê và báo cáo

---

## 🚀 Bước 1: Tạo Database Tables

### 1.1 Mở Supabase Dashboard

1. Truy cập: https://supabase.com/dashboard
2. Chọn project của bạn
3. Click **SQL Editor** (icon ⚡ bên trái)
4. Click **New query**

### 1.2 Chạy Migration SQL

1. Mở file `supabase/migrations/create_admin_system.sql`
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor
4. Click **Run** (hoặc Ctrl+Enter)

### 1.3 Kiểm Tra

Vào **Table Editor**, bạn sẽ thấy bảng mới:

- `admin_config` - Lưu thông tin admin và quyền hạn

---

## 👤 Bước 2: Thêm Admin User Đầu Tiên

### 2.1 Lấy User ID

1. Vào Supabase Dashboard
2. Click **Authentication** → **Users**
3. Tìm user bạn muốn làm admin
4. Copy **ID** của user (dạng UUID)

### 2.2 Thêm Admin vào Database

Chạy SQL query này (thay `YOUR_USER_ID` bằng ID thực):

```sql
INSERT INTO public.admin_config (user_id, role, permissions)
VALUES (
  'YOUR_USER_ID_HERE',
  'super_admin',
  '["read", "write", "delete", "manage_admins"]'::jsonb
);
```

**Ví dụ:**

```sql
INSERT INTO public.admin_config (user_id, role, permissions)
VALUES (
  'abc123-def456-ghi789-jkl012',
  'super_admin',
  '["read", "write", "delete", "manage_admins"]'::jsonb
);
```

---

## 🎯 Bước 3: Truy Cập Admin Panel

### 3.1 Đăng Nhập

1. Mở app
2. Đăng nhập bằng tài khoản đã được thêm quyền admin

### 3.2 Vào Trang Admin

1. Click tab **Account** (Tài khoản) ở bottom navigation
2. Bạn sẽ thấy card **"Trang quản trị Admin"** màu đỏ nổi bật
3. Click vào card này để vào Admin Dashboard

### 3.3 Admin Dashboard

Từ dashboard, bạn có thể:

- Xem tổng quan thống kê
- Quản lý người dùng
- Quản lý đơn hàng
- Xem báo cáo chi tiết

---

## 🔒 Các Loại Role Admin

| Role          | Mô tả                 | Quyền hạn                                   |
| ------------- | --------------------- | ------------------------------------------- |
| `super_admin` | Quản trị viên tối cao | Toàn quyền quản lý hệ thống, thêm/xóa admin |
| `admin`       | Quản trị viên         | Quản lý users, orders, products             |
| `moderator`   | Điều hành viên        | Xem và cập nhật orders, users               |

---

## 🛠️ Các Functions RPC Có Sẵn

### 1. is_admin(user_id UUID)

Kiểm tra user có phải admin không

```sql
SELECT is_admin('user-id-here');
```

### 2. is_super_admin(user_id UUID)

Kiểm tra user có phải super admin không

```sql
SELECT is_super_admin('user-id-here');
```

### 3. get_user_role(user_id UUID)

Lấy role của user

```sql
SELECT get_user_role('user-id-here');
-- Trả về: 'super_admin', 'admin', 'moderator', hoặc 'user'
```

---

## 📊 Row Level Security (RLS)

Hệ thống đã được cấu hình RLS để bảo mật:

### admin_config table

- ✅ Chỉ admin mới xem được danh sách admin
- ✅ Chỉ super_admin mới thêm/xóa admin
- ✅ User thường không thể truy cập

### orders, restaurants, food_items tables

- ✅ Admin có quyền xem/sửa/xóa tất cả
- ✅ User thường chỉ thấy dữ liệu của mình

---

## 🔧 Thêm Admin Mới (Chỉ Super Admin)

### Cách 1: Qua SQL

```sql
INSERT INTO public.admin_config (user_id, role, permissions)
VALUES (
  'new-user-id',
  'admin',  -- hoặc 'moderator'
  '["read", "write"]'::jsonb
);
```

### Cách 2: Qua App (Coming Soon)

Trang Admin Users sẽ có chức năng promote user lên admin

---

## 🎨 Tùy Chỉnh Permissions

Permissions được lưu dưới dạng JSONB array:

```sql
-- Full permissions (super admin)
'["read", "write", "delete", "manage_admins"]'::jsonb

-- Admin thông thường
'["read", "write", "delete"]'::jsonb

-- Moderator
'["read", "write"]'::jsonb

-- Chỉ xem
'["read"]'::jsonb
```

---

## 🐛 Troubleshooting

### Lỗi: "Truy cập bị từ chối"

**Nguyên nhân:** User chưa được thêm vào bảng `admin_config`

**Giải pháp:**

1. Kiểm tra user ID có đúng không
2. Chạy lại query INSERT vào `admin_config`
3. Đăng xuất và đăng nhập lại

### Lỗi: "Không thể tải thống kê"

**Nguyên nhân:** Thiếu tables: users, orders, restaurants, food_items

**Giải pháp:**

1. Đảm bảo đã tạo đầy đủ tables trong database
2. Kiểm tra RLS policies cho các tables

### Admin card không hiện trên Account page

**Nguyên nhân:** useAdmin hook chưa load xong hoặc user không phải admin

**Giải pháp:**

1. Kiểm tra console log xem hook có chạy không
2. Verify user đã được thêm vào `admin_config`
3. Clear app cache và restart

---

## 📝 Cấu Trúc Files

```
app/pages/
  ├── AdminDashboardPage.tsx     # Dashboard chính
  ├── AdminUsersPage.tsx         # Quản lý users
  ├── AdminOrdersPage.tsx        # Quản lý orders
  ├── AdminRestaurantsPage.tsx   # (Coming soon)
  ├── AdminFoodItemsPage.tsx     # (Coming soon)
  └── AdminStatisticsPage.tsx    # (Coming soon)

hooks/
  └── useAdmin.ts                # Hook kiểm tra admin

supabase/migrations/
  └── create_admin_system.sql    # Migration SQL

types/
  └── navigation.ts              # Admin page types
```

---

## 🎯 Tính Năng Đã Hoàn Thành

- ✅ Admin Dashboard với thống kê tổng quan
- ✅ Quản lý người dùng (xem, tìm kiếm, xóa)
- ✅ Quản lý đơn hàng (xem, cập nhật trạng thái)
- ✅ RLS bảo mật cho admin
- ✅ Admin role system (super_admin, admin, moderator)
- ✅ Admin card trên Account page

---

## 🚧 Coming Soon

- 📊 Admin Statistics Page (biểu đồ doanh thu)
- 🏪 Quản lý nhà hàng (CRUD operations)
- 🍔 Quản lý món ăn (CRUD operations)
- 👥 Promote/Demote users to admin từ app
- 📈 Báo cáo chi tiết
- 📧 Gửi thông báo hệ thống

---

## 🔐 Bảo Mật

**⚠️ QUAN TRỌNG:**

1. **Không chia sẻ** Service Role Key
2. **Không hardcode** admin credentials trong code
3. **Luôn kiểm tra** quyền admin trước khi thực hiện thao tác nhạy cảm
4. **Sử dụng RLS** để bảo vệ dữ liệu
5. **Log tất cả** admin actions để audit

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. ✅ Kiểm tra console logs
2. ✅ Verify database tables và RLS policies
3. ✅ Check Supabase Dashboard → Logs
4. ✅ Đảm bảo user đã được thêm vào `admin_config`

---

## ✨ Hoàn Thành!

Giờ bạn đã có hệ thống Admin đầy đủ! 🎉

**Next Steps:**

1. Thêm admin user đầu tiên
2. Đăng nhập và test các tính năng
3. Tùy chỉnh permissions theo nhu cầu
4. Triển khai các tính năng admin mở rộng
