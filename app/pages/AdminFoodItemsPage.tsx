import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/design";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase/client";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  DollarSign,
  Edit,
  Filter,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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

interface AdminFoodItemsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface FoodItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  restaurant_id: string;
  category?: string;
  image_url?: string;
  is_available?: boolean;
  created_at: string;
  restaurant_name?: string;
}

interface Restaurant {
  id: string;
  name: string;
}

export default function AdminFoodItemsPage({
  onNavigate,
}: AdminFoodItemsPageProps) {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRestaurant, setFilterRestaurant] = useState<string>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    restaurant_id: "",
    category: "",
    image_url: "",
    is_available: true,
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert("Truy cập bị từ chối", "Bạn không có quyền truy cập");
      onNavigate("admin-dashboard");
      return;
    }

    if (isAdmin) {
      loadRestaurants();
      loadFoodItems();
    }
  }, [isAdmin, adminLoading, onNavigate]);

  const loadRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error("Error loading restaurants:", error);
    }
  };

  const loadFoodItems = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("food_items")
        .select(
          `
          *,
          restaurants(name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const itemsWithRestaurant = (data || []).map((item: any) => ({
        ...item,
        restaurant_name: item.restaurants?.name,
      }));

      setFoodItems(itemsWithRestaurant);
      setFilteredItems(itemsWithRestaurant);
    } catch (error) {
      console.error("Error loading food items:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách món ăn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = foodItems;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.restaurant_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Filter by restaurant
    if (filterRestaurant !== "all") {
      filtered = filtered.filter(
        (item) => item.restaurant_id === filterRestaurant
      );
    }

    setFilteredItems(filtered);
  }, [searchQuery, filterRestaurant, foodItems]);

  const handleOpenModal = (item?: FoodItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        description: item.description || "",
        price: item.price?.toString() || "",
        restaurant_id: item.restaurant_id || "",
        category: item.category || "",
        image_url: item.image_url || "",
        is_available: item.is_available ?? true,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        restaurant_id: restaurants[0]?.id || "",
        category: "",
        image_url: "",
        is_available: true,
      });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên món ăn");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập giá hợp lệ");
      return;
    }

    if (!formData.restaurant_id) {
      Alert.alert("Lỗi", "Vui lòng chọn nhà hàng");
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (editingItem) {
        // Update
        const { error } = await supabase
          .from("food_items")
          .update(dataToSave)
          .eq("id", editingItem.id);

        if (error) throw error;
        Alert.alert("Thành công", "Cập nhật món ăn thành công");
      } else {
        // Create
        const { error } = await supabase
          .from("food_items")
          .insert([dataToSave]);

        if (error) throw error;
        Alert.alert("Thành công", "Thêm món ăn thành công");
      }

      handleCloseModal();
      loadFoodItems();
    } catch (error) {
      console.error("Error saving food item:", error);
      Alert.alert("Lỗi", "Không thể lưu thông tin món ăn");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa món "${name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("food_items")
              .delete()
              .eq("id", id);

            if (error) throw error;

            Alert.alert("Thành công", "Xóa món ăn thành công");
            loadFoodItems();
          } catch (error) {
            console.error("Error deleting food item:", error);
            Alert.alert("Lỗi", "Không thể xóa món ăn");
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

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <View style={styles.foodCard}>
      <View style={styles.foodHeader}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.foodImage} />
        ) : (
          <View style={[styles.foodImage, styles.placeholderImage]}>
            <UtensilsCrossed size={32} color={COLORS.textSecondary} />
          </View>
        )}
        <View style={styles.foodInfo}>
          <Text style={styles.foodName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.restaurant_name || "N/A"}
          </Text>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
          <View style={styles.priceContainer}>
            <DollarSign size={16} color={COLORS.primary} />
            <Text style={styles.priceText}>
              {item.price?.toLocaleString("vi-VN")}đ
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.foodFooter}>
        <View
          style={[
            styles.statusBadge,
            item.is_available ? styles.availableBadge : styles.unavailableBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.is_available ? styles.availableText : styles.unavailableText,
            ]}
          >
            {item.is_available ? "Có sẵn" : "Hết hàng"}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleOpenModal(item)}
          >
            <Edit size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Trash2 size={18} color="#F44336" />
          </TouchableOpacity>
        </View>
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
          <Text style={styles.headerTitle}>Quản lý món ăn</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleOpenModal()}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.toolbarContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {filterRestaurant !== "all" && (
        <View style={styles.activeFilterContainer}>
          <Text style={styles.activeFilterText}>
            Lọc theo: {restaurants.find((r) => r.id === filterRestaurant)?.name}
          </Text>
          <TouchableOpacity onPress={() => setFilterRestaurant("all")}>
            <Text style={styles.clearFilterText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredItems}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <UtensilsCrossed size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Chưa có món ăn nào</Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: "60%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc theo nhà hàng</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterList}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterRestaurant === "all" && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setFilterRestaurant("all");
                  setFilterModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterRestaurant === "all" && styles.filterOptionTextActive,
                  ]}
                >
                  Tất cả nhà hàng
                </Text>
              </TouchableOpacity>

              {restaurants.map((restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  style={[
                    styles.filterOption,
                    filterRestaurant === restaurant.id &&
                      styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setFilterRestaurant(restaurant.id);
                    setFilterModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterRestaurant === restaurant.id &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {restaurant.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create/Edit Modal */}
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
                {editingItem ? "Sửa món ăn" : "Thêm món ăn"}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Tên món ăn *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Nhập tên món ăn"
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Nhà hàng *</Text>
              <View style={styles.pickerContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.restaurantPicker}
                >
                  {restaurants.map((restaurant) => (
                    <TouchableOpacity
                      key={restaurant.id}
                      style={[
                        styles.restaurantOption,
                        formData.restaurant_id === restaurant.id &&
                          styles.restaurantOptionActive,
                      ]}
                      onPress={() =>
                        setFormData({
                          ...formData,
                          restaurant_id: restaurant.id,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.restaurantOptionText,
                          formData.restaurant_id === restaurant.id &&
                            styles.restaurantOptionTextActive,
                        ]}
                      >
                        {restaurant.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.label}>Giá *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) =>
                  setFormData({ ...formData, price: text })
                }
                placeholder="Nhập giá"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Danh mục</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) =>
                  setFormData({ ...formData, category: text })
                }
                placeholder="VD: Món chính, Tráng miệng, Đồ uống..."
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
                <Text style={styles.label}>Trạng thái</Text>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    formData.is_available && styles.switchButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      is_available: !formData.is_available,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.switchText,
                      formData.is_available && styles.switchTextActive,
                    ]}
                  >
                    {formData.is_available ? "Có sẵn" : "Hết hàng"}
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
                  {editingItem ? "Cập nhật" : "Thêm"}
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
    padding: SP.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  addButton: {
    padding: SP.xs,
  },
  toolbarContainer: {
    flexDirection: "row",
    paddingHorizontal: SP.m,
    paddingVertical: SP.m,
    gap: SP.s,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
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
  filterButton: {
    backgroundColor: "#fff",
    padding: SP.m,
    borderRadius: RD.m,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.small,
  },
  activeFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: SP.m,
    marginBottom: SP.s,
    paddingHorizontal: SP.m,
    paddingVertical: SP.s,
    borderRadius: RD.s,
  },
  activeFilterText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  clearFilterText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: SP.s,
  },
  listContainer: {
    padding: SP.s,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: SP.s,
  },
  foodCard: {
    backgroundColor: "#fff",
    borderRadius: RD.m,
    marginBottom: SP.m,
    width: "48%",
    ...SHADOWS.small,
  },
  foodHeader: {
    padding: SP.s,
  },
  foodImage: {
    width: "100%",
    height: 120,
    borderRadius: RD.s,
    marginBottom: SP.s,
  },
  placeholderImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  foodInfo: {
    gap: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  restaurantName: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: SP.s,
    paddingVertical: 2,
    borderRadius: RD.xs,
    marginTop: 2,
  },
  categoryText: {
    fontSize: 11,
    color: "#1976D2",
    fontWeight: "600",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginLeft: 2,
  },
  foodFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SP.s,
    paddingBottom: SP.s,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: SP.s,
  },
  statusBadge: {
    paddingHorizontal: SP.s,
    paddingVertical: 4,
    borderRadius: RD.xs,
  },
  availableBadge: {
    backgroundColor: "#E8F5E9",
  },
  unavailableBadge: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  availableText: {
    color: "#4CAF50",
  },
  unavailableText: {
    color: "#F44336",
  },
  actionButtons: {
    flexDirection: "row",
    gap: SP.xs,
  },
  editButton: {
    padding: SP.xs,
  },
  deleteButton: {
    padding: SP.xs,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    width: "100%",
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
    marginBottom: SP.xs,
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
  pickerContainer: {
    marginBottom: SP.s,
  },
  restaurantPicker: {
    flexDirection: "row",
  },
  restaurantOption: {
    paddingHorizontal: SP.m,
    paddingVertical: SP.s,
    borderRadius: RD.m,
    backgroundColor: "#f0f0f0",
    marginRight: SP.s,
  },
  restaurantOptionActive: {
    backgroundColor: COLORS.primary,
  },
  restaurantOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  restaurantOptionTextActive: {
    color: "#fff",
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
  // Filter modal styles
  filterList: {
    padding: SP.m,
  },
  filterOption: {
    paddingVertical: SP.m,
    paddingHorizontal: SP.m,
    borderRadius: RD.s,
    marginBottom: SP.s,
    backgroundColor: "#f8f9fa",
  },
  filterOptionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  filterOptionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  filterOptionTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});
