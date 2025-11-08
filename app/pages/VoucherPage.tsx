import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  ChevronLeft,
  Percent,
  TicketPercent,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";

interface VoucherPageProps {
  onNavigate: (page: string, data?: any) => void;
}

type Voucher = {
  id: string | number;
  title: string;
  code: string;
  discount_type: "percent" | "amount";
  value: number;
  min_order?: number | null;
  expiry_date: string;
  status?: "active" | "used" | "expired";
  description?: string | null;
};

function formatMoney(v: number) {
  try {
    return v.toLocaleString("vi-VN") + "₫";
  } catch {
    return `${v}₫`;
  }
}

function computeStatus(v: Voucher): "active" | "used" | "expired" {
  if (v.status && v.status !== "active") return v.status;
  const today = new Date();
  const end = new Date(v.expiry_date);
  return end.getTime() < today.setHours(0, 0, 0, 0) ? "expired" : "active";
}

function daysLeft(expiryISO: string) {
  const end = new Date(expiryISO);
  const today = new Date();
  const diff = Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

export default function VoucherPage({ onNavigate }: VoucherPageProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "used" | "expired">(
    "active"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("vouchers")
          .select(
            "id, title, code, discount_type, value, min_order, expiry_date, status, description"
          )
          .order("expiry_date", { ascending: true });

        if (error || !data || data.length === 0) {
          // dữ liệu mẫu
          const demo: Voucher[] = [
            {
              id: "v1",
              title: "Freeship cho đơn từ 99k",
              code: "SHIP99",
              discount_type: "amount",
              value: 15000,
              min_order: 99000,
              expiry_date: new Date(
                Date.now() + 1000 * 60 * 60 * 24 * 5
              ).toISOString(),
              status: "active",
              description: "Áp dụng cho một số cửa hàng tham gia.",
            },
            {
              id: "v2",
              title: "Giảm 20% đồ ăn nhanh",
              code: "FAST20",
              discount_type: "percent",
              value: 20,
              min_order: 80000,
              expiry_date: new Date(
                Date.now() + 1000 * 60 * 60 * 24 * 2
              ).toISOString(),
              status: "active",
              description: "Giảm tối đa 40.000₫.",
            },
            {
              id: "v3",
              title: "Deal 1 đô",
              code: "ONE1",
              discount_type: "amount",
              value: 24000,
              min_order: 50000,
              expiry_date: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 1
              ).toISOString(),
              status: "expired",
              description: "Số lượng có hạn.",
            },
            {
              id: "v4",
              title: "Giảm 10% Healthy",
              code: "HEALTH10",
              discount_type: "percent",
              value: 10,
              min_order: 70000,
              expiry_date: new Date(
                Date.now() + 1000 * 60 * 60 * 24 * 10
              ).toISOString(),
              status: "used",
              description: "Áp dụng vào bữa trưa.",
            },
            {
              id: "v5",
              title: "Freeship mọi đơn",
              code: "SHIPFREE",
              discount_type: "amount",
              value: 20000,
              min_order: 0,
              expiry_date: new Date(
                Date.now() + 1000 * 60 * 60 * 24 * 1
              ).toISOString(),
              status: "active",
              description: null,
            },
          ];
          setVouchers(demo);
        } else {
          setVouchers(data as Voucher[]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  const grouped = useMemo(() => {
    const byTab = {
      active: [] as Voucher[],
      used: [] as Voucher[],
      expired: [] as Voucher[],
    };
    for (const v of vouchers) {
      const s = computeStatus(v);
      byTab[s].push(v);
    }
    byTab.active.sort(
      (a, b) => +new Date(a.expiry_date) - +new Date(b.expiry_date)
    );
    byTab.expired.sort(
      (a, b) => +new Date(b.expiry_date) - +new Date(a.expiry_date)
    );
    return byTab;
  }, [vouchers]);

  const list = grouped[activeTab];

  const renderVoucher = ({ item }: { item: Voucher }) => {
    const status = computeStatus(item);
    const left = daysLeft(item.expiry_date);
    const isPercent = item.discount_type === "percent";
    const labelValue = isPercent
      ? `${item.value}%`
      : `-${formatMoney(item.value)}`;

    return (
      <View style={styles.card}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.iconWrap}>
            <Percent color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>
              {isPercent ? "Discount" : "Instant off"} · {labelValue}
            </Text>
          </View>

          {/* Status badge */}
          {status === "active" && (
            <View style={[styles.badge, { backgroundColor: "#dcfce7" }]}>
              <CheckCircle2 color="#16a34a" size={14} />
              <Text style={[styles.badgeText, { color: "#166534" }]}>
                Active
              </Text>
            </View>
          )}
          {status === "used" && (
            <View style={[styles.badge, { backgroundColor: "#e5e7eb" }]}>
              <TicketPercent color="#4b5563" size={14} />
              <Text style={[styles.badgeText, { color: "#374151" }]}>Used</Text>
            </View>
          )}
          {status === "expired" && (
            <View style={[styles.badge, { backgroundColor: "#fee2e2" }]}>
              <XCircle color="#dc2626" size={14} />
              <Text style={[styles.badgeText, { color: "#991b1b" }]}>
                Expired
              </Text>
            </View>
          )}
        </View>

        {/* Body */}
        <View style={{ padding: 12 }}>
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>Code:</Text>
            <Text style={styles.codeBox}>{item.code}</Text>
            <TouchableOpacity
              onPress={() => {
                navigator.clipboard?.writeText(item.code);
              }}
            >
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>

          {item.description && (
            <Text style={styles.desc}>{item.description}</Text>
          )}

          <View style={styles.infoRow}>
            {typeof item.min_order === "number" && item.min_order > 0 && (
              <Text style={styles.infoTag}>
                Min: {formatMoney(item.min_order)}
              </Text>
            )}
            <View
              style={[
                styles.infoTag,
                { flexDirection: "row", alignItems: "center" },
              ]}
            >
              <Clock size={14} color="#6b7280" />
              <Text style={{ fontSize: 12, color: "#6b7280", marginLeft: 4 }}>
                {new Date(item.expiry_date).toLocaleDateString("vi-VN")}
              </Text>
            </View>
            {status === "active" && left >= 0 && (
              <Text
                style={[
                  styles.infoTag,
                  { backgroundColor: "#ffedd5", color: "#9a3412" },
                ]}
              >
                Còn {left} ngày
              </Text>
            )}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, { borderColor: "#e5e7eb" }]}
              onPress={() => onNavigate("home")}
            >
              <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={status !== "active"}
              style={[
                styles.btn,
                status === "active"
                  ? { backgroundColor: "#06b6d4" }
                  : { backgroundColor: "#d1d5db" },
              ]}
              onPress={() =>
                onNavigate("search", {
                  filters: { voucherCode: item.code },
                  title: `Apply ${item.code}`,
                })
              }
            >
              <Text
                style={{
                  fontSize: 13,
                  color: status === "active" ? "#fff" : "#6b7280",
                  fontWeight: "600",
                }}
              >
                Use now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => onNavigate("home")}
        >
          <ChevronLeft color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Vouchers</Text>
        <Text style={styles.headerCount}>{vouchers.length} total</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(["active", "used", "expired"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveTab(t)}
            style={[
              styles.tabBtn,
              activeTab === t && { backgroundColor: "#06b6d4" },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === t && { color: "#fff", fontWeight: "700" },
              ]}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator color="#06b6d4" style={{ marginTop: 40 }} />
      ) : list.length === 0 ? (
        <Text style={styles.emptyText}>Không có voucher trong mục này.</Text>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderVoucher}
          contentContainerStyle={{ padding: 12, gap: 10 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: { padding: 6, marginRight: 6 },
  headerTitle: { fontSize: 16, fontWeight: "700", flex: 1 },
  headerCount: { color: "#6b7280", fontSize: 13 },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  tabText: { color: "#374151", fontSize: 13 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  banner: {
    backgroundColor: "#06b6d4",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#fff", fontWeight: "700", fontSize: 15 },
  subtitle: { color: "#e0f2fe", fontSize: 12 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11 },
  codeRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  codeLabel: { fontSize: 12, color: "#6b7280" },
  codeBox: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: "600",
    marginLeft: 6,
  },
  copyText: { color: "#06b6d4", fontSize: 12, marginLeft: "auto" },
  desc: { color: "#6b7280", fontSize: 13, marginVertical: 4 },
  infoRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  infoTag: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 12,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  },
  btn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 30,
    fontSize: 13,
  },
});
