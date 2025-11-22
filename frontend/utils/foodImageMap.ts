/**
 * Shared food image mapping utility
 * Maps food names to local images in assets/public
 */

// Map ảnh theo tên món ăn
export const FOOD_IMAGE_MAP: Record<string, any> = {
  // Vietnamese dishes
  "Cơm Gà Xối Mỡ": require("@/assets/public/comga_xoimo.jpg"),
  "Cơm Tấm Sướn Bì Chả": require("@/assets/public/com-tam-suon-bi-cha.jpg"),
  "Cơm Tấm Sườn Bì Chả": require("@/assets/public/com-tam-suon-bi-cha.jpg"),
  "Bún Chả Hà Nội": require("@/assets/public/buncha_hanoi.jpg"),
  "Bún Chả": require("@/assets/public/buncha_hanoi.jpg"),
  "Cơm Đơn Giản": require("@/assets/public/simple-rice-bowl.png"),
  "Simple Rice Bowl": require("@/assets/public/simple-rice-bowl.png"),

  // Combo Meals
  "Combo Bữa Ăn": require("@/assets/public/combo-meal.png"),
  "Combo Meal": require("@/assets/public/combo-meal.png"),
  "Combo Nhỏ": require("@/assets/public/combo-meal-small.jpg"),
  "Combo Meal Small": require("@/assets/public/combo-meal-small.jpg"),
  "Combo Đa Dạng": require("@/assets/public/diverse-food-spread.png"),
  "Diverse Food Spread": require("@/assets/public/diverse-food-spread.png"),
  "Combo Món Ăn Đa Dạng": require("@/assets/public/restaurant-food-variety.png"),
  "Restaurant Food Variety": require("@/assets/public/restaurant-food-variety.png"),

  // Salads
  "Salad Rau Củ": require("@/assets/public/creamy-chicken-salad.png"),
  "Salad Gà Sốt Kem": require("@/assets/public/creamy-chicken-salad.png"),
  "Chicken Salad": require("@/assets/public/creamy-chicken-salad.png"),
  "Creamy Chicken Salad": require("@/assets/public/creamy-chicken-salad.png"),
  Salad: require("@/assets/public/vibrant-salad-bowl.png"),
  "Salad Rau Xanh": require("@/assets/public/vibrant-green-salad.png"),
  "Green Salad": require("@/assets/public/vibrant-green-salad.png"),
  "Vibrant Green Salad": require("@/assets/public/vibrant-green-salad.png"),
  "Salad Rau Củ Tổng Hợp": require("@/assets/public/vibrant-salad-bowl.png"),
  "Vibrant Salad Bowl": require("@/assets/public/vibrant-salad-bowl.png"),

  // Drinks
  "Nước Ép Trái Cây": require("@/assets/public/colorful-fruit-smoothie.png"),
  "Sinh Tố Trái Cây": require("@/assets/public/colorful-fruit-smoothie.png"),
  "Colorful Fruit Smoothie": require("@/assets/public/colorful-fruit-smoothie.png"),
  "Trà Sữa Matcha": require("@/assets/public/trasuamatcha_master.png"),
  "Sữa Tươi": require("@/assets/public/milk-drink.jpg"),
  "Milk Drink": require("@/assets/public/milk-drink.jpg"),
  Smoothie: require("@/assets/public/colorful-fruit-smoothie.png"),
  "Cà Phê Nguyên Chất": require("@/assets/public/cozy-coffee-cafe.png"),
  "Cozy Coffee Cafe": require("@/assets/public/cozy-coffee-cafe.png"),
  "Cà Phê Góc Ấm": require("@/assets/public/cozy-corner-cafe.png"),
  "Cozy Corner Cafe": require("@/assets/public/cozy-corner-cafe.png"),

  // Pizza
  "Pepperoni Pizza": require("@/assets/public/pizza-xuc-xich-pho-mai-vuong.jpg"),
  "Margherita Pizza": require("@/assets/public/pizza-xuc-xich-pho-mai-vuong.jpg"),
  "Pizza Xúc Xích Phô Mai": require("@/assets/public/pizza-xuc-xich-pho-mai-vuong.jpg"),
  "Pizza Xúc Xích Phô Mai Vương": require("@/assets/public/pizza-xuc-xich-pho-mai-vuong.jpg"),
  Pizza: require("@/assets/public/pizza-xuc-xich-pho-mai-vuong.jpg"),
  "Pizza Party": require("@/assets/public/pizza-party.jpg"),

  // Burgers
  "Classic Burger": require("@/assets/public/classic-beef-burger.png"),
  "Burger Bò Cổ Điển": require("@/assets/public/classic-beef-burger.png"),
  "Classic Beef Burger": require("@/assets/public/classic-beef-burger.png"),
  "Cheese Burger": require("@/assets/public/classic-beef-burger.png"),
  Burger: require("@/assets/public/classic-beef-burger.png"),
  "Veggie Burger": require("@/assets/public/classic-beef-burger.png"),
  "Burger Party": require("@/assets/public/burger-party.jpg"),

  // Chicken
  "Gà Cay": require("@/assets/public/spicy-chicken.jpg"),
  "Spicy Chicken": require("@/assets/public/spicy-chicken.jpg"),
  "Gà Rán Giòn": require("@/assets/public/crispy-fried-chicken.png"),
  "Fried Chicken": require("@/assets/public/crispy-fried-chicken.png"),
  "Crispy Chicken": require("@/assets/public/crispy-fried-chicken.png"),
  "Crispy Fried Chicken": require("@/assets/public/crispy-fried-chicken.png"),
  Chicken: require("@/assets/public/crispy-fried-chicken.png"),

  // Potatoes & Sides
  "Khoai Tây Chiên": require("@/assets/public/fried-potatoes.jpg"),
  "Fried Potatoes": require("@/assets/public/fried-potatoes.jpg"),
  "French Fries": require("@/assets/public/fried-potatoes.jpg"),

  // Sushi
  "Sushi Party": require("@/assets/public/sushi-party.jpg"),
  Sushi: require("@/assets/public/sushi-party.jpg"),

  // Seafood
  "Combo Hải Sản Đặc Biệt": require("@/assets/public/seafood-restaurant.png"),
  "Seafood Restaurant Special": require("@/assets/public/seafood-restaurant.png"),
  Seafood: require("@/assets/public/seafood-restaurant.png"),
};

