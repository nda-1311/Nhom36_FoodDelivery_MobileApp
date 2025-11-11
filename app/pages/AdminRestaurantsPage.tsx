import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/design";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase/client";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Edit,
  MapPin,
  Plus,
  Search,
  Star,
  Store,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Alias for convenience
const SP = {
  xs: SPACING.xs,
  s: SPACING.s,
  m: SPACING.m,
  l: SPACING.l,
  xl: SPACING.xl,
  xxl: SPACING.xxl,
};
const RD = {
  xs: RADIUS.xs,
  s: RADIUS.s,
  m: RADIUS.m,
  l: RADIUS.l,
  xl: RADIUS.xl,
};

interface AdminRestaurantsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  rating?: number;
  image_url?: string;
  is_active?: boolean;
  created_at: string;
}

export default function AdminRestaurantsPage({
  onNavigate,
}: AdminRestaurantsPageProps) {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    image_url: "",
    is_active: true,
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert("Truy cập bị từ chối", "Bạn không có quyền truy cập");
      onNavigate("admin-dashboard");
      return;
    }

    if (isAdmin) {
      loadRestaurants();
    }
  }, [isAdmin, adminLoading, onNavigate]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRestaurants(data || []);
      setFilteredRestaurants(data || []);
    } catch (error) {
      console.error("Error loading restaurants:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách nhà hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(
        (restaurant) =>
          restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, restaurants]);

  const handleOpenModal = (restaurant?: Restaurant) => {
    if (restaurant) {
      setEditingRestaurant(restaurant);
      setFormData({
        name: restaurant.name || "",
        description: restaurant.description || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        image_url: restaurant.image_url || "",
        is_active: restaurant.is_active ?? true,
      });
    } else {
      setEditingRestaurant(null);
      setFormData({
        name: "",
        description: "",
        address: "",
        phone: "",
        image_url: "",
        is_active: true,
      });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingRestaurant(null);
    setFormData({
      name: "",
      description: "",
      address: "",
      phone: "",
      image_url: "",
      is_active: true,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhà hàng");
      return;
    }

    try {
      if (editingRestaurant) {
        // Update
        const { error } = await supabase
          .from("restaurants")
          .update(formData)
          .eq("id", editingRestaurant.id);

        if (error) throw error;
        Alert.alert("Thành công", "Cập nhật nhà hàng thành công");
      } else {
        // Create
        const { error } = await supabase.from("restaurants").insert([formData]);

        if (error) throw error;
        Alert.alert("Thành công", "Thêm nhà hàng thành công");
      }

      handleCloseModal();
      loadRestaurants();
    } catch (error) {
      console.error("Error saving restaurant:", error);
      Alert.alert("Lỗi", "Không thể lưu thông tin nhà hàng");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa nhà hàng "${name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("restaurants")
              .delete()
              .eq("id", id);

            if (error) throw error;

            Alert.alert("Thành công", "Xóa nhà hàng thành công");
            loadRestaurants();
          } catch (error) {
            console.error("Error deleting restaurant:", error);
            Alert.alert("Lỗi", "Không thể xóa nhà hàng");
          }
        },
      },
    ]);
  };

  if (adminLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <View style={styles.restaurantCard}>
      <View style={styles.restaurantHeader}>
        <View style={styles.restaurantInfo}>
          <Store size={24} color={COLORS.primary} />
          <View style={{ marginLeft: SP.s, flex: 1 }}>
            <Text style={styles.restaurantName}>{item.name}</Text>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <Star size={16} color="#FFB800" fill="#FFB800" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleOpenModal(item)}
          >
            <Edit size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Trash2 size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.address && (
        <View style={styles.addressContainer}>
          <MapPin size={16} color={COLORS.textSecondary} />
          <Text style={styles.addressText}>{item.address}</Text>
        </View>
      )}

      <View style={styles.restaurantFooter}>
        <View
          style={[
            styles.statusBadge,
            item.is_active ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.is_active ? styles.activeText : styles.inactiveText,
            ]}
          >
            {item.is_active ? "Đang hoạt động" : "Tạm ngưng"}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleDateString("vi-VN")}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => onNavigate("admin-dashboard")}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý nhà hàng</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleOpenModal()}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm nhà hàng..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Store size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Chưa có nhà hàng nào</Text>
          </View>
        }
      />

      {/* Modal for Create/Edit */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRestaurant ? "Sửa nhà hàng" : "Thêm nhà hàng"}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Tên nhà hàng *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Nhập tên nhà hàng"
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Nhập mô tả"
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Địa chỉ</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) =>
                  setFormData({ ...formData, address: text })
                }
                placeholder="Nhập địa chỉ"
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                placeholder="Nhập số điện thoại"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>URL hình ảnh</Text>
              <TextInput
                style={styles.input}
                value={formData.image_url}
                onChangeText={(text) =>
                  setFormData({ ...formData, image_url: text })
                }
                placeholder="Nhập URL hình ảnh"
                placeholderTextColor={COLORS.textSecondary}
              />

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Trạng thái hoạt động</Text>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    formData.is_active && styles.switchButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, is_active: !formData.is_active })
                  }
                >
                  <Text
                    style={[
                      styles.switchText,
                      formData.is_active && styles.switchTextActive,
                    ]}
                  >
                    {formData.is_active ? "Hoạt động" : "Tạm ngưng"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {editingRestaurant ? "Cập nhật" : "Thêm"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SP.m,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    paddingTop: SP.m,
    paddingBottom: SP.m,
    ...SHADOWS.medium,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SP.m,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    padding: SPACING.xs,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: SP.m,
    marginVertical: SP.m,
    paddingHorizontal: SP.m,
    paddingVertical: SP.s,
    borderRadius: RD.m,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    marginLeft: SP.s,
    fontSize: 16,
    color: COLORS.text,
  },
  listContainer: {
    padding: SP.m,
  },
  restaurantCard: {
    backgroundColor: "#fff",
    padding: SP.m,
    borderRadius: RD.m,
    marginBottom: SP.m,
    ...SHADOWS.small,
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SP.s,
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SP.s,
    lineHeight: 20,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SP.s,
  },
  addressText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  restaurantFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SP.s,
    paddingTop: SP.s,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statusBadge: {
    paddingHorizontal: SP.s,
    paddingVertical: 4,
    borderRadius: RD.s,
  },
  activeBadge: {
    backgroundColor: "#E8F5E9",
  },
  inactiveBadge: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activeText: {
    color: "#4CAF50",
  },
  inactiveText: {
    color: "#F44336",
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  editButton: {
    padding: SPACING.xs,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: SP.m,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: SP.m,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: RD.l,
    maxHeight: "90%",
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SP.m,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textSecondary,
    paddingHorizontal: SP.s,
  },
  formContainer: {
    padding: SP.m,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SP.s,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: RD.m,
    paddingHorizontal: SP.m,
    paddingVertical: SP.s,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SP.s,
  },
  switchButton: {
    paddingHorizontal: SP.m,
    paddingVertical: SP.s,
    borderRadius: RD.m,
    backgroundColor: "#f0f0f0",
  },
  switchButtonActive: {
    backgroundColor: COLORS.primary,
  },
  switchText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  switchTextActive: {
    color: "#fff",
  },
  modalFooter: {
    flexDirection: "row",
    padding: SP.m,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: SP.s,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SP.m,
    borderRadius: RD.m,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: SP.m,
    borderRadius: RD.m,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
