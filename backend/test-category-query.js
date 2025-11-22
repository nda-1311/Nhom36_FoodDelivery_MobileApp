const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCategoryQuery() {
  console.log('=== TESTING CATEGORY QUERY ===\n');

  const category = 'Đồ Uống';

  // Test 1: Count items with this category
  const count = await prisma.menuItem.count({
    where: {
      status: 'AVAILABLE',
      category: {
        name: category,
      },
    },
  });
  console.log(`Total items with category "${category}": ${count}`);

  // Test 2: Get items with this category
  const items = await prisma.menuItem.findMany({
    where: {
      status: 'AVAILABLE',
      category: {
        name: category,
      },
    },
    include: {
      category: true,
      restaurant: {
        select: { name: true },
      },
    },
  });

  console.log(`\nFound ${items.length} items:`);
  items.forEach(item => {
    console.log(
      `  - ${item.name} (${item.category?.name}) - ${item.restaurant.name}`
    );
  });

  // Test 3: Get all categories with name "Đồ Uống"
  const categories = await prisma.restaurantCategory.findMany({
    where: {
      name: category,
    },
    include: {
      restaurant: {
        select: { name: true },
      },
      menuItems: true,
    },
  });

  console.log(`\n${categories.length} categories named "${category}":`);
  categories.forEach(cat => {
    console.log(
      `  - Restaurant: ${cat.restaurant.name}, Items: ${cat.menuItems.length}`
    );
  });

  await prisma.$disconnect();
}

testCategoryQuery().catch(console.error);
