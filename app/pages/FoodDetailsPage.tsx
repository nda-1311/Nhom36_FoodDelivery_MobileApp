import { useFavorites } from "@/hooks/useFavorites";
import { getCartKey } from "@/lib/cartKey";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/store/cart-context";
import { ChevronLeft, Heart, Minus, Plus, Star } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Map ảnh static
const IMAGE_MAP: Record<string, any> = {
  "/com-tam-suon-bi-cha.jpg": require("@/assets/public/com-tam-suon-bi-cha.jpg"),
  "/classic-beef-burger.png": require("@/assets/public/classic-beef-burger.png"),
  "/comga_xoimo.jpg": require("@/assets/public/comga_xoimo.jpg"),
  "/buncha_hanoi.jpg": require("@/assets/public/buncha_hanoi.jpg"),
  "/milk-drink.jpg": require("@/assets/public/milk-drink.jpg"),
  "/trasuamatcha_master.png": require("@/assets/public/trasuamatcha_master.png"),
  "/colorful-fruit-smoothie.png": require("@/assets/public/colorful-fruit-smoothie.png"),
  "/pizza-xuc-xich-pho-mai-vuong.jpg": require("@/assets/public/pizza-xuc-xich-pho-mai-vuong.jpg"),
  "/creamy-chicken-salad.png": require("@/assets/public/creamy-chicken-salad.png"),
};

interface FoodDetailsPageProps {
  data: any;
  onNavigate: (page: string, data?: any) => void;
  favorites: any[];
  onToggleFavorite: (item: any) => void;
}

