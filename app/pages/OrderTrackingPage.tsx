import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { CheckCircle, Phone, MessageSquare, Clock } from "lucide-react-native";

interface OrderTrackingPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function OrderTrackingPage({
  onNavigate,
}: OrderTrackingPageProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          const newProgress = prev + 1;
          setCurrentStep(Math.floor(newProgress / 20));
          return newProgress;
        }
        return 100;
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { name: "Order\nConfirmed", icon: "✓", completed: progress > 0 },
    { name: "Looking for\nDriver", icon: "🔍", completed: progress > 20 },
    { name: "Preparing\nFood", icon: "👨‍🍳", completed: progress > 40 },
    { name: "On the\nWay", icon: "🚗", completed: progress > 60 },
    { name: "Arriving\nSoon", icon: "📍", completed: progress > 80 },
  ];

  const driver = {
    name: "John Cooper",
    rating: 4.8,
    reviews: 342,
    vehicle: "Honda Civic - ABC 1234",
    phone: "+1 (555) 123-4567",
    avatar: "J",
  };

  const getStatusMessage = () => {
    if (progress < 20) return "Looking for driver...";
    if (progress < 40) return "Restaurant is preparing your food";
    if (progress < 60) return "Driver is on the way";
    if (progress < 80) return "Driver is arriving soon";
    return "Order delivered!";
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Status</Text>
        <Text style={styles.orderId}>Order #12345</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
          alignItems: "center",
        }}
      >
        {/* Status Icon */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <View style={styles.statusIcon}>
            <CheckCircle size={40} color="#fff" />
          </View>
          <Text style={styles.statusText}>Order confirmed</Text>
        </View>

        {/* Status Message */}
        <Text style={styles.mainMessage}>{getStatusMessage()}</Text>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          <View style={styles.stepsRow}>
            {steps.map((step, idx) => (
              <View key={idx} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    step.completed && styles.stepCircleDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepIcon,
                      step.completed && styles.stepIconDone,
                    ]}
                  >
                    {step.icon}
                  </Text>
                </View>
                <Text style={styles.stepLabel}>{step.name}</Text>
              </View>
            ))}
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Estimated Delivery */}
        {progress < 100 && (
          <View style={styles.estimateBox}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Clock size={20} color="#06b6d4" />
              <Text style={styles.estimateTitle}>Estimated Delivery</Text>
            </View>
            <Text style={styles.estimateText}>Arrives in 15-20 minutes</Text>
          </View>
        )}

        {/* Driver Info */}
        {progress > 20 && (
          <View style={styles.driverCard}>
            <Text style={styles.driverTitle}>Your Driver</Text>
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.avatarText}>{driver.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.driverRating}>
                  ⭐ {driver.rating} ({driver.reviews} reviews)
                </Text>
              </View>
            </View>
            <Text style={styles.vehicleText}>{driver.vehicle}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.callButton}>
                <Phone size={16} color="#0891b2" />
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => onNavigate("chat")}
              >
                <MessageSquare size={16} color="#fff" />
                <Text style={styles.chatText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Footer Buttons */}
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpText}>Need help?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate("home")}
        >
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#06b6d4",
    paddingVertical: 16,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  orderId: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 4,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280",
  },
  mainMessage: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  stepsContainer: { width: "100%", marginBottom: 20 },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  stepItem: { alignItems: "center", flex: 1 },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  stepCircleDone: { backgroundColor: "#06b6d4" },
  stepIcon: { color: "#9ca3af", fontSize: 18 },
  stepIconDone: { color: "#fff" },
  stepLabel: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
  },
  progressBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#06b6d4",
  },
  estimateBox: {
    backgroundColor: "#cffafe",
    borderRadius: 10,
    padding: 12,
    width: "100%",
    marginBottom: 20,
  },
  estimateTitle: { fontWeight: "700", color: "#155e75" },
  estimateText: { color: "#64748b", fontSize: 13, marginLeft: 28 },
  driverCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    width: "100%",
    marginBottom: 20,
  },
  driverTitle: { fontWeight: "700", fontSize: 15, marginBottom: 10 },
  driverRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  driverName: { fontWeight: "700", fontSize: 15 },
  driverRating: { color: "#6b7280", fontSize: 12 },
  vehicleText: { fontSize: 12, color: "#6b7280", marginBottom: 8 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0f2fe",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  callText: { color: "#0369a1", fontWeight: "600" },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#06b6d4",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  chatText: { color: "#fff", fontWeight: "600" },
  helpButton: {
    borderWidth: 2,
    borderColor: "#06b6d4",
    borderRadius: 10,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  helpText: { color: "#06b6d4", fontWeight: "700" },
  backButton: {
    borderRadius: 10,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  backText: { color: "#6b7280", fontWeight: "700" },
});
