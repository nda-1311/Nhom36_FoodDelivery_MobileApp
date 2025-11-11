import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/design";
import { supabase } from "@/lib/supabase/client";
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle,
  ChevronLeft,
  CreditCard,
  DollarSign,
  Edit2,
  Plus,
  Trash2,
  Wallet,
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

interface PaymentMethodPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface PaymentMethod {
  id: string;
  user_id: string;
  type: "card" | "momo" | "zalopay" | "cash";
  card_number?: string;
  card_holder?: string;
  expiry_date?: string;
  phone_number?: string;
  is_default: boolean;
  created_at: string;
}

export default function PaymentMethodPage({
  onNavigate,
}: PaymentMethodPageProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );
  const [formData, setFormData] = useState({
    type: "card" as "card" | "momo" | "zalopay" | "cash",
    card_number: "",
    card_holder: "",
    expiry_date: "",
    phone_number: "",
    is_default: false,
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Lỗi", "Bạn cần đăng nhập để xem phương thức thanh toán");
        return;
      }

      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error: any) {
      console.error("Error loading payment methods:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách phương thức thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        type: method.type,
        card_number: method.card_number || "",
        card_holder: method.card_holder || "",
        expiry_date: method.expiry_date || "",
        phone_number: method.phone_number || "",
        is_default: method.is_default,
      });
    } else {
      setEditingMethod(null);
      setFormData({
        type: "card",
        card_number: "",
        card_holder: "",
        expiry_date: "",
        phone_number: "",
        is_default: paymentMethods.length === 0,
      });
    }
    setModalVisible(true);
  };

  const handleSaveMethod = async () => {
    // Validation
    if (formData.type === "card") {
      if (
        !formData.card_number ||
        !formData.card_holder ||
        !formData.expiry_date
      ) {
        Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin thẻ");
        return;
      }
    } else if (formData.type === "momo" || formData.type === "zalopay") {
      if (!formData.phone_number) {
        Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
        return;
      }
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Nếu đặt làm mặc định, bỏ mặc định các phương thức khác
      if (formData.is_default) {
        await supabase
          .from("payment_methods")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      // Prepare data based on type
      const dataToSave: any = {
        type: formData.type,
        is_default: formData.is_default,
      };

      if (formData.type === "card") {
        dataToSave.card_number = formData.card_number;
        dataToSave.card_holder = formData.card_holder;
        dataToSave.expiry_date = formData.expiry_date;
      } else if (formData.type === "momo" || formData.type === "zalopay") {
        dataToSave.phone_number = formData.phone_number;
      }

      if (editingMethod) {
        // Cập nhật phương thức
        const { error } = await supabase
          .from("payment_methods")
          .update(dataToSave)
          .eq("id", editingMethod.id);

        if (error) throw error;
        Alert.alert("Thành công", "Đã cập nhật phương thức thanh toán");
      } else {
        // Thêm phương thức mới
        const { error } = await supabase
          .from("payment_methods")
          .insert([{ ...dataToSave, user_id: user.id }]);

        if (error) throw error;
        Alert.alert("Thành công", "Đã thêm phương thức thanh toán mới");
      }

      setModalVisible(false);
      loadPaymentMethods();
    } catch (error: any) {
      console.error("Error saving payment method:", error);
      Alert.alert("Lỗi", "Không thể lưu phương thức thanh toán");
    }
  };

  const handleDeleteMethod = (method: PaymentMethod) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa phương thức thanh toán này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("payment_methods")
                .delete()
                .eq("id", method.id);

              if (error) throw error;
              Alert.alert("Thành công", "Đã xóa phương thức thanh toán");
              loadPaymentMethods();
            } catch (error: any) {
              console.error("Error deleting payment method:", error);
              Alert.alert("Lỗi", "Không thể xóa phương thức thanh toán");
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (method: PaymentMethod) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Bỏ mặc định tất cả
      await supabase
        .from("payment_methods")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Đặt mặc định cho phương thức được chọn
      const { error } = await supabase
        .from("payment_methods")
        .update({ is_default: true })
        .eq("id", method.id);

      if (error) throw error;
      loadPaymentMethods();
    } catch (error: any) {
      console.error("Error setting default:", error);
      Alert.alert("Lỗi", "Không thể đặt phương thức mặc định");
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "card":
        return <CreditCard size={24} color={COLORS.primary} />;
      case "momo":
      case "zalopay":
        return <Wallet size={24} color={COLORS.primary} />;
      case "cash":
        return <DollarSign size={24} color={COLORS.primary} />;
      default:
        return <CreditCard size={24} color={COLORS.primary} />;
    }
  };

  const getMethodName = (type: string) => {
    switch (type) {
      case "card":
        return "Thẻ tín dụng/ghi nợ";
      case "momo":
        return "Ví MoMo";
      case "zalopay":
        return "Ví ZaloPay";
      case "cash":
        return "Tiền mặt";
      default:
        return type;
    }
  };

  const maskCardNumber = (number: string) => {
    if (number.length < 4) return number;
    return "**** **** **** " + number.slice(-4);
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
          <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CreditCard size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>
              Chưa có phương thức thanh toán nào
            </Text>
            <Text style={styles.emptySubtext}>
              Thêm phương thức để thanh toán nhanh hơn
            </Text>
          </View>
        ) : (
          paymentMethods.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              {method.is_default && (
                <View style={styles.defaultBadge}>
                  <CheckCircle size={14} color={COLORS.white} />
                  <Text style={styles.defaultBadgeText}>Mặc định</Text>
                </View>
              )}

              <View style={styles.methodHeader}>
                <View style={styles.methodInfo}>
                  {getMethodIcon(method.type)}
                  <View style={styles.methodDetails}>
                    <Text style={styles.methodName}>
                      {getMethodName(method.type)}
                    </Text>
                    {method.type === "card" && method.card_number && (
                      <>
                        <Text style={styles.cardNumber}>
                          {maskCardNumber(method.card_number)}
                        </Text>
                        <Text style={styles.cardHolder}>
                          {method.card_holder}
                        </Text>
                        <Text style={styles.expiryDate}>
                          Hết hạn: {method.expiry_date}
                        </Text>
                      </>
                    )}
                    {(method.type === "momo" || method.type === "zalopay") &&
                      method.phone_number && (
                        <Text style={styles.phoneNumber}>
                          {method.phone_number}
                        </Text>
                      )}
                  </View>
                </View>
                <View style={styles.methodActions}>
                  {method.type !== "cash" && (
                    <>
                      <TouchableOpacity
                        onPress={() => handleOpenModal(method)}
                        style={styles.actionButton}
                      >
                        <Edit2 size={18} color={COLORS.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteMethod(method)}
                        style={styles.actionButton}
                      >
                        <Trash2 size={18} color={COLORS.error} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              {!method.is_default && (
                <TouchableOpacity
                  onPress={() => handleSetDefault(method)}
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
          <Text style={styles.addButtonText}>Thêm phương thức thanh toán</Text>
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
                {editingMethod
                  ? "Chỉnh sửa phương thức"
                  : "Thêm phương thức mới"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Type Selector */}
              <Text style={styles.formLabel}>Loại phương thức</Text>
              <View style={styles.typeSelector}>
                {["card", "momo", "zalopay", "cash"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      formData.type === type && styles.typeOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        type: type as "card" | "momo" | "zalopay" | "cash",
                      })
                    }
                  >
                    <View style={styles.typeIconContainer}>
                      {type === "card" && (
                        <CreditCard 
                          size={20} 
                          color={formData.type === type ? COLORS.white : COLORS.primary} 
                        />
                      )}
                      {(type === "momo" || type === "zalopay") && (
                        <Wallet 
                          size={20} 
                          color={formData.type === type ? COLORS.white : COLORS.primary} 
                        />
                      )}
                      {type === "cash" && (
                        <DollarSign 
                          size={20} 
                          color={formData.type === type ? COLORS.white : COLORS.primary} 
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === type && styles.typeOptionTextActive,
                      ]}
                    >
                      {type === "card"
                        ? "Thẻ"
                        : type === "momo"
                        ? "MoMo"
                        : type === "zalopay"
                        ? "ZaloPay"
                        : "Tiền mặt"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Card Fields */}
              {formData.type === "card" && (
                <>
                  <Text style={styles.formLabel}>Số thẻ</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.card_number}
                    onChangeText={(text) =>
                      setFormData({ ...formData, card_number: text })
                    }
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="numeric"
                    maxLength={16}
                  />

                  <Text style={styles.formLabel}>Tên chủ thẻ</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.card_holder}
                    onChangeText={(text) =>
                      setFormData({ ...formData, card_holder: text })
                    }
                    placeholder="NGUYEN VAN A"
                    placeholderTextColor={COLORS.textLight}
                    autoCapitalize="characters"
                  />

                  <Text style={styles.formLabel}>Ngày hết hạn (MM/YY)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.expiry_date}
                    onChangeText={(text) =>
                      setFormData({ ...formData, expiry_date: text })
                    }
                    placeholder="12/25"
                    placeholderTextColor={COLORS.textLight}
                    maxLength={5}
                  />
                </>
              )}

              {/* E-Wallet Fields */}
              {(formData.type === "momo" || formData.type === "zalopay") && (
                <>
                  <Text style={styles.formLabel}>Số điện thoại</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone_number}
                    onChangeText={(text) =>
                      setFormData({ ...formData, phone_number: text })
                    }
                    placeholder="0123456789"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="phone-pad"
                  />
                </>
              )}

              {/* Cash doesn't need fields */}
              {formData.type === "cash" && (
                <View style={styles.cashInfo}>
                  <Text style={styles.cashInfoText}>
                    Thanh toán tiền mặt khi nhận hàng
                  </Text>
                </View>
              )}

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
                  Đặt làm phương thức mặc định
                </Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveMethod}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Lưu phương thức</Text>
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
  methodCard: {
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
  methodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  methodInfo: {
    flexDirection: "row",
    gap: SPACING.m,
    flex: 1,
  },
  methodDetails: {
    flex: 1,
    gap: 4,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginTop: 4,
  },
  cardHolder: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  expiryDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  phoneNumber: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 4,
  },
  methodActions: {
    position: "absolute",
    bottom: SPACING.l,
    right: SPACING.l,
    flexDirection: "row",
    gap: SPACING.s,
  },
  actionButton: {
    padding: SPACING.xs,
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
  typeSelector: {
    flexDirection: "row",
    gap: SPACING.s,
    marginBottom: SPACING.s,
    flexWrap: "wrap",
  },
  typeOption: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.s,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    gap: SPACING.xs,
  },
  typeOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeIconContainer: {
    marginBottom: 4,
  },
  typeOptionText: {
    fontSize: 12,
    color: COLORS.text,
  },
  typeOptionTextActive: {
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
  cashInfo: {
    backgroundColor: COLORS.successLight,
    padding: SPACING.l,
    borderRadius: RADIUS.m,
    marginTop: SPACING.s,
  },
  cashInfoText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
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
