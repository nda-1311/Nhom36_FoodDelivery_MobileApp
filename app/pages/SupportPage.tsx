import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/design";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SupportPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function SupportPage({ onNavigate }: SupportPageProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const faqData: FAQItem[] = [
    {
      id: "1",
      category: "order",
      question: "Làm thế nào để đặt hàng?",
      answer:
        "Bạn có thể đặt hàng bằng cách: 1) Chọn nhà hàng yêu thích 2) Thêm món ăn vào giỏ hàng 3) Xác nhận địa chỉ giao hàng 4) Chọn phương thức thanh toán 5) Xác nhận đơn hàng",
    },
    {
      id: "2",
      category: "order",
      question: "Thời gian giao hàng là bao lâu?",
      answer:
        "Thời gian giao hàng trung bình là 30-45 phút tùy thuộc vào khoảng cách và tình trạng giao thông. Bạn có thể theo dõi đơn hàng realtime trong ứng dụng.",
    },
    {
      id: "3",
      category: "payment",
      question: "Ứng dụng hỗ trợ những phương thức thanh toán nào?",
      answer:
        "Chúng tôi hỗ trợ: Tiền mặt khi nhận hàng, Thẻ tín dụng/ghi nợ, Ví MoMo, Ví ZaloPay và các phương thức thanh toán điện tử khác.",
    },
    {
      id: "4",
      category: "payment",
      question: "Thông tin thanh toán của tôi có an toàn không?",
      answer:
        "Tất cả thông tin thanh toán được mã hóa và bảo mật theo tiêu chuẩn PCI DSS. Chúng tôi không lưu trữ thông tin thẻ trực tiếp trên máy chủ.",
    },
    {
      id: "5",
      category: "account",
      question: "Làm thế nào để thay đổi mật khẩu?",
      answer:
        "Vào Tài khoản > Cài đặt > Đổi mật khẩu. Nhập mật khẩu cũ và mật khẩu mới để cập nhật.",
    },
    {
      id: "6",
      category: "account",
      question: "Tôi quên mật khẩu, phải làm sao?",
      answer:
        "Nhấn 'Quên mật khẩu' ở màn hình đăng nhập, nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu đến email của bạn.",
    },
    {
      id: "7",
      category: "promotion",
      question: "Làm thế nào để sử dụng mã giảm giá?",
      answer:
        "Tại trang thanh toán, nhấn vào 'Mã giảm giá', nhập hoặc chọn mã có sẵn và nhấn 'Áp dụng'. Giảm giá sẽ được tính vào tổng đơn hàng.",
    },
    {
      id: "8",
      category: "promotion",
      question: "Tại sao mã giảm giá của tôi không dùng được?",
      answer:
        "Kiểm tra: 1) Mã còn hiệu lực 2) Đơn hàng đạt giá trị tối thiểu 3) Mã áp dụng cho nhà hàng/món ăn bạn chọn 4) Bạn chưa sử dụng mã này trước đó nếu mã chỉ dùng 1 lần",
    },
    {
      id: "9",
      category: "delivery",
      question: "Phí giao hàng được tính như thế nào?",
      answer:
        "Phí giao hàng phụ thuộc vào khoảng cách giữa nhà hàng và địa chỉ giao hàng. Phí sẽ được hiển thị rõ ràng trước khi bạn đặt hàng.",
    },
    {
      id: "10",
      category: "delivery",
      question: "Tôi có thể hủy đơn hàng không?",
      answer:
        "Bạn có thể hủy đơn hàng miễn phí trong vòng 2 phút sau khi đặt. Sau thời gian này, vui lòng liên hệ hotline để được hỗ trợ.",
    },
  ];

  const categories = [
    { id: "all", name: "Tất cả", icon: HelpCircle },
    { id: "order", name: "Đặt hàng", icon: FileText },
    { id: "payment", name: "Thanh toán", icon: ShieldCheck },
    { id: "account", name: "Tài khoản", icon: Users },
    { id: "promotion", name: "Khuyến mãi", icon: BookOpen },
    { id: "delivery", name: "Giao hàng", icon: MessageCircle },
  ];

  const filteredFAQ =
    selectedCategory === "all"
      ? faqData
      : faqData.filter((faq) => faq.category === selectedCategory);

  const handleCall = () => {
    Linking.openURL("tel:1900xxxx");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@fooddelivery.com");
  };

  const handleChat = () => {
    Alert.alert(
      "Chat hỗ trợ",
      "Tính năng chat trực tiếp đang được phát triển. Vui lòng liên hệ qua hotline hoặc email."
    );
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

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
          <Text style={styles.headerTitle}>Hỗ trợ & Trợ giúp</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ nhanh</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
              <View style={styles.contactIconContainer}>
                <Phone size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.contactLabel}>Hotline</Text>
              <Text style={styles.contactValue}>1900 xxxx</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
              <View style={styles.contactIconContainer}>
                <Mail size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@...</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handleChat}>
              <View style={styles.contactIconContainer}>
                <MessageCircle size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.contactLabel}>Chat</Text>
              <Text style={styles.contactValue}>Trực tuyến</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id &&
                      styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Icon
                    size={16}
                    color={
                      selectedCategory === category.id
                        ? COLORS.white
                        : COLORS.primary
                    }
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category.id &&
                        styles.categoryChipTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* FAQ Items */}
          <View style={styles.faqList}>
            {filteredFAQ.map((faq) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(faq.id)}
                >
                  <HelpCircle size={20} color={COLORS.primary} />
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <ChevronRight
                    size={20}
                    color={COLORS.textLight}
                    style={{
                      transform: [
                        {
                          rotate: expandedFAQ === faq.id ? "90deg" : "0deg",
                        },
                      ],
                    }}
                  />
                </TouchableOpacity>
                {expandedFAQ === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Help Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hướng dẫn sử dụng</Text>
          <TouchableOpacity style={styles.helpItem}>
            <BookOpen size={20} color={COLORS.primary} />
            <Text style={styles.helpItemText}>Cách đặt hàng lần đầu</Text>
            <ChevronRight size={20} color={COLORS.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpItem}>
            <ShieldCheck size={20} color={COLORS.primary} />
            <Text style={styles.helpItemText}>Chính sách bảo mật</Text>
            <ChevronRight size={20} color={COLORS.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpItem}>
            <FileText size={20} color={COLORS.primary} />
            <Text style={styles.helpItemText}>Điều khoản sử dụng</Text>
            <ChevronRight size={20} color={COLORS.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpItem}>
            <Users size={20} color={COLORS.primary} />
            <Text style={styles.helpItemText}>Về chúng tôi</Text>
            <ChevronRight size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Phiên bản ứng dụng: 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingBottom: SPACING.bottomNav,
  },
  section: {
    padding: SPACING.l,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.extraLightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.l,
  },
  contactGrid: {
    flexDirection: "row",
    gap: SPACING.m,
  },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.m,
    padding: SPACING.l,
    alignItems: "center",
    ...SHADOWS.small,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.s,
  },
  contactLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  categoryScroll: {
    marginBottom: SPACING.l,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.s,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  faqList: {
    gap: SPACING.s,
  },
  faqItem: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.m,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.m,
    padding: SPACING.l,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  faqAnswer: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.l,
    paddingTop: SPACING.xs,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
    paddingLeft: 32,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.m,
    backgroundColor: COLORS.white,
    padding: SPACING.l,
    borderRadius: RADIUS.m,
    marginBottom: SPACING.s,
    ...SHADOWS.small,
  },
  helpItemText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  versionContainer: {
    padding: SPACING.l,
    alignItems: "center",
  },
  versionText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
});
