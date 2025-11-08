import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { ChevronLeft, Clock, DollarSign } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

interface HistoryPageProps {
  onNavigate: (page: string) => void;
}

export default function HistoryPage({ onNavigate }: HistoryPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.textMuted}>Đang tải lịch sử đơn hàng...</Text>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.textEmpty}>🕒 Chưa có đơn hàng nào.</Text>
        <TouchableOpacity
          onPress={() => onNavigate("home")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Đặt món ngay</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("home")}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📜 Lịch sử đơn hàng</Text>
      </View>

      {/* Danh sách đơn hàng */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderCode}>Mã đơn: {order.order_number}</Text>
              <View style={styles.row}>
                <Clock size={14} color="#6b7280" />
                <Text style={styles.timeText}>
                  {new Date(order.created_at).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.statusLabel}>
                Trạng thái:{" "}
                <Text
                  style={[
                    styles.statusValue,
                    order.status === "Delivered"
                      ? styles.statusDelivered
                      : order.status === "Pending"
                      ? styles.statusPending
                      : styles.statusCancelled,
                  ]}
                >
                  {order.status}
                </Text>
              </Text>
            </View>

            <View style={styles.totalBox}>
              <DollarSign size={16} color="#f97316" />
              <Text style={styles.totalText}>
                {order.total.toLocaleString()}₫
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  textMuted: { color: "#6b7280", marginTop: 8 },
  textEmpty: { color: "#9ca3af", fontSize: 16 },
  primaryButton: {
    marginTop: 16,
    backgroundColor: "#f97316",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },

  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderCode: { fontWeight: "600", color: "#111827" },
  row: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  timeText: { color: "#6b7280", fontSize: 12 },
  statusLabel: { color: "#374151", fontSize: 13, marginTop: 4 },
  statusValue: { fontWeight: "700" },
  statusDelivered: { color: "#16a34a" },
  statusPending: { color: "#eab308" },
  statusCancelled: { color: "#ef4444" },
  totalBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  totalText: { color: "#f97316", fontWeight: "700", fontSize: 15 },
});
