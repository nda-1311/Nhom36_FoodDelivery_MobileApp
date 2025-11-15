const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mapping tên file ảnh sang thông tin món ăn
const foodMapping = {
  'buncha_hanoi.jpg': {
    name: 'Bún Chả Hà Nội',
    description:
      'Món ăn truyền thống Hà Nội với thịt nướng thơm lừng và bún tươi',
    price: 45000,
    category: 'Món Việt',
    isVegetarian: false,
    isSpicy: false,
    calories: 450,
    preparationTime: 20,
  },
  'burger-party.jpg': {
    name: 'Burger Party',
    description: 'Combo burger thơm ngon, đầy đủ dinh dưỡng',
    price: 89000,
    category: 'Burger',
    isVegetarian: false,
    isSpicy: false,
    calories: 650,
    preparationTime: 15,
  },
  'classic-beef-burger.png': {
    name: 'Classic Beef Burger',
    description: 'Burger thịt bò cổ điển với phô mai tan chảy',
    price: 75000,
    category: 'Burger',
    isVegetarian: false,
    isSpicy: false,
    calories: 580,
    preparationTime: 15,
  },
  'colorful-fruit-smoothie.png': {
    name: 'Colorful Fruit Smoothie',
    description: 'Sinh tố trái cây tươi mát, đầy màu sắc',
    price: 35000,
    category: 'Đồ Uống',
    isVegetarian: true,
    isSpicy: false,
    calories: 180,
    preparationTime: 5,
  },
  'com-tam-suon-bi-cha.jpg': {
    name: 'Cơm Tấm Sườn Bì Chả',
    description: 'Cơm tấm Sài Gòn với sườn nướng, bì và chả',
    price: 40000,
    category: 'Món Việt',
    isVegetarian: false,
    isSpicy: false,
    calories: 520,
    preparationTime: 15,
  },
  'combo-meal.png': {
    name: 'Combo Meal',
    description: 'Combo bữa ăn đầy đủ với burger, khoai tây và nước',
    price: 95000,
    category: 'Combo',
    isVegetarian: false,
    isSpicy: false,
    calories: 850,
    preparationTime: 20,
  },
  'comga_xoimo.jpg': {
    name: 'Cơm Gà Xối Mỡ',
    description: 'Cơm gà thơm ngon với nước sốt đặc biệt',
    price: 45000,
    category: 'Món Việt',
    isVegetarian: false,
    isSpicy: false,
    calories: 480,
    preparationTime: 15,
  },
  'creamy-chicken-salad.png': {
    name: 'Creamy Chicken Salad',
    description: 'Salad gà sốt kem tươi ngon, bổ dưỡng',
    price: 65000,
    category: 'Salad',
    isVegetarian: false,
    isSpicy: false,
    calories: 320,
    preparationTime: 10,
  },
  'crispy-fried-chicken.png': {
    name: 'Crispy Fried Chicken',
    description: 'Gà rán giòn tan, đậm vị',
    price: 55000,
    category: 'Gà Rán',
    isVegetarian: false,
    isSpicy: false,
    calories: 550,
    preparationTime: 20,
  },
  'fried-potatoes.jpg': {
    name: 'Fried Potatoes',
    description: 'Khoai tây chiên giòn rụm',
    price: 25000,
    category: 'Món Phụ',
    isVegetarian: true,
    isSpicy: false,
    calories: 280,
    preparationTime: 10,
  },
  'milk-drink.jpg': {
    name: 'Milk Drink',
    description: 'Sữa tươi nguyên chất thơm ngon',
    price: 20000,
    category: 'Đồ Uống',
    isVegetarian: true,
    isSpicy: false,
    calories: 150,
    preparationTime: 3,
  },
  'pizza-party.jpg': {
    name: 'Pizza Party',
    description: 'Pizza size lớn cho cả gia đình',
    price: 199000,
    category: 'Pizza',
    isVegetarian: false,
    isSpicy: false,
    calories: 1200,
    preparationTime: 25,
  },
  'pizza-xuc-xich-pho-mai-vuong.jpg': {
    name: 'Pizza Xúc Xích Phô Mai',
    description: 'Pizza xúc xích với phô mai béo ngậy',
    price: 149000,
    category: 'Pizza',
    isVegetarian: false,
    isSpicy: false,
    calories: 900,
    preparationTime: 25,
  },
  'simple-rice-bowl.png': {
    name: 'Simple Rice Bowl',
    description: 'Cơm đơn giản, ngon miệng',
    price: 30000,
    category: 'Món Việt',
    isVegetarian: true,
    isSpicy: false,
    calories: 320,
    preparationTime: 10,
  },
  'spicy-chicken.jpg': {
    name: 'Spicy Chicken',
    description: 'Gà cay đậm đà, thơm ngon',
    price: 60000,
    category: 'Gà Rán',
    isVegetarian: false,
    isSpicy: true,
    calories: 480,
    preparationTime: 20,
  },
  'trasuamatcha_master.png': {
    name: 'Trà Sữa Matcha',
    description: 'Trà sữa matcha Nhật Bản thơm ngon',
    price: 35000,
    category: 'Đồ Uống',
    isVegetarian: true,
    isSpicy: false,
    calories: 250,
    preparationTime: 5,
  },
  'vibrant-green-salad.png': {
    name: 'Vibrant Green Salad',
    description: 'Salad xanh tươi mát, tốt cho sức khỏe',
    price: 50000,
    category: 'Salad',
    isVegetarian: true,
    isSpicy: false,
    calories: 180,
    preparationTime: 8,
  },
  'vibrant-salad-bowl.png': {
    name: 'Vibrant Salad Bowl',
    description: 'Salad tổng hợp đầy màu sắc và dinh dưỡng',
    price: 55000,
    category: 'Salad',
    isVegetarian: true,
    isSpicy: false,
    calories: 220,
    preparationTime: 10,
  },
};