/**
 * Get image for food item based on name
 * @param name - Food item name
 * @param fallbackUrl - Optional fallback image URL
 * @returns Image source (require or URI)
 */
export const getFoodImage = (name: string, fallbackUrl?: string): any => {
  if (!name) {
    return fallbackUrl
      ? { uri: fallbackUrl }
      : require("@/assets/public/placeholder.jpg");
  }

  // Try exact match first
  if (FOOD_IMAGE_MAP[name]) {
    return FOOD_IMAGE_MAP[name];
  }

  // Try partial match (case insensitive)
  const lowerName = name.toLowerCase();
  const matchedKey = Object.keys(FOOD_IMAGE_MAP).find(
    (key) =>
      lowerName.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(lowerName)
  );

  if (matchedKey) {
    return FOOD_IMAGE_MAP[matchedKey];
  }

  // Try keyword matching
  const keywords = lowerName.split(/\s+/);
  for (const keyword of keywords) {
    const keywordMatch = Object.keys(FOOD_IMAGE_MAP).find((key) =>
      key.toLowerCase().includes(keyword)
    );
    if (keywordMatch) {
      return FOOD_IMAGE_MAP[keywordMatch];
    }
  }

  // If fallbackUrl is from /public, try to map to local file
  if (fallbackUrl?.startsWith("/public/")) {
    const filename = fallbackUrl
      .replace("/public/", "")
      .replace(/\.(jpg|png)$/, "");

    // Map common filenames to known images
    const filenameMap: Record<string, any> = {
      buncha_hanoi: require("@/assets/public/buncha_hanoi.jpg"),
      "com-tam-suon-bi-cha": require("@/assets/public/com-tam-suon-bi-cha.jpg"),
      comga_xoimo: require("@/assets/public/comga_xoimo.jpg"),
      "simple-rice-bowl": require("@/assets/public/simple-rice-bowl.png"),
      "combo-meal": require("@/assets/public/combo-meal.png"),
      "combo-meal-small": require("@/assets/public/combo-meal-small.jpg"),
      "diverse-food-spread": require("@/assets/public/diverse-food-spread.png"),
      "restaurant-food-variety": require("@/assets/public/restaurant-food-variety.png"),
      "classic-beef-burger": require("@/assets/public/classic-beef-burger.png"),
      "burger-party": require("@/assets/public/burger-party.jpg"),
      "pizza-xuc-xich-pho-mai-vuong": require("@/assets/public/pizza-xuc-xich-pho-mai-vuong.jpg"),
      "pizza-party": require("@/assets/public/pizza-party.jpg"),
      "sushi-party": require("@/assets/public/sushi-party.jpg"),
      "crispy-fried-chicken": require("@/assets/public/crispy-fried-chicken.png"),
      "spicy-chicken": require("@/assets/public/spicy-chicken.jpg"),
      "creamy-chicken-salad": require("@/assets/public/creamy-chicken-salad.png"),
      "vibrant-green-salad": require("@/assets/public/vibrant-green-salad.png"),
      "vibrant-salad-bowl": require("@/assets/public/vibrant-salad-bowl.png"),
      "fried-potatoes": require("@/assets/public/fried-potatoes.jpg"),
      "milk-drink": require("@/assets/public/milk-drink.jpg"),
      trasuamatcha_master: require("@/assets/public/trasuamatcha_master.png"),
      "colorful-fruit-smoothie": require("@/assets/public/colorful-fruit-smoothie.png"),
      "cozy-coffee-cafe": require("@/assets/public/cozy-coffee-cafe.png"),
      "cozy-corner-cafe": require("@/assets/public/cozy-corner-cafe.png"),
      "seafood-restaurant": require("@/assets/public/seafood-restaurant.png"),
    };

    if (filenameMap[filename]) {
      return filenameMap[filename];
    }
  }

  // Fallback to URL or placeholder
  return fallbackUrl
    ? { uri: fallbackUrl }
    : require("@/assets/public/placeholder.jpg");
};

/**
 * Get restaurant image (for now using placeholder)
 */
export const getRestaurantImage = (name?: string, imageUrl?: string): any => {
  if (
    imageUrl &&
    !imageUrl.includes("placeholder.com") &&
    !imageUrl.includes("via.placeholder")
  ) {
    return { uri: imageUrl };
  }

  // Could add specific restaurant images here later
  return require("@/assets/public/placeholder-logo.png");
};
