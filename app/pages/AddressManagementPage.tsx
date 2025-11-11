import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/design";
import { supabase } from "@/lib/supabase/client";
import { LinearGradient } from "expo-linear-gradient";
import {
  Briefcase,
  CheckCircle,
  ChevronLeft,
  Edit2,
  Home,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddressManagementPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Address {
  id: string;
  user_id: string;
  label: string;
  full_address: string;
  recipient_name: string;
  recipient_phone: string;
  is_default: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export default function AddressManagementPage({
  onNavigate,
}: AddressManagementPageProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: "home",
    full_address: "",
    recipient_name: "",
    recipient_phone: "",
    is_default: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Lỗi", "Bạn cần đăng nhập để xem địa chỉ");
        return;
      }

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error: any) {
      console.error("Error loading addresses:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label,
        full_address: address.full_address,
        recipient_name: address.recipient_name,
        recipient_phone: address.recipient_phone,
        is_default: address.is_default,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        label: "home",
        full_address: "",
        recipient_name: "",
        recipient_phone: "",
        is_default: addresses.length === 0, // Tự động là mặc định nếu chưa có địa chỉ nào
      });
    }
    setModalVisible(true);
  };

  const handleSaveAddress = async () => {
    if (
      !formData.full_address ||
      !formData.recipient_name ||
      !formData.recipient_phone
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Nếu đặt làm mặc định, bỏ mặc định các địa chỉ khác
      if (formData.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      if (editingAddress) {
        // Cập nhật địa chỉ
        const { error } = await supabase
          .from("addresses")
          .update(formData)
          .eq("id", editingAddress.id);

        if (error) throw error;
        Alert.alert("Thành công", "Đã cập nhật địa chỉ");
      } else {
        // Thêm địa chỉ mới
        const { error } = await supabase
          .from("addresses")
          .insert([{ ...formData, user_id: user.id }]);

        if (error) throw error;
        Alert.alert("Thành công", "Đã thêm địa chỉ mới");
      }

      setModalVisible(false);
      loadAddresses();
    } catch (error: any) {
      console.error("Error saving address:", error);
      Alert.alert("Lỗi", "Không thể lưu địa chỉ");
    }
  };

  const handleDeleteAddress = (address: Address) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa địa chỉ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("addresses")
              .delete()
              .eq("id", address.id);

            if (error) throw error;
            Alert.alert("Thành công", "Đã xóa địa chỉ");
            loadAddresses();
          } catch (error: any) {
            console.error("Error deleting address:", error);
            Alert.alert("Lỗi", "Không thể xóa địa chỉ");
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (address: Address) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Bỏ mặc định tất cả
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Đặt mặc định cho địa chỉ được chọn
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", address.id);

      if (error) throw error;
      loadAddresses();
    } catch (error: any) {
      console.error("Error setting default:", error);
      Alert.alert("Lỗi", "Không thể đặt địa chỉ mặc định");
    }
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case "home":
        return <Home size={20} color={COLORS.primary} />;
      case "work":
        return <Briefcase size={20} color={COLORS.primary} />;
      default:
        return <MapPin size={20} color={COLORS.primary} />;
    }
  };

  const getLabelText = (label: string) => {
    switch (label) {
      case "home":
        return "Nhà";
      case "work":
        return "Công ty";
      default:
        return "Khác";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => onNavigate("Account")}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Địa chỉ của tôi</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MapPin size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>Chưa có địa chỉ nào</Text>
            <Text style={styles.emptySubtext}>
              Thêm địa chỉ để nhận hàng nhanh hơn
            </Text>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              {address.is_default && (
                <View style={styles.defaultBadge}>
                  <CheckCircle size={14} color={COLORS.white} />
                  <Text style={styles.defaultBadgeText}>Mặc định</Text>
                </View>
              )}

              <View style={styles.addressHeader}>
                <View style={styles.labelContainer}>
                  {getLabelIcon(address.label)}
                  <Text style={styles.labelText}>
                    {getLabelText(address.label)}
                  </Text>
                </View>
              </View>

              <View style={styles.addressActions}>
                <TouchableOpacity
                  onPress={() => handleOpenModal(address)}
                  style={styles.actionButton}
                >
                  <Edit2 size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteAddress(address)}
                  style={styles.actionButton}
                >
                  <Trash2 size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.addressInfo}>
                <Text style={styles.recipientName}>
                  {address.recipient_name}
                </Text>
                <Text style={styles.recipientPhone}>
                  {address.recipient_phone}
                </Text>
                <Text style={styles.fullAddress}>{address.full_address}</Text>
              </View>

              {!address.is_default && (
                <TouchableOpacity
                  onPress={() => handleSetDefault(address)}
                  style={styles.setDefaultButton}
                >
                  <Text style={styles.setDefaultText}>Đặt làm mặc định</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleOpenModal()}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.addButtonGradient}
        >
          <Plus size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Label */}
              <Text style={styles.formLabel}>Loại địa chỉ</Text>
              <View style={styles.labelSelector}>
                {["home", "work", "other"].map((label) => (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.labelOption,
                      formData.label === label && styles.labelOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, label })}
                  >
                    <Text
                      style={[
                        styles.labelOptionText,
                        formData.label === label &&
                          styles.labelOptionTextActive,
                      ]}
                    >
                      {getLabelText(label)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Recipient Name */}
              <Text style={styles.formLabel}>Tên người nhận</Text>
              <TextInput
                style={styles.input}
                value={formData.recipient_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, recipient_name: text })
                }
                placeholder="Nhập tên người nhận"
                placeholderTextColor={COLORS.textLight}
              />

              {/* Recipient Phone */}
              <Text style={styles.formLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={formData.recipient_phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, recipient_phone: text })
                }
                placeholder="Nhập số điện thoại"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
              />

              {/* Full Address */}
              <Text style={styles.formLabel}>Địa chỉ chi tiết</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.full_address}
                onChangeText={(text) =>
                  setFormData({ ...formData, full_address: text })
                }
                placeholder="Số nhà, tên đường, phường, quận..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={3}
              />

              {/* Set Default */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() =>
                  setFormData({ ...formData, is_default: !formData.is_default })
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    formData.is_default && styles.checkboxActive,
                  ]}
                >
                  {formData.is_default && (
                    <CheckCircle size={18} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  Đặt làm địa chỉ mặc định
                </Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAddress}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Lưu địa chỉ</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SPACING.l,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.l,
    paddingBottom: SPACING.bottomNav + SPACING.l,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SPACING.l,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.l,
    padding: SPACING.l,
    marginBottom: SPACING.l,
    ...SHADOWS.medium,
    position: "relative",
  },
  defaultBadge: {
    position: "absolute",
    top: SPACING.l,
    right: SPACING.l,
    backgroundColor: COLORS.success,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.s,
    gap: 4,
  },
  defaultBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "600",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.s,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  addressActions: {
    position: "absolute",
    bottom: SPACING.l,
    right: SPACING.l,
    flexDirection: "row",
    gap: SPACING.s,
  },
  actionButton: {
    padding: SPACING.xs,
  },
  addressInfo: {
    gap: 4,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  recipientPhone: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  fullAddress: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginTop: 4,
  },
  setDefaultButton: {
    marginTop: SPACING.s,
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: "center",
  },
  setDefaultText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: SPACING.xs,
  },
  addButton: {
    margin: SPACING.l,
    marginBottom: SPACING.bottomNav,
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.l,
    borderRadius: SPACING.l,
    gap: SPACING.xs,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  modalForm: {
    padding: SPACING.l,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.s,
  },
  labelSelector: {
    flexDirection: "row",
    gap: SPACING.s,
    marginBottom: SPACING.s,
  },
  labelOption: {
    flex: 1,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.l,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  labelOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  labelOptionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  labelOptionTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.m,
    padding: SPACING.s,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.l,
    gap: SPACING.s,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.s,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  saveButton: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.l,
  },
  saveButtonGradient: {
    paddingVertical: SPACING.l,
    borderRadius: SPACING.l,
    alignItems: "center",
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
