const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRestaurantMenus() {
  console.log('=== CHECKING RESTAURANT MENUS ===\n');

  const restaurants = await prisma.restaurant.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  for (const restaurant of restaurants) {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: restaurant.id,
        status: 'AVAILABLE',
      },
      include: {
        category: true,
      },
    });

    console.log(`\n📍 ${restaurant.name}`);
    console.log(`   ID: ${restaurant.id}`);
    console.log(`   Menu Items: ${menuItems.length}`);

    if (menuItems.length > 0) {
      menuItems.forEach(item => {
        console.log(
          `   - ${item.name} (${item.category?.name || 'No category'})`
        );
      });
    } else {
      console.log('   ❌ NO MENU ITEMS!');
    }
  }

  await prisma.$disconnect();
}

checkRestaurantMenus().catch(console.error);
