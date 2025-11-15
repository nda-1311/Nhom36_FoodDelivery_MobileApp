const fs = require('fs');
const path = require('path');

const replacements = [
  // favoriteService.ts
  {
    file: 'src/services/favoriteService.ts',
    find: /db\.favorite_restaurants/g,
    replace: 'db.favoriteRestaurant',
  },
  // cartService.ts
  {
    file: 'src/services/cartService.ts',
    find: /db\.carts/g,
    replace: 'db.cart',
  },
  {
    file: 'src/services/cartService.ts',
    find: /menu_items:/g,
    replace: 'menuItem:',
  },
  {
    file: 'src/services/cartService.ts',
    find: /\.menu_items\./g,
    replace: '.menuItem.',
  },
  {
    file: 'src/services/cartService.ts',
    find: /restaurants:/g,
    replace: 'restaurant:',
  },
  // reviewService.ts
  {
    file: 'src/services/reviewService.ts',
    find: /users:/g,
    replace: 'user:',
  },
  {
    file: 'src/services/reviewService.ts',
    find: /restaurants:/g,
    replace: 'restaurant:',
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
