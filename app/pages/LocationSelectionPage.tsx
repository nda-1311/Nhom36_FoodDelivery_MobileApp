import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  MapPin,
  Edit2,
  Home,
  Briefcase,
  MoreHorizontal,
} from "lucide-react-native";

interface LocationSelectionPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function LocationSelectionPage({
  onNavigate,
}: LocationSelectionPageProps) {
  const [selectedType, setSelectedType] = useState("home");
  const [address, setAddress] = useState("201 Katlian No.21 Street");
  const [isEditing, setIsEditing] = useState(false);

  const locationTypes = [
    { id: "home", label: "Nhà", icon: Home },
    { id: "work", label: "Công ty", icon: Briefcase },
    { id: "other", label: "Khác", icon: MoreHorizontal },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Chọn địa chỉ</Text>
      </View>

      {/* Map simulation */}
      <View style={styles.map}>
        {/* Fake grid */}
        <View style={styles.grid} />
        <View style={[styles.street, { top: "30%" }]} />
        <View style={[styles.street, { left: "15%" }]} />
        <View style={[styles.street, { left: "40%" }]} />
        <View style={[styles.street, { left: "70%" }]} />

        {/* Center Pin */}
        <View style={styles.pinCenter}>
          <View style={styles.pinOuter}>
            <View style={styles.pinInner} />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Address */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Địa chỉ</Text>
          <View style={styles.inputContainer}>
            <MapPin size={20} color="#06b6d4" />
            {isEditing ? (
              <TextInput
                value={address}
                onChangeText={setAddress}
                style={styles.input}
                autoFocus
              />
            ) : (
              <Text style={styles.addressText}>{address}</Text>
            )}
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Edit2 size={16} color="#06b6d4" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Type */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Loại địa chỉ</Text>
          {locationTypes.map((type) => {
            const Icon = type.icon;
            const selected = selectedType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.option,
                  selected && {
                    borderColor: "#06b6d4",
                    backgroundColor: "rgba(6,182,212,0.05)",
                  },
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Icon size={20} color="#06b6d4" />
                <Text style={styles.optionText}>{type.label}</Text>
                <View
                  style={[
                    styles.radio,
                    selected && { backgroundColor: "#06b6d4" },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          onPress={() =>
            onNavigate("checkout", {
              address,
              type: selectedType,
            })
          }
          style={styles.confirmBtn}
        >
          <Text style={styles.confirmText}>Xác nhận</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#06b6d4",
    paddingVertical: 14,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  map: {
    height: 260,
    backgroundColor: "#f3f4f6",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  street: {
    position: "absolute",
    height: "100%",
    width: 2,
    backgroundColor: "#d1d5db",
  },
  pinCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  pinOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
  },
  pinInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#06b6d4",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    color: "#111827",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  optionText: { flex: 1, fontSize: 14, fontWeight: "500" },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#06b6d4",
  },
  confirmBtn: {
    backgroundColor: "#06b6d4",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
