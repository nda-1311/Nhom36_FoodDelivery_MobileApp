const fs = require('fs');
const path = require('path');

const fixes = [
  // foodService.ts - Remove invalid fields
  {
    file: 'src/services/foodService.ts',
    find: /imageUrl:/g,
    replace: 'logo:',
  },
  {
    file: 'src/services/foodService.ts',
    find: /isAvailable:/g,
    replace: 'status:',
  },
  {
    file: 'src/services/foodService.ts',
    find: /\.isAvailable/g,
    replace: '.status',
  },
  {
    file: 'src/services/foodService.ts',
    find: /orderBy: \{ rating: 'desc' \}/g,
    replace: "orderBy: { createdAt: 'desc' }",
  },
  // restaurantService.ts
  {
    file: 'src/services/restaurantService.ts',
    find: /estimatedDeliveryTime:/g,
    replace: 'preparationTime:',
  },
  {
    file: 'src/services/restaurantService.ts',
    find: /orderBy: \{ category: 'asc' \}/g,
    replace: "orderBy: { name: 'asc' }",
  },
];

fixes.forEach(({ file, find, replace }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const beforeCount = (content.match(find) || []).length;
    content = content.replace(find, replace);
    const afterCount = (
      content.match(
        new RegExp(replace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      ) || []
    ).length;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}: ${beforeCount} replacements`);
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

console.log('🎉 Done!');
