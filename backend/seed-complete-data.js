const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Restaurant data with proper images from Unsplash
const restaurants = [
  {
    name: 'Food Delivery Restaurant',
    description: 'Nhà hàng ẩm thực đa dạng, phục vụ món Việt và quốc tế',
    address: '123 Nguyễn Huệ Q1, TP HCM',
    phone: '0123456789',
    email: 'fooddelivery@restaurant.com',
    openTime: '08:00',
    closeTime: '22:00',
    deliveryFee: 15000,
    minOrderAmount: 50000,
    rating: 4.5,
    imageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', // Restaurant interior
    isActive: true,
  },
  {
    name: 'Phở Hà Nội',
    description: 'Chuyên các món phở truyền thống Hà Nội',
    address: '456 Lê Lợi Q1, TP HCM',
    phone: '0987654321',
    email: 'phohanoi@restaurant.com',
    openTime: '06:00',
    closeTime: '23:00',
    deliveryFee: 12000,
    minOrderAmount: 40000,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80', // Restaurant
    isActive: true,
  },
  {
    name: 'Bún Bò Huế Authentic',
    description: 'Bún bò Huế chính gốc với công thức gia truyền',
    address: '789 Pasteur Q3, TP HCM',
    phone: '0901234567',
    email: 'bunbohue@restaurant.com',
    openTime: '07:00',
    closeTime: '21:00',
    deliveryFee: 10000,
    minOrderAmount: 35000,
    rating: 4.6,
    imageUrl:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', // Restaurant
    isActive: true,
  },
  {
    name: 'Burger King Street',
    description: 'Burger Mỹ đậm đà, khoai tây chiên giòn rụm',
    address: '321 Võ Văn Tần Q3, TP HCM',
    phone: '0912345678',
    email: 'burgerking@restaurant.com',
    openTime: '10:00',
    closeTime: '23:00',
    deliveryFee: 20000,
    minOrderAmount: 60000,
    rating: 4.3,
    imageUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', // Restaurant
    isActive: true,
  },
  {
    name: 'Sushi Tokyo',
    description: 'Sushi Nhật Bản tươi ngon, đầu bếp người Nhật',
    address: '654 Hai Bà Trưng Q1, TP HCM',
    phone: '0923456789',
    email: 'sushitokyo@restaurant.com',
    openTime: '11:00',
    closeTime: '22:00',
    deliveryFee: 25000,
    minOrderAmount: 80000,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', // Restaurant
    isActive: true,
  },
  {
    name: 'Pizza Italia',
    description: 'Pizza Ý truyền thống, nướng lò gỗ',
    address: '987 Nguyễn Đình Chiểu Q3, TP HCM',
    phone: '0934567890',
    email: 'pizzaitalia@restaurant.com',
    openTime: '11:00',
    closeTime: '23:00',
    deliveryFee: 18000,
    minOrderAmount: 70000,
    rating: 4.4,
    imageUrl:
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', // Restaurant
    isActive: true,
  },
];

