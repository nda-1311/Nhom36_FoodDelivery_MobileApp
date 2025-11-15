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

  // Salads
  "Salad Rau Củ": require("@/assets/public/creamy-chicken-salad.png"),
  "Chicken Salad": require("@/assets/public/creamy-chicken-salad.png"),
  Salad: require("@/assets/public/vibrant-salad-bowl.png"),
  "Green Salad": require("@/assets/public/vibrant-green-salad.png"),

  // Drinks
  "Nước Ép Trái Cây": require("@/assets/public/colorful-fruit-smoothie.png"),
  "Trà Sữa Matcha": require("@/assets/public/trasuamatcha_master.png"),
  "Milk Drink": require("@/assets/public/milk-drink.jpg"),
  Smoothie: require("@/assets/public/colorful-fruit-smoothie.png"),

  // Pizza
  "Pepperoni Pizza": require("@/assets/public/pizza-xuc-xich-pho-mai-vuong.jpg"),
  "Margherita Pizza": require("@/assets/public/pizza-xuc-xich-pho-mai-vuong.jpg"),
  Pizza: require("@/assets/public/pizza-xuc-xich-pho-mai-vuong.jpg"),

  // Burgers
  "Classic Burger": require("@/assets/public/classic-beef-burger.png"),
  "Cheese Burger": require("@/assets/public/classic-beef-burger.png"),
  Burger: require("@/assets/public/classic-beef-burger.png"),
  "Veggie Burger": require("@/assets/public/classic-beef-burger.png"),

  // Chicken
  "Spicy Chicken": require("@/assets/public/crispy-fried-chicken.png"),
  "Fried Chicken": require("@/assets/public/crispy-fried-chicken.png"),
  "Crispy Chicken": require("@/assets/public/crispy-fried-chicken.png"),
  Chicken: require("@/assets/public/crispy-fried-chicken.png"),

  // Potatoes & Sides
  "Fried Potatoes": require("@/assets/public/fried-potatoes.jpg"),
  "French Fries": require("@/assets/public/fried-potatoes.jpg"),
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
