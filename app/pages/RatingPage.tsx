import { supabase } from "@/lib/supabase/client";
import { Check, ChevronLeft, Star, Upload } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface RatingPageProps {
  onNavigate: (page: string, data?: any) => void;
  data?: {
    orderId: string;
    restaurantId?: string;
    driverId?: string;
  };
}

export default function RatingPage({ onNavigate, data }: RatingPageProps) {
  const [foodRating, setFoodRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [foodFeedback, setFoodFeedback] = useState("");
  const [driverFeedback, setDriverFeedback] = useState("");
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      // Get user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      if (!data?.orderId) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin đơn hàng");
        setLoading(false);
        return;
      }

      // Fetch order info
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          `
          *,
          restaurant:restaurants(id, name),
          delivery_assignment:delivery_assignments(
            driver:drivers(id, name)
          )
        `
        )
        .eq("id", data.orderId)
        .single();

      if (orderError) {
        console.error("Error fetching order:", orderError);
      } else {
        setOrder(orderData);
      }

      // Check if rating already exists
      const { data: ratingData, error: ratingError } = await supabase
        .from("reviews")
        .select("*")
        .eq("order_id", data.orderId)
        .maybeSingle();

      if (!ratingError && ratingData) {
        setExistingRating(ratingData);
        setFoodRating(ratingData.rating || 0);
        setFoodFeedback(ratingData.comment || "");
        setSelectedTags(ratingData.tags || []);
      }

      setLoading(false);
    };

    init();
  }, [data?.orderId]);

  const foodTags = [
    "Ngon",
    "Tươi mới",
    "Nóng hổi",
    "Đóng gói tốt",
    "Khẩu phần vừa đủ",
  ];
  const driverTags = [
    "Thân thiện",
    "Chuyên nghiệp",
    "Nhanh chóng",
    "Cẩn thận",
    "Giao không tiếp xúc",
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (foodRating === 0) {
      Alert.alert("Thông báo", "Vui lòng đánh giá món ăn!");
      return;
    }

    if (!data?.orderId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin đơn hàng");
      return;
    }

    setSaving(true);

    try {
      const ratingData = {
        order_id: data.orderId,
        user_id: userId,
        rating: foodRating,
        comment: foodFeedback || null,
        tags: selectedTags.length > 0 ? selectedTags : null,
      };

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from("reviews")
          .update(ratingData)
          .eq("id", existingRating.id);

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase.from("reviews").insert([ratingData]);

        if (error) throw error;
      }

      setSubmitted(true);
      setTimeout(() => {
        onNavigate("history");
      }, 2000);
    } catch (error: any) {
      console.error("Error saving rating:", error);
      Alert.alert("Lỗi", "Không thể lưu đánh giá. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={{ color: "#6b7280", marginTop: 8 }}>
          Đang tải thông tin...
        </Text>
      </SafeAreaView>
    );
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.successCircle}>
          <Check size={40} color="#16a34a" />
        </View>
        <Text style={styles.successTitle}>Cảm ơn bạn!</Text>
        <Text style={styles.successText}>
          {existingRating
            ? "Đánh giá đã được cập nhật"
            : "Đánh giá của bạn giúp chúng tôi cải thiện"}
        </Text>
        <Text style={styles.redirectText}>Đang chuyển về trang chủ...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("history")}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingRating ? "Chỉnh sửa đánh giá" : "Đánh giá đơn hàng"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* FOOD RATING */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.emoji}>🍔</Text>
            <View>
              <Text style={styles.cardTitle}>Đánh giá món ăn</Text>
              <Text style={styles.cardSubtitle}>Chất lượng như thế nào?</Text>
            </View>
          </View>

          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setFoodRating(star)}>
                <Star
                  size={34}
                  color={star <= foodRating ? "#facc15" : "#d1d5db"}
                  fill={star <= foodRating ? "#facc15" : "none"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tagContainer}>
            {foodTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.tagSelected,
                ]}
              >
                {selectedTags.includes(tag) && (
                  <Check size={14} color="#fff" style={{ marginRight: 4 }} />
                )}
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Chia sẻ trải nghiệm về món ăn..."
            value={foodFeedback}
            onChangeText={setFoodFeedback}
            multiline
            style={styles.textarea}
          />
        </View>

        {/* DRIVER RATING */}
        {order?.driver && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {order.driver.name?.charAt(0) || "D"}
                </Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>
                  Đánh giá {order.driver.name || "tài xế"}
                </Text>
                <Text style={styles.cardSubtitle}>Dịch vụ giao hàng?</Text>
              </View>
            </View>

            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setDriverRating(star)}
                >
                  <Star
                    size={34}
                    color={star <= driverRating ? "#facc15" : "#d1d5db"}
                    fill={star <= driverRating ? "#facc15" : "none"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.tagContainer}>
              {driverTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.tag,
                    selectedTags.includes(tag) && styles.tagSelected,
                  ]}
                >
                  {selectedTags.includes(tag) && (
                    <Check size={14} color="#fff" style={{ marginRight: 4 }} />
                  )}
                  <Text
                    style={[
                      styles.tagText,
                      selectedTags.includes(tag) && styles.tagTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Chia sẻ trải nghiệm về tài xế..."
              value={driverFeedback}
              onChangeText={setDriverFeedback}
              multiline
              style={styles.textarea}
            />
          </View>
        )}

        {/* DELIVERY RATING */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.emoji}>🚗</Text>
            <View>
              <Text style={styles.cardTitle}>Tốc độ giao hàng</Text>
              <Text style={styles.cardSubtitle}>Đúng giờ không?</Text>
            </View>
          </View>

          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setDeliveryRating(star)}
              >
                <Star
                  size={34}
                  color={star <= deliveryRating ? "#facc15" : "#d1d5db"}
                  fill={star <= deliveryRating ? "#facc15" : "none"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PHOTO UPLOAD */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { marginBottom: 8 }]}>
            Chia sẻ hình ảnh (Tùy chọn)
          </Text>
          <TouchableOpacity
            onPress={() => setPhotoUploaded(!photoUploaded)}
            style={[
              styles.uploadBox,
              photoUploaded ? styles.uploaded : styles.uploadDefault,
            ]}
          >
            {photoUploaded ? (
              <>
                <Check size={20} color="#16a34a" />
                <Text style={{ color: "#16a34a", fontWeight: "600" }}>
                  Đã thêm ảnh
                </Text>
              </>
            ) : (
              <>
                <Upload size={20} color="#6b7280" />
                <Text style={{ color: "#6b7280" }}>Nhấn để tải ảnh lên</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={foodRating === 0 || saving}
          style={[
            styles.submitButton,
            (foodRating === 0 || saving) && styles.disabledButton,
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitText}>
              {existingRating ? "Cập nhật đánh giá" : "Gửi đánh giá"}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Đánh giá của bạn rất quan trọng và giúp chúng tôi cải thiện dịch vụ
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#06b6d4",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  content: { padding: 16, paddingBottom: 60 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  emoji: { fontSize: 28 },
  cardTitle: { fontWeight: "700", fontSize: 15 },
  cardSubtitle: { color: "#6b7280", fontSize: 12 },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagSelected: { backgroundColor: "#06b6d4" },
  tagText: { fontSize: 12, color: "#374151" },
  tagTextSelected: { color: "#fff" },
  textarea: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    minHeight: 60,
    marginTop: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  uploadDefault: {
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },
  uploaded: {
    borderColor: "#16a34a",
    backgroundColor: "#dcfce7",
  },
  submitButton: {
    backgroundColor: "#06b6d4",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledButton: { opacity: 0.5 },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  footerText: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successCircle: {
    width: 80,
    height: 80,
    backgroundColor: "#dcfce7",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  successText: { color: "#6b7280", marginBottom: 8 },
  redirectText: { color: "#9ca3af", fontSize: 12 },
});