// Food items with images from public folder
const foodItems = [
  // Vietnamese Food
  {
    name: 'Bún Chả Hà Nội',
    description: 'Bún chả Hà Nội với thịt nướng thơm lừng',
    price: 48000,
    category: 'Món Việt',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 480,
    preparationTime: 15,
    restaurantName: 'Phở Hà Nội',
  },
  {
    name: 'Cơm Tấm Sườn Bì Chả',
    description: 'Cơm tấm sườn bì chả đầy đủ',
    price: 42000,
    category: 'Món Việt',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 580,
    preparationTime: 12,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Cơm Gà Xối Mỡ',
    description: 'Cơm gà Hội An truyền thống với gà xé phay',
    price: 45000,
    category: 'Món Việt',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 520,
    preparationTime: 15,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Cơm Đơn Giản',
    description: 'Cơm đơn giản với thịt và rau',
    price: 35000,
    category: 'Món Việt',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 450,
    preparationTime: 10,
    restaurantName: 'Food Delivery Restaurant',
  },

  // Combo Meals
  {
    name: 'Combo Bữa Ăn',
    description: 'Combo bữa ăn đầy đủ tiết kiệm',
    price: 85000,
    category: 'Combo',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 750,
    preparationTime: 18,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Combo Nhỏ',
    description: 'Combo nhỏ gọn cho 1 người',
    price: 55000,
    category: 'Combo',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 480,
    preparationTime: 12,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Combo Đa Dạng',
    description: 'Đa dạng món ăn trong một combo',
    price: 95000,
    category: 'Combo',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 820,
    preparationTime: 20,
    restaurantName: 'Food Delivery Restaurant',
  },

  // Burgers
  {
    name: 'Burger Bò Cổ Điển',
    description: 'Burger thịt bò Angus, phô mai, rau xà lách, cà chua',
    price: 75000,
    category: 'Burger',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 680,
    preparationTime: 12,
    restaurantName: 'Burger King Street',
  },
  {
    name: 'Burger Party',
    description: 'Set burger nhiều người cho bữa tiệc',
    price: 120000,
    category: 'Burger',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 1200,
    preparationTime: 20,
    restaurantName: 'Burger King Street',
  },

  // Pizza
  {
    name: 'Pizza Xúc Xích Phô Mai',
    description: 'Pizza xúc xích và phô mai thơm ngon',
    price: 95000,
    category: 'Pizza',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 820,
    preparationTime: 20,
    restaurantName: 'Pizza Italia',
  },
  {
    name: 'Pizza Party',
    description: 'Pizza cỡ lớn cho bữa tiệc',
    price: 150000,
    category: 'Pizza',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 1500,
    preparationTime: 25,
    restaurantName: 'Pizza Italia',
  },

  // Sushi
  {
    name: 'Sushi Party',
    description: 'Set sushi đa dạng cho nhiều người',
    price: 180000,
    category: 'Sushi',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 850,
    preparationTime: 25,
    restaurantName: 'Sushi Tokyo',
  },

  // Chicken Dishes
  {
    name: 'Gà Rán Giòn',
    description: 'Gà rán giòn rụm kiểu Hàn Quốc',
    price: 85000,
    category: 'Món Gà',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 650,
    preparationTime: 18,
    restaurantName: 'Burger King Street',
  },
  {
    name: 'Gà Cay',
    description: 'Gà cay đậm đà',
    price: 88000,
    category: 'Món Gà',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: true,
    calories: 680,
    preparationTime: 18,
    restaurantName: 'Burger King Street',
  },
  {
    name: 'Salad Gà Sốt Kem',
    description: 'Salad gà sốt kem béo ngậy',
    price: 75000,
    category: 'Salad',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 420,
    preparationTime: 12,
    restaurantName: 'Food Delivery Restaurant',
  },

  // Salads
  {
    name: 'Salad Rau Xanh',
    description: 'Salad rau xanh tươi mát',
    price: 55000,
    category: 'Salad',
    imageUrl: '',
    isVegetarian: true,
    isSpicy: false,
    calories: 180,
    preparationTime: 8,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Salad Rau Củ Tổng Hợp',
    description: 'Bát salad đầy màu sắc với nhiều loại rau củ',
    price: 60000,
    category: 'Salad',
    imageUrl: '',
    isVegetarian: true,
    isSpicy: false,
    calories: 200,
    preparationTime: 10,
    restaurantName: 'Food Delivery Restaurant',
  },

  // Sides
  {
    name: 'Khoai Tây Chiên',
    description: 'Khoai tây chiên giòn rụm',
    price: 35000,
    category: 'Món Phụ',
    imageUrl: '',
    isVegetarian: true,
    isSpicy: false,
    calories: 320,
    preparationTime: 8,
    restaurantName: 'Burger King Street',
  },

  // Drinks
  {
    name: 'Sữa Tươi',
    description: 'Đồ uống từ sữa tươi',
    price: 30000,
    category: 'Đồ Uống',
    imageUrl: '',
    isVegetarian: true,
    isSpicy: false,
    calories: 180,
    preparationTime: 5,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Trà Sữa Matcha',
    description: 'Trà sữa matcha Nhật Bản',
    price: 40000,
    category: 'Đồ Uống',
    imageUrl: '',
    isVegetarian: true,
    isSpicy: false,
    calories: 280,
    preparationTime: 5,
    restaurantName: 'Sushi Tokyo',
  },
  {
    name: 'Sinh Tố Trái Cây',
    description: 'Sinh tố trái cây nhiều màu sắc',
    price: 45000,
    category: 'Đồ Uống',
    imageUrl: '',
    isVegetarian: true,
    isSpicy: false,
    calories: 220,
    preparationTime: 5,
    restaurantName: 'Food Delivery Restaurant',
  },

  // Cafe
  {
    name: 'Cà Phê Nguyên Chất',
    description: 'Cà phê nguyên chất thơm đậm',
    price: 35000,
    category: 'Đồ Uống',
    imageUrl: '',
    isVegetarian: true,
    isSpicy: false,
    calories: 120,
    preparationTime: 5,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Cà Phê Góc Ấm',
    description: 'Cà phê góc ấm cúng',
    price: 38000,
    category: 'Đồ Uống',
    imageUrl: '',
    isVegetarian: true,
    isSpicy: false,
    calories: 130,
    preparationTime: 5,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Combo Hải Sản Đặc Biệt',
    description: 'Combo hải sản đặc biệt từ nhà hàng',
    price: 250000,
    category: 'Hải Sản',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 950,
    preparationTime: 30,
    restaurantName: 'Food Delivery Restaurant',
  },
  {
    name: 'Combo Món Ăn Đa Dạng',
    description: 'Đa dạng món ăn từ nhà hàng',
    price: 120000,
    category: 'Combo',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    calories: 880,
    preparationTime: 25,
    restaurantName: 'Food Delivery Restaurant',
  },
];