export default function FoodDetailsPage({
  data,
  onNavigate,
  favorites,
  onToggleFavorite,
}: FoodDetailsPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedSpiciness, setSelectedSpiciness] = useState("Hot");
  const [toppings, setToppings] = useState<string[]>([
    "Corn",
    "Cheese Cheddar",
  ]);
  const [note, setNote] = useState("");

  const { addItem } = useCart();
  const { isFav, toggle, loading: favLoading } = useFavorites();
  const isFavorite = data?.id ? isFav(String(data.id)) : false;

  const displayName = data?.name || "Food Item";
  const displayDesc = data?.description || "Delicious meal prepared fresh!";
  const basePrice = Number(data?.price) || 10;

  // Xử lý ảnh
  let imageSource = { uri: "https://placehold.co/400x300" };
  if (data?.image_url && IMAGE_MAP[data.image_url]) {
    imageSource = IMAGE_MAP[data.image_url];
  } else if (data?.image && IMAGE_MAP[data.image]) {
    imageSource = IMAGE_MAP[data.image];
  } else if (data?.image_url) {
    imageSource = { uri: data.image_url };
  } else if (data?.image) {
    imageSource = { uri: data.image };
  }

  const toggleTopping = (topping: string) => {
    setToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((t) => t !== topping)
        : [...prev, topping]
    );
  };

  const priceSize = selectedSize === "L" ? 10 : selectedSize === "M" ? 5 : 0;
  const priceToppings = toppings.reduce(
    (sum, t) => sum + (t === "Corn" ? 2 : t === "Cheese Cheddar" ? 5 : 10),
    0
  );
  const totalPrice = (basePrice + priceSize + priceToppings) * quantity;

  // ✅ Sửa lỗi không tăng count
  const handleAddToCart = async () => {
    try {
      const cart_key = await getCartKey();
      const price = basePrice + priceSize + priceToppings;

      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_key", cart_key)
        .eq("food_item_id", String(data.id))
        .maybeSingle();

      if (existing) {
        // ✅ Nếu đã có, thì update số lượng
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);

        if (updateError) throw updateError;
      } else {
        // ✅ Nếu chưa có, insert mới
        const row = {
          cart_key,
          food_item_id: String(data.id),
          name: displayName,
          price,
          quantity,
          image: data.image_url || data.image || "https://placehold.co/200x200",
          restaurant_id: data.restaurant_id || null,
          restaurant: data.restaurant || null,
          meta: {
            size: selectedSize,
            spiciness: selectedSpiciness,
            toppings,
            note,
          },
        };

        const { error: insertError } = await supabase
          .from("cart_items")
          .insert([row]);
        if (insertError) throw insertError;
      }

      // ✅ Cập nhật Context (hiển thị ngay)
      const newItem = {
        id: String(data.id),
        name: displayName,
        price,
        qty: quantity,
        image: data.image_url || data.image || "https://placehold.co/200x200",
        meta: {
          size: selectedSize,
          spiciness: selectedSpiciness,
          toppings,
          note,
        },
      };
      addItem(newItem);

      Alert.alert("🎉 Thành công", "Đã thêm món vào giỏ hàng!");
      onNavigate("cart");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng!");
    }
  };

  const handleToggleFavorite = async () => {
    if (!data?.id) return;
    await toggle(String(data.id), {
      name: displayName,
      image: data.image || data.image_url,
      price: basePrice,
    });
  };

  console.log("Food Details Data:", data);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Image + Header */}
        <View style={styles.imageWrapper}>
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
          <TouchableOpacity
            onPress={() => onNavigate("home")}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            disabled={favLoading}
            style={styles.favButton}
          >
            <Heart
              size={24}
              color={isFavorite ? "#ef4444" : "#111"}
              fill={isFavorite ? "#ef4444" : "none"}
            />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.foodName}>{displayName}</Text>
            <Text style={styles.foodPrice}>${basePrice.toFixed(2)}</Text>
          </View>
          <Text style={styles.desc}>{displayDesc}</Text>

          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                color={i < (data.rating || 4.5) ? "#facc15" : "#d1d5db"}
                fill={i < (data.rating || 4.5) ? "#facc15" : "none"}
              />
            ))}
            <Text style={styles.ratingText}>({data.rating || 4.5})</Text>
          </View>
        </View>

        {/* Size */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Size (Pick 1)</Text>
            <Text style={styles.required}>Required</Text>
          </View>
          {["S", "M", "L"].map((size) => (
            <TouchableOpacity
              key={size}
              onPress={() => setSelectedSize(size)}
              style={[
                styles.optionRow,
                selectedSize === size && styles.optionSelected,
              ]}
            >
              <Text style={styles.optionLabel}>{size}</Text>
              {size !== "S" && (
                <Text style={styles.optionPrice}>
                  +${size === "M" ? 5 : 10}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Toppings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toppings (Optional)</Text>
          {["Corn", "Cheese Cheddar", "Salted egg"].map((topping) => (
            <TouchableOpacity
              key={topping}
              onPress={() => toggleTopping(topping)}
              style={[
                styles.optionRow,
                toppings.includes(topping) && styles.optionSelected,
              ]}
            >
              <Text style={styles.optionLabel}>{topping}</Text>
              <Text style={styles.optionPrice}>
                +$
                {topping === "Corn" ? 2 : topping === "Cheese Cheddar" ? 5 : 10}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spiciness */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Spiciness (Pick 1)</Text>
            <Text style={styles.required}>Required</Text>
          </View>
          {["No", "Hot", "Very hot"].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setSelectedSpiciness(level)}
              style={[
                styles.optionRow,
                selectedSpiciness === level && styles.optionSelected,
              ]}
            >
              <Text style={styles.optionLabel}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add any special requests..."
            style={styles.noteInput}
            multiline
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.qtyButton}
          >
            <Minus size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            style={styles.qtyButton}
          >
            <Plus size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addText}>
            Add to cart (${totalPrice.toFixed(2)})
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
    marginBottom: 70,
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: 250,
    backgroundColor: "#f3f4f6",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
  },
  favButton: {
    position: "absolute",
    top: 30,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
  },
  section: { padding: 16 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  foodName: { fontSize: 22, fontWeight: "700", color: "#111827" },
  foodPrice: { fontSize: 20, fontWeight: "700", color: "#06b6d4" },
  desc: { fontSize: 14, color: "#6b7280", marginTop: 6 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  ratingText: { fontSize: 12, color: "#6b7280" },
  sectionTitle: { fontWeight: "700", fontSize: 15, marginBottom: 6 },
  required: { color: "#06b6d4", fontSize: 13 },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  optionSelected: {
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#06b6d4",
  },
  optionLabel: { color: "#111827", fontSize: 14 },
  optionPrice: { color: "#06b6d4", fontSize: 13 },
  noteInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlignVertical: "top",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 100,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
  },
  qtyButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    padding: 8,
  },
  qtyText: { fontSize: 18, fontWeight: "700", width: 30, textAlign: "center" },
  addButton: {
    flex: 1,
    backgroundColor: "#06b6d4",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
