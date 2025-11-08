import { ChevronLeft, Clock, Gift, Users } from "lucide-react-native";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface JoinPartyPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function JoinPartyPage({ onNavigate }: JoinPartyPageProps) {
  const partyDeals = [
    {
      id: 1,
      title: "Pizza Party",
      description: "Get 50% off when you order with 3+ friends",
      discount: "50%",
      minPeople: 3,
      image: require("@/assets/public/pizza-party.jpg"),
      timeLeft: "2 hours",
    },
    {
      id: 2,
      title: "Burger Bash",
      description: "Buy 2 get 1 free on all burgers",
      discount: "33%",
      minPeople: 2,
      image: require("@/assets/public/burger-party.jpg"),
      timeLeft: "4 hours",
    },
    {
      id: 3,
      title: "Sushi Night",
      description: "Group discount: 40% off for groups of 4+",
      discount: "40%",
      minPeople: 4,
      image: require("@/assets/public/sushi-party.jpg"),
      timeLeft: "6 hours",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate("home")}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Join Party Deals</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <View style={styles.heroBox}>
            <View style={styles.heroOverlay} />
            <View style={{ zIndex: 10 }}>
              <Text style={styles.heroTitle}>Party Deals</Text>
              <Text style={styles.heroDesc}>
                Order together with friends and save big!
              </Text>
              <View style={styles.heroRow}>
                <Users size={16} color="#fff" />
                <Text style={styles.heroSubText}>
                  Invite friends to unlock exclusive discounts
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {[
            {
              step: 1,
              title: "Choose a Party Deal",
              desc: "Select from available group offers",
            },
            {
              step: 2,
              title: "Invite Your Friends",
              desc: "Share the party code with friends",
            },
            {
              step: 3,
              title: "Order Together",
              desc: "Combine orders and enjoy the discount",
            },
          ].map((item) => (
            <View key={item.step} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{item.step}</Text>
              </View>
              <View>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Active Deals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Party Deals</Text>
          {partyDeals.map((deal) => (
            <View key={deal.id} style={styles.dealCard}>
              <Image
                source={deal.image}
                style={styles.dealImage}
                resizeMode="cover"
              />
              <View style={styles.dealBody}>
                <View style={styles.dealHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dealTitle}>{deal.title}</Text>
                    <Text style={styles.dealDesc}>{deal.description}</Text>
                  </View>
                  <View style={styles.discountTag}>
                    <Text style={styles.discountText}>{deal.discount} OFF</Text>
                  </View>
                </View>
                <View style={styles.dealInfoRow}>
                  <View style={styles.dealInfoItem}>
                    <Users size={14} color="#6b7280" />
                    <Text style={styles.dealInfoText}>
                      Min {deal.minPeople} people
                    </Text>
                  </View>
                  <View style={styles.dealInfoItem}>
                    <Clock size={14} color="#6b7280" />
                    <Text style={styles.dealInfoText}>
                      {deal.timeLeft} left
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Join This Party</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Your Active Parties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Active Parties</Text>
          <View style={styles.yourPartyBox}>
            <View style={styles.yourPartyHeader}>
              <Gift size={20} color="#06b6d4" />
              <View>
                <Text style={styles.partyName}>Pizza Party #2024</Text>
                <Text style={styles.partyDesc}>
                  2 friends joined • 1 more needed
                </Text>
              </View>
            </View>

            <View style={styles.avatarRow}>
              <View style={[styles.avatar, styles.avatarPrimary]}>
                <Text style={styles.avatarText}>You</Text>
              </View>
              <View style={[styles.avatar, { backgroundColor: "#60a5fa" }]}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
              <View style={[styles.avatar, { backgroundColor: "#38bdf8" }]}>
                <Text style={styles.avatarText}>+1</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Party Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0891b2",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },

  heroContainer: { padding: 16 },
  heroBox: {
    backgroundColor: "#06b6d4",
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
    position: "relative",
  },
  heroOverlay: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  heroDesc: { color: "#e0f2fe", fontSize: 14, marginBottom: 8 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroSubText: { color: "#e0f2fe", fontSize: 13 },

  section: { paddingHorizontal: 16, paddingVertical: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfeff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: { color: "#fff", fontWeight: "700" },
  stepTitle: { fontSize: 14, fontWeight: "600" },
  stepDesc: { fontSize: 12, color: "#6b7280" },

  dealCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  dealImage: { width: "100%", height: 160 },
  dealBody: { padding: 12 },
  dealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  dealTitle: { fontSize: 16, fontWeight: "700" },
  dealDesc: { fontSize: 13, color: "#6b7280" },
  discountTag: {
    backgroundColor: "#ffedd5",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: { color: "#c2410c", fontWeight: "700", fontSize: 13 },
  dealInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 6,
    marginBottom: 8,
  },
  dealInfoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  dealInfoText: { color: "#6b7280", fontSize: 12 },
  joinButton: {
    backgroundColor: "#06b6d4",
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
  },

  yourPartyBox: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
    padding: 16,
  },
  yourPartyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  partyName: { fontSize: 14, fontWeight: "600" },
  partyDesc: { fontSize: 12, color: "#6b7280" },
  avatarRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPrimary: { backgroundColor: "#06b6d4" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  viewButton: {
    backgroundColor: "#06b6d4",
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
  },
});
