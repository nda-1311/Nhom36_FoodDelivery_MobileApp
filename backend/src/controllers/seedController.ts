/**
 * Seed Controller
 * API endpoints for seeding database with sample data
 */

import { Request, Response } from 'express';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Restaurant data with proper images from Unsplash
const restaurants = [
  {
    name: 'Food Delivery Restaurant',
    description: 'Nhà hàng ẩm thực đa dạng, phục vụ món Việt và quốc tế',
    address: '123 Nguyễn Huệ Q1, TP HCM',
    phoneNumber: '0123456789',
    email: 'fooddelivery@restaurant.com',
    openingHours: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '08:00', close: '22:00' },
    },
    deliveryFee: 15000,
    minOrderAmount: 50000,
    rating: 4.5,
    coverImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    status: 'ACTIVE' as const,
    isOpen: true,
  },
  {
    name: 'Phở Hà Nội',
    description: 'Chuyên các món phở truyền thống Hà Nội',
    address: '456 Lê Lợi Q1, TP HCM',
    phoneNumber: '0987654321',
    email: 'phohanoi@restaurant.com',
    openingHours: {
      monday: { open: '06:00', close: '23:00' },
      tuesday: { open: '06:00', close: '23:00' },
      wednesday: { open: '06:00', close: '23:00' },
      thursday: { open: '06:00', close: '23:00' },
      friday: { open: '06:00', close: '23:00' },
      saturday: { open: '06:00', close: '23:00' },
      sunday: { open: '06:00', close: '23:00' },
    },
    deliveryFee: 12000,
    minOrderAmount: 40000,
    rating: 4.7,
    coverImage:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
    status: 'ACTIVE' as const,
    isOpen: true,
  },
  {
    name: 'Bún Bò Huế Authentic',
    description: 'Bún bò Huế chính gốc với công thức gia truyền',
    address: '789 Pasteur Q3, TP HCM',
    phoneNumber: '0901234567',
    email: 'bunbohue@restaurant.com',
    openingHours: {
      monday: { open: '07:00', close: '21:00' },
      tuesday: { open: '07:00', close: '21:00' },
      wednesday: { open: '07:00', close: '21:00' },
      thursday: { open: '07:00', close: '21:00' },
      friday: { open: '07:00', close: '21:00' },
      saturday: { open: '07:00', close: '21:00' },
      sunday: { open: '07:00', close: '21:00' },
    },
    deliveryFee: 10000,
    minOrderAmount: 35000,
    rating: 4.6,
    coverImage:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    status: 'ACTIVE' as const,
    isOpen: true,
  },
  {
    name: 'Burger King Street',
    description: 'Burger Mỹ đậm đà, khoai tây chiên giòn rụm',
    address: '321 Võ Văn Tần Q3, TP HCM',
    phoneNumber: '0912345678',
    email: 'burgerking@restaurant.com',
    openingHours: {
      monday: { open: '10:00', close: '23:00' },
      tuesday: { open: '10:00', close: '23:00' },
      wednesday: { open: '10:00', close: '23:00' },
      thursday: { open: '10:00', close: '23:00' },
      friday: { open: '10:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '23:00' },
    },
    deliveryFee: 20000,
    minOrderAmount: 60000,
    rating: 4.3,
    coverImage:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    status: 'ACTIVE' as const,
    isOpen: true,
  },
  {
    name: 'Sushi Tokyo',
    description: 'Sushi Nhật Bản tươi ngon, đầu bếp người Nhật',
    address: '654 Hai Bà Trưng Q1, TP HCM',
    phoneNumber: '0923456789',
    email: 'sushitokyo@restaurant.com',
    openingHours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '22:00' },
      friday: { open: '11:00', close: '22:00' },
      saturday: { open: '11:00', close: '22:00' },
      sunday: { open: '11:00', close: '22:00' },
    },
    deliveryFee: 25000,
    minOrderAmount: 80000,
    rating: 4.8,
    coverImage:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    status: 'ACTIVE' as const,
    isOpen: true,
  },
  {
    name: 'Pizza Italia',
    description: 'Pizza Ý truyền thống, nướng lò gỗ',
    address: '987 Nguyễn Đình Chiểu Q3, TP HCM',
    phoneNumber: '0934567890',
    email: 'pizzaitalia@restaurant.com',
    openingHours: {
      monday: { open: '11:00', close: '23:00' },
      tuesday: { open: '11:00', close: '23:00' },
      wednesday: { open: '11:00', close: '23:00' },
      thursday: { open: '11:00', close: '23:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '11:00', close: '23:00' },
      sunday: { open: '11:00', close: '23:00' },
    },
    deliveryFee: 18000,
    minOrderAmount: 70000,
    rating: 4.4,
    coverImage:
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
    status: 'ACTIVE' as const,
    isOpen: true,
  },
];

