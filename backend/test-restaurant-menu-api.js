/**
 * Test Restaurant Menu API
 * Kiểm tra API trả về menu của nhà hàng
 */

const http = require('http');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function testRestaurantMenuAPI() {
  try {
    console.log('\n=== Testing Restaurant Menu API ===\n');

    // First, get list of restaurants
    console.log('1. Getting restaurant list...');
    const restaurantsRes = await httpGet(
      'http://localhost:5000/api/v1/restaurants'
    );
    const restaurantsData = restaurantsRes.data;

    console.log(
      'Raw response:',
      JSON.stringify(restaurantsData, null, 2).substring(0, 500)
    );

    if (
      !restaurantsData.success ||
      !restaurantsData.data ||
      restaurantsData.data.length === 0
    ) {
      console.log('❌ No restaurants found!');
      console.log('Response success:', restaurantsData.success);
      console.log('Response data:', restaurantsData.data);
      return;
    }

    const restaurants = restaurantsData.data;
    console.log(`✅ Found ${restaurants.length} restaurants\n`);

    // Test menu for each restaurant
    for (const restaurant of restaurants.slice(0, 3)) {
      // Test first 3 restaurants
      console.log(`\n📍 Testing: ${restaurant.name} (ID: ${restaurant.id})`);

      const menuRes = await httpGet(
        `http://localhost:5000/api/v1/restaurants/${restaurant.id}/menu`
      );
      const menuData = menuRes.data;

      console.log(`   Response status: ${menuRes.status}`);
      console.log(`   Success: ${menuData.success}`);
      console.log(
        `   Menu items count: ${menuData.data ? menuData.data.length : 0}`
      );

      if (menuData.data && menuData.data.length > 0) {
        console.log(`   Sample items:`);
        menuData.data.slice(0, 3).forEach(item => {
          console.log(`     - ${item.name} (${item.price}đ)`);
        });
      } else {
        console.log(`   ⚠️ No menu items returned for this restaurant`);
      }
    }

    console.log('\n=== Test Complete ===\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRestaurantMenuAPI();
