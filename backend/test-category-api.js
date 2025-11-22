// Test API category filter
const testCategoryFilter = async () => {
  const categories = [
    'Burger',
    'Sushi',
    'Món Gà',
    'Salad',
    'Đồ Uống',
    'Món Phụ',
    'Hải Sản',
  ];

  for (const category of categories) {
    const response = await fetch(
      `http://localhost:5000/api/v1/food?category=${encodeURIComponent(category)}`
    );
    const data = await response.json();

    console.log(`\n=== ${category} ===`);
    console.log(`Found: ${data.data?.length || 0} items`);
    if (data.data && data.data.length > 0) {
      data.data.forEach(item => {
        console.log(
          `  - ${item.name} (Category: ${item.category?.name || 'N/A'})`
        );
      });
    } else {
      console.log('  ❌ No items found!');
    }
  }
};

testCategoryFilter().catch(console.error);
