# 🍔 Food Delivery App - Nhóm 36

Ứng dụng đặt đồ ăn trực tuyến với React Native (Expo) và Node.js Backend.

## 📋 Tổng Quan

Dự án giao đồ ăn full-stack với các tính năng:

- 🏪 Duyệt nhà hàng và thực đơn
- 🛒 Giỏ hàng với cập nhật real-time
- 💳 Đặt hàng và thanh toán
- 📍 Quản lý địa chỉ giao hàng
- ⭐ Đánh giá nhà hàng
- ❤️ Yêu thích món ăn
- 👤 Quản lý tài khoản
- 🔐 Xác thực JWT
- 📱 Theo dõi đơn hàng real-time

## 🏗️ Kiến Trúc

```
├── backend/         → Node.js + Express + Prisma + PostgreSQL
├── frontend/        → React Native + Expo + TypeScript
├── DATABASE_SCHEMA.dbml
├── DATABASE_DIAGRAM.md
└── PROJECT_STRUCTURE.md
```

## 🚀 Cài Đặt & Chạy

### Yêu Cầu

- Node.js 18+
- PostgreSQL (hoặc Supabase)
- Expo CLI
- npm hoặc yarn

### Backend Setup

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env (copy từ .env.example và điền thông tin)
cp .env.example .env

# Chạy migrations
npx prisma migrate deploy

# Seed database với dữ liệu mẫu
node seed-complete-data.js

# Chạy development server
npm run dev
```

Backend chạy tại: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env
echo "EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1" > .env

# Chạy Expo development server
npm start
```

Sau đó:

- Nhấn `a` để mở Android emulator
- Nhấn `i` để mở iOS simulator
- Quét QR code bằng Expo Go app trên điện thoại

## 🗄️ Database

### Sử dụng Supabase (Recommended)

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Lấy Connection String (Transaction Pooler - Port 6543)
3. Cập nhật `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
   ```

### Schema

Database gồm 12 tables chính:

- users
- restaurants
- restaurant_categories
- menu_items
- carts / cart_items
- orders / order_items
- addresses
- reviews
- favorite_menu_items
- notifications

Chi tiết: xem `DATABASE_SCHEMA.dbml` và `DATABASE_DIAGRAM.md`

## 📱 Tính Năng

### Customer Features

- ✅ Đăng ký/Đăng nhập
- ✅ Duyệt nhà hàng theo rating, giá, loại món
- ✅ Tìm kiếm món ăn
- ✅ Xem chi tiết món, thực đơn nhà hàng
- ✅ Thêm vào giỏ hàng với ghi chú đặc biệt
- ✅ Quản lý nhiều địa chỉ giao hàng
- ✅ Đặt hàng và thanh toán
- ✅ Theo dõi đơn hàng real-time
- ✅ Đánh giá nhà hàng
- ✅ Lưu món ăn yêu thích
- ✅ Xem lịch sử đơn hàng
- ✅ Cập nhật profile, đổi mật khẩu

### Admin Features (Coming Soon)

- Dashboard thống kê
- Quản lý nhà hàng
- Quản lý món ăn
- Quản lý đơn hàng
- Quản lý người dùng

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT (access + refresh tokens)
- **Real-time**: Socket.io
- **Caching**: In-memory cache middleware
- **Logging**: Winston
- **Validation**: Joi / Zod

### Frontend

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: React Query + Context API
- **Navigation**: Expo Router
- **Storage**: AsyncStorage
- **HTTP Client**: Axios with interceptors
- **UI**: Custom components + React Native Paper
- **Images**: Expo Image with caching

## 📁 Cấu Trúc Project

Xem chi tiết tại: [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md)

### Backend Highlights

```
backend/src/
├── config/          # Database, environment, socket
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API endpoints
├── middleware/      # Auth, cache, error handling
└── utils/           # Helpers, logging
```

### Frontend Highlights

```
frontend/
├── app/pages/       # 25+ screens
├── components/      # Reusable UI components
├── lib/api/         # API client with auth
├── hooks/           # Custom React hooks
├── store/           # Global state
└── assets/          # Images, fonts
```

## 🔑 Environment Variables

### Backend `.env`

```env
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
PORT=5000
NODE_ENV=development
```

### Frontend `.env`

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## 📡 API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Main Routes

- `/auth` - Authentication (register, login, profile)
- `/restaurants` - Restaurant listings & details
- `/food` - Menu items, search, popular foods
- `/cart` - Shopping cart management
- `/orders` - Order placement & tracking
- `/favorites` - User favorites
- `/reviews` - Restaurant reviews
- `/addresses` - Delivery addresses
- `/admin` - Admin operations

Chi tiết API: xem `PROJECT_STRUCTURE.md` hoặc route files

## 🧪 Testing & Debugging

### Removed Files (Cleaned Up)

Đã xóa tất cả file test/debug tạm thời:

- ❌ `check-*.js` (10 files)
- ❌ `test-*.js` (5 files)
- ❌ `fix-*.js` (4 files)
- ❌ `create-*.js` (5 files)
- ❌ Bug fix notes (4 MD files)
- ❌ Empty folders

### Current Testing

- Backend: Manual testing với Postman/Thunder Client
- Frontend: Manual testing trên emulator/device
- Database: Seed script với data mẫu

## 🚧 Known Issues & Fixes

### ✅ Fixed Issues

1. **Database Connection** - Đã chuyển sang Transaction Pooler (port 6543)
2. **Menu Items Not Showing** - Fixed data extraction from nested response
3. **Category Filtering** - Fixed to check multiple category fields
4. **Reviews Display** - Added transformation for array responses
5. **Reviews UI** - Redesigned with avatars, proper spacing
6. **Profile Authentication** - Added token check before loading profile

### 🔄 Ongoing

- Socket.io real-time updates
- Image upload optimization
- Admin dashboard completion

## 📚 Documentation

- [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) - Detailed project structure
- [`DATABASE_SCHEMA.dbml`](./DATABASE_SCHEMA.dbml) - Database schema definition
- [`DATABASE_DIAGRAM.md`](./DATABASE_DIAGRAM.md) - Visual database diagram
- `backend/README.md` - Backend specific docs
- `frontend/README.md` - Frontend specific docs

## 👥 Team

**Nhóm 36** - Food Delivery App Development Team

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- Supabase for database hosting
- Expo for React Native framework
- Prisma for amazing ORM
- All open-source contributors

---

**Happy Coding! 🚀**

For questions or issues, please create an issue in the repository.
