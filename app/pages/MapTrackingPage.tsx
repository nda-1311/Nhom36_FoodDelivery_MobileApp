import {
  Clock,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MapTrackingPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function MapTrackingPage({ onNavigate }: MapTrackingPageProps) {
  const [driverPosition, setDriverPosition] = useState({ x: 45, y: 35 });
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    const timer = setInterval(() => {
      setDriverPosition((prev) => ({
        x: Math.min(prev.x + Math.random() * 2, 85),
        y: Math.min(prev.y + Math.random() * 2, 75),
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animation]);

  const pulseScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const driver = {
    name: "John Cooper",
    avatar: "J",
    rating: 4.8,
    vehicle: "Honda Civic - ABC 1234",
  };

  const deliveryInfo = {
    time: "15-20 phút",
    address: "201 Katlian No.21 Street",
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Theo dõi giao hàng</Text>
      </View>

      {/* Map Simulation */}
      <View style={styles.map}>
        <View style={styles.grid} />
        {/* Fake streets */}
        <View
          style={[
            styles.street,
            { top: "30%", transform: [{ rotate: "3deg" }] },
          ]}
        />
        <View style={[styles.street, { left: "20%" }]} />
        <View style={[styles.street, { left: "45%" }]} />
        <View style={[styles.street, { left: "70%" }]} />

        {/* Delivery Route */}
        <View
          style={[
            styles.route,
            {
              top: `${driverPosition.y}%`,
              left: `${driverPosition.x}%`,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.driverMarker,
              {
                transform: [{ scale: pulseScale }],
              },
            ]}
          />
        </View>

        {/* Destination Pin */}
        <View style={[styles.pin, { bottom: 40, right: 40 }]}>
          <MapPin size={18} color="#06b6d4" />
        </View>

        {/* Overlay button */}
        <View style={styles.overlayButtons}>
          <TouchableOpacity style={styles.navButton}>
            <Navigation size={18} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Delivery Info */}
      <View style={styles.section}>
        <View style={{ marginBottom: 16 }}>
          <View style={styles.infoRow}>
            <Clock size={20} color="#06b6d4" />
            <View>
              <Text style={styles.label}>Thời gian giao hàng</Text>
              <Text style={styles.infoText}>{deliveryInfo.time}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={20} color="#06b6d4" />
            <View>
              <Text style={styles.label}>Địa chỉ giao hàng</Text>
              <Text style={styles.infoText}>{deliveryInfo.address}</Text>
            </View>
          </View>
        </View>

        {/* Driver Card */}
        <View style={styles.driverCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{driver.avatar}</Text>
            </View>
            <View>
              <Text style={styles.driverName}>{driver.name}</Text>
              <Text style={styles.driverSub}>Giao hàng</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => onNavigate("call")}
              style={styles.callBtn}
            >
              <Phone size={18} color="#06b6d4" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onNavigate("chat")}
              style={styles.chatBtn}
            >
              <MessageSquare size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.helpBtn}>
          <Text style={styles.helpText}>Cần trợ giúp?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onNavigate("home")}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#06b6d4",
    paddingVertical: 14,
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontWeight: "700", fontSize: 18 },
  map: {
    height: 260,
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
    position: "relative",
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    borderColor: "#e5e7eb",
    borderWidth: 0.5,
  },
  street: {
    position: "absolute",
    width: 2,
    height: "100%",
    backgroundColor: "#d1d5db",
  },
  route: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  driverMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#06b6d4",
  },
  pin: {
    position: "absolute",
    backgroundColor: "#e0f2fe",
    borderRadius: 16,
    padding: 4,
  },
  overlayButtons: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  navButton: {
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  section: { padding: 16 },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  label: { fontSize: 12, color: "#6b7280" },
  infoText: { fontSize: 16, fontWeight: "700" },
  driverCard: {
    backgroundColor: "#ecfeff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  driverName: { fontWeight: "700", fontSize: 15 },
  driverSub: { fontSize: 12, color: "#6b7280" },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { padding: 16, gap: 10 },
  helpBtn: {
    borderWidth: 2,
    borderColor: "#06b6d4",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  helpText: { color: "#06b6d4", fontWeight: "700" },
  backBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  backText: { color: "#6b7280", fontWeight: "700" },
});
