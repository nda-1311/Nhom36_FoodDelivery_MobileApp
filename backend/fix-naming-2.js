const fs = require('fs');
const path = require('path');

const replacements = [
  // Tất cả services - thay restaurants: thành restaurant:
  {
    file: 'src/services/favoriteService.ts',
    find: /restaurants:/g,
    replace: 'restaurant:',
  },
  {
    file: 'src/services/adminService.ts',
    find: /restaurants:/g,
    replace: 'restaurant:',
  },
  {
    file: 'src/services/foodService.ts',
    find: /restaurants:/g,
    replace: 'restaurant:',
  },
  {
    file: 'src/services/orderService.ts',
    find: /cart_items:/g,
    replace: 'items:',
  },
  {
    file: 'src/services/orderService.ts',
    find: /\.cart_items/g,
    replace: '.items',
  },
  {
    file: 'src/services/orderService.ts',
    find: /order_items:/g,
    replace: 'orderItems:',
  },
  {
    file: 'src/services/orderService.ts',
    find: /addresses:/g,
    replace: 'address:',
  },
  {
    file: 'src/services/orderService.ts',
    find: /\.menu_items/g,
    replace: '.menuItem',
  },
  {
    file: 'src/services/orderService.ts',
    find: /\.restaurants/g,
    replace: '.restaurant',
  },
  // reviewService.ts
  {
    file: 'src/services/reviewService.ts',
    find: /orders:/g,
    replace: 'order:',
  },
];

replacements.forEach(({ file, find, replace }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(find, replace);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

console.log('🎉 Done!');
