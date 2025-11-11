import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  CheckCircle,
  ChefHat,
  Clock,
  HelpCircle,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Truck,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, RADIUS, SHADOWS } from "../../constants/design";

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
    {
      name: "Order\nConfirmed",
      icon: Package,
      color: COLORS.primary,
      completed: progress > 0,
    },
    {
      name: "Preparing\nFood",
      icon: ChefHat,
      color: COLORS.accent,
      completed: progress > 25,
    },
    {
      name: "On the\nWay",
      icon: Truck,
      color: COLORS.secondary,
      completed: progress > 50,
    },
    {
      name: "Arriving\nSoon",
      icon: MapPin,
      color: "#8b5cf6",
      completed: progress > 75,
    },
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
    if (progress < 25) return "Order confirmed! Preparing your food...";
    if (progress < 50) return "Restaurant is preparing your food";
    if (progress < 75) return "Driver is on the way to deliver";
    if (progress < 100) return "Driver is arriving soon!";
    return "Order delivered successfully!";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate("home")}
        >
          <ArrowLeft size={22} color="#ffffff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.orderId}>Order #12345</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusIcon}
          >
            <CheckCircle size={40} color="#ffffff" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={styles.statusTitle}>{getStatusMessage()}</Text>
          <Text style={styles.statusSubtitle}>
            We&apos;ll notify you when status changes
          </Text>
        </View>

        {/* Timeline Steps */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Order Progress</Text>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = step.completed;
            const isLast = idx === steps.length - 1;

            return (
              <View key={idx}>
                <View style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineIconCircle,
                        isCompleted && { backgroundColor: step.color },
                        !isCompleted && styles.timelineIconInactive,
                      ]}
                    >
                      <Icon
                        size={20}
                        color={isCompleted ? "#ffffff" : COLORS.textLight}
                        strokeWidth={2}
                      />
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.timelineLine,
                          isCompleted && { backgroundColor: step.color },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        isCompleted && styles.timelineLabelActive,
                      ]}
                    >
                      {step.name.replace("\n", " ")}
                    </Text>
                    {isCompleted && idx === currentStep && (
                      <Text style={styles.timelineTime}>Just now</Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progress}%` }]}
            />
          </View>
        </View>

        {/* Estimated Delivery */}
        {progress < 100 && (
          <View style={styles.estimateCard}>
            <View style={styles.estimateIconCircle}>
              <Clock size={20} color={COLORS.primary} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.estimateTitle}>Estimated Delivery Time</Text>
              <Text style={styles.estimateTime}>Arrives in 15-20 minutes</Text>
            </View>
          </View>
        )}

        {/* Driver Info */}
        {progress > 25 && (
          <View style={styles.driverCard}>
            <Text style={styles.sectionTitle}>Your Driver</Text>

            <View style={styles.driverRow}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.driverAvatar}
              >
                <Text style={styles.avatarText}>{driver.avatar}</Text>
              </LinearGradient>

              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.driverRating}>
                  ⭐ {driver.rating} • {driver.reviews} reviews
                </Text>
                <Text style={styles.vehicleText}>{driver.vehicle}</Text>
              </View>
            </View>

            <View style={styles.driverActions}>
              <TouchableOpacity style={styles.callButton}>
                <View style={styles.callIconCircle}>
                  <Phone size={18} color={COLORS.primary} strokeWidth={2.5} />
                </View>
                <Text style={styles.callText}>Call Driver</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => onNavigate("chat")}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.chatGradient}
                >
                  <MessageSquare size={18} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.chatText}>Chat</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Help Button */}
        <TouchableOpacity style={styles.helpButton}>
          <HelpCircle size={20} color={COLORS.primary} strokeWidth={2.5} />
          <Text style={styles.helpText}>Need Help?</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  orderId: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 4,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // Status Card
  statusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...SHADOWS.small,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
  },
  statusSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  // Timeline
  timelineCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
  },
  timelineRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 16,
  },
  timelineIconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.small,
  },
  timelineIconInactive: {
    backgroundColor: COLORS.border,
  },
  timelineLine: {
    width: 3,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  timelineLabelActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  timelineTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  // Progress Card
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  progressBarContainer: {
    width: "100%",
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: RADIUS.full,
  },

  // Estimate Card
  estimateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  estimateIconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  estimateTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  estimateTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Driver Card
  driverCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    ...SHADOWS.small,
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 24,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  driverRating: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  vehicleText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  driverActions: {
    flexDirection: "row",
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${COLORS.primary}15`,
    paddingVertical: 12,
    borderRadius: RADIUS.m,
    gap: 8,
  },
  callIconCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  callText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
  chatButton: {
    flex: 1,
    borderRadius: RADIUS.m,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  chatGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  chatText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Help Button
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: RADIUS.l,
    gap: 8,
    ...SHADOWS.small,
  },
  helpText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