async function main() {
  console.log('🌱 Starting seed process...');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.orderTracking.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.review.deleteMany();
    await prisma.favoriteMenuItem.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.restaurantCategory.deleteMany();
    await prisma.restaurant.deleteMany();

    // Delete all users (both restaurant owners and customers)
    await prisma.user.deleteMany();

    // Create restaurant owners and restaurants
    console.log('👥 Creating restaurant owners...');
    console.log('🏪 Creating restaurants...');
    const createdRestaurants = [];
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];

      // Create owner for this restaurant with unique phone
      const owner = await prisma.user.create({
        data: {
          email: restaurant.email,
          password: '$2a$10$YourHashedPasswordHere', // Default hashed password
          fullName: `${restaurant.name} Owner`,
          role: 'RESTAURANT_OWNER',
          phoneNumber: `091${1000000 + i}`, // Unique phone for each owner
        },
      });

      console.log(`  ✅ Created owner: ${owner.fullName}`);

      // Create restaurant with proper schema fields
      const created = await prisma.restaurant.create({
        data: {
          ownerId: owner.id,
          name: restaurant.name,
          description: restaurant.description,
          address: restaurant.address,
          phoneNumber: restaurant.phone,
          email: restaurant.email,
          coverImage: restaurant.imageUrl,
          openingHours: {
            monday: { open: restaurant.openTime, close: restaurant.closeTime },
            tuesday: { open: restaurant.openTime, close: restaurant.closeTime },
            wednesday: {
              open: restaurant.openTime,
              close: restaurant.closeTime,
            },
            thursday: {
              open: restaurant.openTime,
              close: restaurant.closeTime,
            },
            friday: { open: restaurant.openTime, close: restaurant.closeTime },
            saturday: {
              open: restaurant.openTime,
              close: restaurant.closeTime,
            },
            sunday: { open: restaurant.openTime, close: restaurant.closeTime },
          },
          rating: restaurant.rating,
          deliveryFee: restaurant.deliveryFee,
          minOrderAmount: restaurant.minOrderAmount,
          status: restaurant.isActive ? 'ACTIVE' : 'PENDING_APPROVAL',
          isOpen: restaurant.isActive,
        },
      });
      createdRestaurants.push(created);
      console.log(`  ✅ Created restaurant: ${created.name}`);
    }

    // Create categories for all restaurants
    console.log('📁 Creating categories for all restaurants...');
    const categoryNames = [
      'Món Việt',
      'Combo',
      'Burger',
      'Pizza',
      'Sushi',
      'Món Gà',
      'Salad',
      'Đồ Uống',
      'Món Phụ',
      'Hải Sản',
    ];

    const createdCategories = {}; // Map of "RestaurantName-CategoryName" -> category object

    for (const restaurant of createdRestaurants) {
      for (const categoryName of categoryNames) {
        const category = await prisma.restaurantCategory.create({
          data: {
            restaurantId: restaurant.id,
            name: categoryName,
            description: `Danh mục ${categoryName}`,
          },
        });
        const key = `${restaurant.name}-${categoryName}`;
        createdCategories[key] = category;
      }
      console.log(
        `  ✅ Created ${categoryNames.length} categories for ${restaurant.name}`
      );
    }

    // Create menu items
    console.log('🍕 Creating menu items...');
    let itemCount = 0;
    for (const item of foodItems) {
      const restaurant = createdRestaurants.find(
        r => r.name === item.restaurantName
      );

      if (restaurant) {
        // Get category ID from category name and restaurant name
        const categoryKey = `${restaurant.name}-${item.category}`;
        const category = createdCategories[categoryKey];

        await prisma.menuItem.create({
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
            categoryId: category ? category.id : null,
          },
        });
        itemCount++;
        console.log(
          `  ✅ Created: ${item.name} (${restaurant.name}) - ${item.category}`
        );
      }
    }

    // Create sample customers for reviews
    console.log('👤 Creating sample customers...');
    const sampleCustomers = [];
    const customerNames = [
      'Nguyễn Văn A',
      'Trần Thị B',
      'Lê Văn C',
      'Phạm Thị D',
      'Hoàng Văn E',
    ];

    for (let i = 0; i < customerNames.length; i++) {
      const customer = await prisma.user.create({
        data: {
          email: `customer${i + 1}@example.com`,
          password: '$2a$10$YourHashedPasswordHere',
          fullName: customerNames[i],
          role: 'CUSTOMER',
          phoneNumber: `090${1000000 + i}`,
        },
      });
      sampleCustomers.push(customer);
      console.log(`  ✅ Created customer: ${customer.fullName}`);
    }

    // Create sample orders and reviews
    console.log('📦 Creating sample orders and reviews...');
    let reviewCount = 0;
    const reviewTexts = [
      'Món ăn rất ngon, phục vụ nhiệt tình!',
      'Giao hàng nhanh, đồ ăn còn nóng',
      'Chất lượng tuyệt vời, sẽ quay lại',
      'Giá cả hợp lý, món ăn đúng gu',
      'Đóng gói cẩn thận, món ăn ngon',
      'Phục vụ tốt, không gian đẹp',
      'Món ăn đậm đà, rất hài lòng',
      'Nhanh chóng, tiện lợi',
    ];

    for (const restaurant of createdRestaurants) {
      // Create 2-3 reviews per restaurant
      const numReviews = 2 + Math.floor(Math.random() * 2);

      for (let i = 0; i < numReviews; i++) {
        const customer = sampleCustomers[i % sampleCustomers.length];
        const rating = 4 + Math.floor(Math.random() * 2); // 4 or 5 stars

        // Create a default address for this customer if not exists
        let address = await prisma.address.findFirst({
          where: { userId: customer.id },
        });

        if (!address) {
          address = await prisma.address.create({
            data: {
              userId: customer.id,
              type: 'HOME',
              label: 'Home',
              fullAddress: customer.fullName + ' Home Address',
              isDefault: true,
            },
          });
        }

        const subtotal = 100000 + Math.random() * 200000;
        const deliveryFee = restaurant.deliveryFee;
        const total = subtotal + deliveryFee;

        // Create a sample order first
        const order = await prisma.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`,
            userId: customer.id,
            restaurantId: restaurant.id,
            addressId: address.id,
            status: 'DELIVERED',
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            total: total,
            paymentMethod: 'CASH',
            paymentStatus: 'PAID',
            deliveredAt: new Date(),
          },
        });

        // Create review for this order
        await prisma.review.create({
          data: {
            userId: customer.id,
            restaurantId: restaurant.id,
            orderId: order.id,
            rating: rating,
            comment: reviewTexts[reviewCount % reviewTexts.length],
            images: [],
          },
        });

        reviewCount++;
        console.log(`  ✅ Created review for ${restaurant.name} (${rating}⭐)`);
      }
    }

    console.log('\n✨ Seed completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Restaurants: ${createdRestaurants.length}`);
    console.log(`   - Menu Items: ${itemCount}`);
    console.log(`   - Customers: ${sampleCustomers.length}`);
    console.log(`   - Reviews: ${reviewCount}`);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