// Food items with proper images matching the food name
const foodItemsData = [
  // Vietnamese Food
  {
    name: 'Phở Bò Tái',
    description: 'Phở bò truyền thống Hà Nội với thịt bò tái mềm',
    price: 45000,
    category: 'Món Việt',
    imageUrl:
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 450,
    preparationTime: 15,
    restaurantName: 'Phở Hà Nội',
  },
  {
    name: 'Phở Gà',
    description: 'Phở gà thơm ngon, nước dùng trong vắt',
    price: 40000,
    category: 'Món Việt',
    imageUrl:
      'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 380,
    preparationTime: 15,
    restaurantName: 'Phở Hà Nội',
  },
  {
    name: 'Bún Bò Huế',
    description: 'Bún bò Huế cay nồng đặc trưng miền Trung',
    price: 50000,
    category: 'Món Việt',
    imageUrl:
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80',
    isVegetarian: false,
    isSpicy: true,
    calories: 520,
    preparationTime: 20,
    restaurantName: 'Bún Bò Huế Authentic',
  },
  {
    name: 'Bún Chả Hà Nội',
    description: 'Bún chả Hà Nội với thịt nướng thơm lừng',
    price: 48000,
    category: 'Món Việt',
    imageUrl:
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 480,
    preparationTime: 18,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Cơm Tấm Sườn Bì Chả',
    description: 'Cơm tấm Sài Gòn với sườn nướng, bì và chả',
    price: 42000,
    category: 'Món Việt',
    imageUrl:
      'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 550,
    preparationTime: 12,
    restaurantName: 'Food Delivery Restaurant',
  },

  // Burgers
  {
    name: 'Classic Beef Burger',
    description: 'Burger thịt bò Angus, phô mai, rau xà lách, cà chua',
    price: 75000,
    category: 'Burger',
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 680,
    preparationTime: 12,
    restaurantName: 'Burger King Street',
  },
  {
    name: 'Cheese Burger',
    description: 'Burger phô mai tan chảy, thịt bò tươi',
    price: 65000,
    category: 'Burger',
    imageUrl:
      'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 620,
    preparationTime: 10,
    restaurantName: 'Burger King Street',
  },
  {
    name: 'Chicken Burger',
    description: 'Burger gà giòn rụm với sốt mayo đặc biệt',
    price: 60000,
    category: 'Burger',
    imageUrl:
      'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 580,
    preparationTime: 10,
    restaurantName: 'Burger King Street',
  },

  // Sushi
  {
    name: 'Salmon Sushi Set',
    description: 'Set sushi cá hồi tươi, wasabi, gừng',
    price: 120000,
    category: 'Sushi',
    imageUrl:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 450,
    preparationTime: 15,
    restaurantName: 'Sushi Tokyo',
  },
  {
    name: 'California Roll',
    description: 'Sushi cuộn California với cua, bơ, dưa chuột',
    price: 95000,
    category: 'Sushi',
    imageUrl:
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 380,
    preparationTime: 12,
    restaurantName: 'Sushi Tokyo',
  },
  {
    name: 'Sashimi Mix',
    description: 'Sashimi hỗn hợp cá hồi, cá ngừ, bạch tuộc',
    price: 150000,
    category: 'Sushi',
    imageUrl:
      'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 320,
    preparationTime: 18,
    restaurantName: 'Sushi Tokyo',
  },

  // Pizza
  {
    name: 'Margherita Pizza',
    description: 'Pizza Margherita cổ điển với cà chua, phô mai mozzarella',
    price: 85000,
    category: 'Pizza',
    imageUrl:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    isVegetarian: true,
    isSpicy: false,
    calories: 720,
    preparationTime: 20,
    restaurantName: 'Pizza Italia',
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Pizza pepperoni Mỹ với xúc xích cay',
    price: 95000,
    category: 'Pizza',
    imageUrl:
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
    isVegetarian: false,
    isSpicy: true,
    calories: 820,
    preparationTime: 20,
    restaurantName: 'Pizza Italia',
  },
  {
    name: 'Hawaiian Pizza',
    description: 'Pizza Hawaii với thơm, giăm bông, phô mai',
    price: 90000,
    category: 'Pizza',
    imageUrl:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 750,
    preparationTime: 20,
    restaurantName: 'Pizza Italia',
  },

  // Drinks & Desserts
  {
    name: 'Sinh Tố Bơ',
    description: 'Sinh tố bơ béo ngậy, thơm ngon',
    price: 30000,
    category: 'Đồ Uống',
    imageUrl:
      'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&q=80',
    isVegetarian: true,
    isSpicy: false,
    calories: 320,
    preparationTime: 5,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Sinh Tố Dâu',
    description: 'Sinh tố dâu tây tươi mát lạnh',
    price: 32000,
    category: 'Đồ Uống',
    imageUrl:
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80',
    isVegetarian: true,
    isSpicy: false,
    calories: 250,
    preparationTime: 5,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Nước Ép Cam',
    description: 'Nước cam tươi nguyên chất 100%',
    price: 28000,
    category: 'Đồ Uống',
    imageUrl:
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80',
    isVegetarian: true,
    isSpicy: false,
    calories: 120,
    preparationTime: 5,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Trà Đào Cam Sả',
    description: 'Trá đào cam sả mát lạnh, thơm ngon',
    price: 35000,
    category: 'Đồ Uống',
    imageUrl:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
    isVegetarian: true,
    isSpicy: false,
    calories: 180,
    preparationTime: 5,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Trà Sữa Matcha',
    description: 'Trà sữa matcha Nhật Bản, vị đắng nhẹ',
    price: 38000,
    category: 'Đồ Uống',
    imageUrl:
      'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80',
    isVegetarian: true,
    isSpicy: false,
    calories: 290,
    preparationTime: 5,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Cà Phê Sữa Đá',
    description: 'Cà phê phin truyền thống Việt Nam',
    price: 25000,
    category: 'Đồ Uống',
    imageUrl:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    isVegetarian: true,
    isSpicy: false,
    calories: 150,
    preparationTime: 5,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Cà Phê Đen Đá',
    description: 'Cà phê đen nguyên chất, đắng đậm',
    price: 20000,
    category: 'Đồ Uống',
    imageUrl:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    isVegetarian: true,
    isSpicy: false,
    calories: 5,
    preparationTime: 5,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Nước Dừa Tươi',
    description: 'Nước dừa xiêm tươi mát, ngọt thanh',
    price: 22000,
    category: 'Đồ Uống',
    imageUrl:
      'https://images.unsplash.com/photo-1585238341710-4a4bd5142ba2?w=800&q=80',
    isVegetarian: true,
    isSpicy: false,
    calories: 80,
    preparationTime: 3,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Tiramisu',
    description: 'Bánh Tiramisu Ý nguyên bản với mascarpone',
    price: 45000,
    category: 'Tráng Miệng',
    imageUrl:
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',
    isVegetarian: true,
    isSpicy: false,
    calories: 380,
    preparationTime: 3,
    restaurantName: 'Pizza Italia',
  },
  {
    name: 'Kem Flan',
    description: 'Kem flan caramel mềm mịn',
    price: 20000,
    category: 'Tráng Miệng',
    imageUrl:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
    isVegetarian: true,
    isSpicy: false,
    calories: 220,
    preparationTime: 3,
    restaurantName: 'Food Delivery Restaurant',
  },

  // More items for variety
  {
    name: 'Nem Rán',
    description: 'Nem rán giòn rụm, nhân thịt và rau củ',
    price: 35000,
    category: 'Món Việt',
    imageUrl:
      'https://images.unsplash.com/photo-1562059390-a761a084768e?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 250,
    preparationTime: 15,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Mì Ý Sốt Bò Băm',
    description: 'Spaghetti Bolognese với sốt bò băm đậm đà',
    price: 65000,
    category: 'Món Âu',
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    isVegetarian: false,
    isSpicy: false,
    calories: 580,
    preparationTime: 18,
    restaurantName: 'Pizza Italia',
  },
  {
    name: 'Salad Rau Củ',
    description: 'Salad rau củ tươi với sốt dầu giấm',
    price: 40000,
    category: 'Món Âu',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    isVegetarian: true,
    isSpicy: false,
    calories: 150,
    preparationTime: 8,
    restaurantName: 'Food Delivery Restaurant',
  },
];

