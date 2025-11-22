const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  console.log('=== CHECKING MENU ITEMS AND CATEGORIES ===\n');

  const items = await prisma.menuItem.findMany({
    include: {
      category: true,
      restaurant: {
        select: { name: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log(`Total Menu Items: ${items.length}\n`);

  const categoryCounts = {};

  items.forEach(item => {
    const categoryName = item.category?.name || 'NO CATEGORY';
    if (!categoryCounts[categoryName]) {
      categoryCounts[categoryName] = 0;
    }
    categoryCounts[categoryName]++;

    console.log(
      `${item.name.padEnd(35)} | ${categoryName.padEnd(15)} | ${item.restaurant.name}`
    );
  });

  console.log('\n=== CATEGORY COUNTS ===');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`${cat.padEnd(20)}: ${count} items`);
    });

  await prisma.$disconnect();
}

checkCategories().catch(console.error);
