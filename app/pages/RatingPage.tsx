import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";
import { ChevronLeft, Star, Upload, Check } from "lucide-react-native";

interface RatingPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function RatingPage({ onNavigate }: RatingPageProps) {
  const [foodRating, setFoodRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [foodFeedback, setFoodFeedback] = useState("");
  const [driverFeedback, setDriverFeedback] = useState("");
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const foodTags = [
    "Delicious",
    "Fresh",
    "Hot",
    "Well-packaged",
    "Portion size",
  ];
  const driverTags = [
    "Friendly",
    "Professional",
    "Quick",
    "Careful",
    "Contactless",
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onNavigate("home");
    }, 2000);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.successCircle}>
          <Check size={40} color="#16a34a" />
        </View>
        <Text style={styles.successTitle}>Thank You!</Text>
        <Text style={styles.successText}>Your feedback helps us improve</Text>
        <Text style={styles.redirectText}>Redirecting to home...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("home")}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Order</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* FOOD RATING */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.emoji}>🍔</Text>
            <View>
              <Text style={styles.cardTitle}>Rate Your Food</Text>
              <Text style={styles.cardSubtitle}>How was the quality?</Text>
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
            placeholder="Tell us more about your food experience..."
            value={foodFeedback}
            onChangeText={setFoodFeedback}
            multiline
            style={styles.textarea}
          />
        </View>

        {/* DRIVER RATING */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>J</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Rate John Cooper</Text>
              <Text style={styles.cardSubtitle}>How was the delivery?</Text>
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
            placeholder="Tell us more about your driver experience..."
            value={driverFeedback}
            onChangeText={setDriverFeedback}
            multiline
            style={styles.textarea}
          />
        </View>

        {/* DELIVERY RATING */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.emoji}>🚗</Text>
            <View>
              <Text style={styles.cardTitle}>Rate Delivery Speed</Text>
              <Text style={styles.cardSubtitle}>Was it on time?</Text>
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
            Share a Photo (Optional)
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
                  Photo added
                </Text>
              </>
            ) : (
              <>
                <Upload size={20} color="#6b7280" />
                <Text style={{ color: "#6b7280" }}>Click to upload photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={foodRating === 0 || driverRating === 0}
          style={[
            styles.submitButton,
            (foodRating === 0 || driverRating === 0) && styles.disabledButton,
          ]}
        >
          <Text style={styles.submitText}>Submit Feedback</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Your feedback is valuable and helps us improve our service
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