/**
 * Seed database with complete data
 */
export const seedDatabase = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      logger.info('🌱 Starting database seed...');

      // Clear existing menu items, restaurants, and owner users
      logger.info('🗑️  Clearing menu items, restaurants, and owners...');
      await db.menuItem.deleteMany();
      await db.restaurantCategory.deleteMany();
      await db.restaurant.deleteMany();
      // Delete restaurant owner users
      await db.user.deleteMany({
        where: {
          email: {
            startsWith: 'owner',
          },
        },
      });

      // Create restaurants (each needs a separate owner)
      logger.info('🏪 Creating restaurants with owners and categories...');
      const createdRestaurants = [];
      const categoryMap = new Map<string, Map<string, string>>(); // restaurantId -> categoryName -> categoryId

      for (let i = 0; i < restaurants.length; i++) {
        const restaurant = restaurants[i];

        // Create owner for this restaurant
        const owner = await db.user.create({
          data: {
            email: `owner${i + 1}@restaurants.com`,
            password: 'hashedpassword123', // This should be hashed properly in production
            fullName: `${restaurant.name} Owner`,
            role: 'RESTAURANT_OWNER',
            phoneNumber: `099999999${i}`,
          },
        });

        // Create restaurant with this owner
        const created = await db.restaurant.create({
          data: {
            ...restaurant,
            ownerId: owner.id,
          },
        });
        createdRestaurants.push(created);
        logger.info(`  ✅ Created restaurant: ${created.name}`);

        // Create categories for this restaurant
        const categories = [
          'Món Việt',
          'Burger',
          'Pizza',
          'Sushi',
          'Đồ Uống',
          'Tráng Miệng',
          'Món Âu',
        ];
        const restaurantCategoryMap = new Map<string, string>();

        for (const catName of categories) {
          const category = await db.restaurantCategory.create({
            data: {
              restaurantId: created.id,
              name: catName,
              description: `Danh mục ${catName}`,
              displayOrder: categories.indexOf(catName),
            },
          });
          restaurantCategoryMap.set(catName, category.id);
        }

        categoryMap.set(created.id, restaurantCategoryMap);
      }

      // Create menu items
      logger.info('🍕 Creating menu items...');
      let itemCount = 0;
      for (const item of foodItemsData) {
        const restaurant = createdRestaurants.find(
          r => r.name === item.restaurantName
        );

        if (restaurant) {
          // Get category ID for this item
          const restaurantCategories = categoryMap.get(restaurant.id);
          const categoryId = restaurantCategories?.get(item.category);

          await db.menuItem.create({
            data: {
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.imageUrl,
              isVegetarian: item.isVegetarian,
              isSpicy: item.isSpicy,
              calories: item.calories,
              preparationTime: item.preparationTime,
              status: 'AVAILABLE',
              restaurantId: restaurant.id,
              categoryId: categoryId, // Link to category
            },
          });
          itemCount++;
          logger.info(`  ✅ Created item: ${item.name} (${item.category})`);
        }
      }

      logger.info('✨ Seed completed successfully!');

      res.json({
        success: true,
        message: 'Database seeded successfully',
        summary: {
          restaurants: createdRestaurants.length,
          menuItems: itemCount,
        },
      });
    } catch (error: any) {
      logger.error('❌ Error seeding database:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);
