# 📊 FOOD DELIVERY APP - DATABASE SCHEMA

## Sơ đồ ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    %% ============================================
    %% USER & AUTHENTICATION
    %% ============================================
    
    USER ||--o{ REFRESH_TOKEN : has
    USER ||--o{ ADDRESS : owns
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    USER ||--o{ NOTIFICATION : receives
    USER ||--o| CART : has
    USER ||--o| RESTAURANT : owns
    USER ||--o| DELIVERY_DRIVER : is
    USER ||--o{ FAVORITE_RESTAURANT : favorites
    USER ||--o{ FAVORITE_MENU_ITEM : favorites
    
    USER {
        uuid id PK
        string email UK
        string password
        string phoneNumber UK
        string fullName
        string avatar
        enum role "CUSTOMER/RESTAURANT_OWNER/DELIVERY_DRIVER/ADMIN"
        enum status "ACTIVE/INACTIVE/SUSPENDED/BANNED"
        boolean emailVerified
        datetime createdAt
        datetime updatedAt
    }
    
    REFRESH_TOKEN {
        uuid id PK
        string token UK
        uuid userId FK
        datetime expiresAt
        datetime createdAt
    }
    
    PASSWORD_RESET_TOKEN {
        uuid id PK
        string email
        string token UK
        datetime expiresAt
        boolean used
        datetime createdAt
    }
    
    %% ============================================
    %% ADDRESS
    %% ============================================
    
    ADDRESS ||--o{ ORDER : "delivery to"
    
    ADDRESS {
        uuid id PK
        uuid userId FK
        enum type "HOME/WORK/OTHER"
        string label
        string fullAddress
        float latitude
        float longitude
        boolean isDefault
        datetime createdAt
        datetime updatedAt
    }
    
    %% ============================================
    %% RESTAURANT & MENU
    %% ============================================
    
    RESTAURANT ||--o{ RESTAURANT_CATEGORY : has
    RESTAURANT ||--o{ MENU_ITEM : offers
    RESTAURANT ||--o{ ORDER : receives
    RESTAURANT ||--o{ REVIEW : receives
    RESTAURANT ||--o{ FAVORITE_RESTAURANT : "favorited by"
    
    RESTAURANT {
        uuid id PK
        uuid ownerId FK
        string name
        string description
        string logo
        string address
        float latitude
        float longitude
        string phoneNumber
        json openingHours
        float rating
        int totalReviews
        enum status "ACTIVE/INACTIVE/PENDING/SUSPENDED"
        boolean isOpen
        float deliveryFee
        float minOrderAmount
        int preparationTime
        datetime createdAt
        datetime updatedAt
    }
    
    RESTAURANT_CATEGORY ||--o{ MENU_ITEM : contains
    
    RESTAURANT_CATEGORY {
        uuid id PK
        uuid restaurantId FK
        string name
        string description
        int displayOrder
        datetime createdAt
        datetime updatedAt
    }
    
    MENU_ITEM ||--o{ CART_ITEM : "added to"
    MENU_ITEM ||--o{ ORDER_ITEM : "ordered as"
    MENU_ITEM ||--o{ FAVORITE_MENU_ITEM : "favorited by"
    
    MENU_ITEM {
        uuid id PK
        uuid restaurantId FK
        uuid categoryId FK
        string name
        string description
        string image
        float price
        float discountPrice
        enum status "AVAILABLE/UNAVAILABLE/OUT_OF_STOCK"
        boolean isVegetarian
        boolean isSpicy
        int calories
        int preparationTime
        datetime createdAt
        datetime updatedAt
    }
    
    %% ============================================
    %% CART
    %% ============================================
    
    CART ||--o{ CART_ITEM : contains
    
    CART {
        uuid id PK
        uuid userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    CART_ITEM {
        uuid id PK
        uuid cartId FK
        uuid menuItemId FK
        int quantity
        string specialInstructions
        datetime createdAt
        datetime updatedAt
    }
    
    %% ============================================
    %% ORDER
    %% ============================================
    
    ORDER ||--o{ ORDER_ITEM : contains
    ORDER ||--o{ ORDER_TRACKING : tracks
    ORDER ||--o| REVIEW : "reviewed by"
    ORDER }o--o| DELIVERY_DRIVER : "delivered by"
    
    ORDER {
        uuid id PK
        string orderNumber UK
        uuid userId FK
        uuid restaurantId FK
        uuid addressId FK
        uuid driverId FK
        float subtotal
        float deliveryFee
        float tax
        float discount
        float total
        enum status "PENDING/CONFIRMED/PREPARING/READY/OUT_FOR_DELIVERY/DELIVERED/CANCELLED"
        enum paymentMethod "CASH/CREDIT_CARD/DEBIT_CARD/ONLINE_BANKING/E_WALLET"
        enum paymentStatus "PENDING/PAID/FAILED/REFUNDED"
        datetime orderDate
        datetime confirmedAt
        datetime deliveredAt
        string specialInstructions
        datetime createdAt
        datetime updatedAt
    }
    
    ORDER_ITEM {
        uuid id PK
        uuid orderId FK
        uuid menuItemId FK
        int quantity
        float price
        string specialInstructions
        datetime createdAt
    }
    
    ORDER_TRACKING {
        uuid id PK
        uuid orderId FK
        enum status
        string message
        float latitude
        float longitude
        datetime createdAt
    }
    
    %% ============================================
    %% DELIVERY DRIVER
    %% ============================================
    
    DELIVERY_DRIVER ||--o{ ORDER : delivers
    
    DELIVERY_DRIVER {
        uuid id PK
        uuid userId FK
        string vehicleType
        string vehicleNumber
        string licenseNumber
        enum status "AVAILABLE/BUSY/OFFLINE"
        float currentLatitude
        float currentLongitude
        float rating
        int totalDeliveries
        datetime createdAt
        datetime updatedAt
    }
    
    %% ============================================
    %% REVIEW & FAVORITES
    %% ============================================
    
    REVIEW {
        uuid id PK
        uuid userId FK
        uuid restaurantId FK
        uuid orderId FK
        int rating "1-5"
        string comment
        array images
        datetime createdAt
        datetime updatedAt
    }
    
    FAVORITE_RESTAURANT {
        uuid id PK
        uuid userId FK
        uuid restaurantId FK
        datetime createdAt
    }
    
    FAVORITE_MENU_ITEM {
        uuid id PK
        uuid userId FK
        uuid menuItemId FK
        datetime createdAt
        datetime updatedAt
    }
    
    %% ============================================
    %% NOTIFICATION
    %% ============================================
    
    NOTIFICATION {
        uuid id PK
        uuid userId FK
        enum type "ORDER_UPDATE/PROMOTION/SYSTEM/DELIVERY/REVIEW"
        string title
        string message
        json data
        boolean isRead
        datetime createdAt
    }
```

---

## 📋 Tổng quan Tables

| # | Table | Records | Purpose |
|---|-------|---------|---------|
| 1 | users | Core | Tất cả user accounts (customer, owner, driver, admin) |
| 2 | refresh_tokens | Auth | JWT refresh tokens |
| 3 | password_reset_tokens | Auth | Password reset flow |
| 4 | addresses | Location | Delivery addresses |
| 5 | restaurants | Business | Restaurant profiles |
| 6 | restaurant_categories | Menu | Menu organization |
| 7 | menu_items | Product | Food items |
| 8 | carts | Shopping | Shopping cart (1 per user) |
| 9 | cart_items | Shopping | Items in cart |
| 10 | orders | Transaction | Customer orders |
| 11 | order_items | Transaction | Items in order |
| 12 | order_tracking | Tracking | Order status history |
| 13 | delivery_drivers | Delivery | Driver profiles |
| 14 | reviews | Feedback | Ratings & reviews |
| 15 | favorite_restaurants | Feature | Saved restaurants |
| 16 | favorite_menu_items | Feature | Saved menu items |
| 17 | notifications | Communication | Push notifications |

---

## 🔗 Key Relationships

### One-to-One (1:1)
- `User ←→ Restaurant` (owner)
- `User ←→ DeliveryDriver`
- `User ←→ Cart`
- `Order ←→ Review`

### One-to-Many (1:N)
- `User → Addresses`
- `User → Orders`
- `User → Reviews`
- `User → Notifications`
- `Restaurant → Categories → MenuItems`
- `Restaurant → Orders`
- `Order → OrderItems`
- `Order → OrderTracking`

### Many-to-Many (M:N)
- `User ←→ FavoriteRestaurant ←→ Restaurant`
- `User ←→ FavoriteMenuItem ←→ MenuItem`

---

## 🎯 Database Indexes

### Primary Keys (PK)
- Tất cả tables đều có `id` (UUID) làm primary key

### Unique Keys (UK)
- `users.email`
- `users.phoneNumber`
- `restaurants.ownerId`
- `orders.orderNumber`
- `refresh_tokens.token`
- `password_reset_tokens.token`
- `cart_items.[cartId, menuItemId]` (composite)
- `favorite_restaurants.[userId, restaurantId]` (composite)
- `favorite_menu_items.[userId, menuItemId]` (composite)

### Foreign Keys (FK)
- Tất cả relationships đều có foreign key constraints
- `onDelete: Cascade` cho most relations
- `onDelete: SetNull` cho optional relations

---

## 📊 Data Flow Examples

### User đặt hàng:
```
1. User browses → menuItems
2. User adds to cart → cart, cartItems
3. User checkout → order, orderItems created
4. Restaurant confirms → order.status = CONFIRMED
5. Driver accepts → order.driverId updated
6. Tracking updates → orderTracking records
7. Delivered → order.status = DELIVERED
8. User reviews → review created
```

### Restaurant Owner Journey:
```
1. Register → user (role = RESTAURANT_OWNER)
2. Create profile → restaurant
3. Add categories → restaurantCategories
4. Add items → menuItems
5. Receive orders → orders
6. Update status → orderTracking
```

### Delivery Driver Journey:
```
1. Register → user (role = DELIVERY_DRIVER)
2. Create profile → deliveryDriver
3. Set available → deliveryDriver.status = AVAILABLE
4. Accept order → order.driverId updated
5. Update location → orderTracking
6. Complete → order.status = DELIVERED
```

---

## 🎨 Cách xem diagram này:

### **Option 1: VS Code (Khuyên dùng)**
1. Cài extension: **Markdown Preview Mermaid Support**
2. Mở file này trong VS Code
3. Nhấn `Ctrl+Shift+V` để preview
4. Sẽ thấy diagram đầy màu sắc!

### **Option 2: Prisma Studio (Đang chạy)**
- Mở browser: http://localhost:5555
- Xem tất cả tables và data trực quan
- Click vào relations để navigate

### **Option 3: Online Mermaid Editor**
- Copy code mermaid ở trên
- Paste vào: https://mermaid.live
- Sẽ render diagram interactive

### **Option 4: Generate ERD từ Prisma**
```bash
# Install prisma-erd-generator
npm install -D prisma-erd-generator @mermaid-js/mermaid-cli

# Add to schema.prisma:
generator erd {
  provider = "prisma-erd-generator"
}

# Generate
npx prisma generate
```

---

## 🔍 Query Examples

### Lấy user với tất cả relations:
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    addresses: true,
    orders: {
      include: {
        restaurant: true,
        items: {
          include: { menuItem: true }
        }
      }
    },
    cart: {
      include: {
        items: {
          include: { menuItem: true }
        }
      }
    },
    favoriteRestaurants: {
      include: { restaurant: true }
    },
    favoriteMenuItems: {
      include: { menuItem: true }
    }
  }
});
```

### Lấy restaurant với menu:
```typescript
const restaurant = await prisma.restaurant.findUnique({
  where: { id: restaurantId },
  include: {
    owner: true,
    categories: {
      include: {
        menuItems: {
          where: { status: 'AVAILABLE' }
        }
      }
    },
    reviews: {
      include: { user: true }
    }
  }
});
```

### Lấy order với tracking:
```typescript
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    user: true,
    restaurant: true,
    address: true,
    driver: { include: { user: true } },
    items: { include: { menuItem: true } },
    tracking: { orderBy: { createdAt: 'desc' } },
    review: true
  }
});
```