async function seedFoodItems() {
  try {
    console.log('🍔 Bắt đầu thêm món ăn vào database...\n');

    // Kiểm tra xem đã có nhà hàng nào chưa
    let restaurants = await prisma.restaurant.findMany();

    if (restaurants.length === 0) {
      console.log('📍 Không có nhà hàng nào. Tạo nhà hàng mẫu...\n');

      // Tạo nhà hàng mẫu
      const defaultRestaurant = await prisma.restaurant.create({
        data: {
          ownerId: (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))
            .id,
          name: 'Food Delivery Restaurant',
          description: 'Nhà hàng giao đồ ăn nhanh',
          address: '123 Nguyễn Huệ, Q1, TP.HCM',
          phoneNumber: '0901234567',
          email: 'restaurant@fooddelivery.com',
          rating: 4.5,
          deliveryFee: 15000,
          minOrderAmount: 50000,
          preparationTime: 30,
          status: 'ACTIVE',
          isOpen: true,
          openingHours: {
            monday: { open: '08:00', close: '22:00' },
            tuesday: { open: '08:00', close: '22:00' },
            wednesday: { open: '08:00', close: '22:00' },
            thursday: { open: '08:00', close: '22:00' },
            friday: { open: '08:00', close: '22:00' },
            saturday: { open: '08:00', close: '23:00' },
            sunday: { open: '08:00', close: '23:00' },
          },
        },
      });

      restaurants = [defaultRestaurant];
      console.log(`✅ Đã tạo nhà hàng: ${defaultRestaurant.name}\n`);
    }

    const restaurant = restaurants[0];
    console.log(`🏪 Sử dụng nhà hàng: ${restaurant.name}\n`);

    // Xóa tất cả món ăn cũ
    const deletedCount = await prisma.menuItem.deleteMany({});
    console.log(`🗑️  Đã xóa ${deletedCount.count} món ăn cũ\n`);

    // Thêm món ăn mới
    let addedCount = 0;
    for (const [imageName, foodData] of Object.entries(foodMapping)) {
      try {
        const menuItem = await prisma.menuItem.create({
          data: {
            restaurantId: restaurant.id,
            name: foodData.name,
            description: foodData.description,
            image: imageName,
            price: foodData.price,
            status: 'AVAILABLE',
            isVegetarian: foodData.isVegetarian,
            isSpicy: foodData.isSpicy,
            calories: foodData.calories,
            preparationTime: foodData.preparationTime,
          },
        });

        console.log(`✅ Đã thêm: ${foodData.name} (${imageName})`);
        addedCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi thêm ${foodData.name}:`, error.message);
      }
    }

    console.log(
      `\n🎉 Hoàn thành! Đã thêm ${addedCount}/${Object.keys(foodMapping).length} món ăn`
    );
    console.log(`\n📊 Thống kê:`);
    console.log(
      `   - Món Việt: ${Object.values(foodMapping).filter(f => f.category === 'Món Việt').length}`
    );
    console.log(
      `   - Burger: ${Object.values(foodMapping).filter(f => f.category === 'Burger').length}`
    );
    console.log(
      `   - Pizza: ${Object.values(foodMapping).filter(f => f.category === 'Pizza').length}`
    );
    console.log(
      `   - Salad: ${Object.values(foodMapping).filter(f => f.category === 'Salad').length}`
    );
    console.log(
      `   - Đồ Uống: ${Object.values(foodMapping).filter(f => f.category === 'Đồ Uống').length}`
    );
    console.log(
      `   - Gà Rán: ${Object.values(foodMapping).filter(f => f.category === 'Gà Rán').length}`
    );
    console.log(
      `   - Khác: ${Object.values(foodMapping).filter(f => !['Món Việt', 'Burger', 'Pizza', 'Salad', 'Đồ Uống', 'Gà Rán'].includes(f.category)).length}`
    );
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedFoodItems();
