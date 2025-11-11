import { CheckCircle, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface OrderTrackingPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function OrderTrackingPage({
  onNavigate,
}: OrderTrackingPageProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Auto-progress through steps (faster: 1.5 seconds per step)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 4) {
          return prev + 1;
        } else {
          // When complete, navigate to map tracking
          clearInterval(timer);
          setTimeout(() => {
            onNavigate('map-tracking');
          }, 1000);
          return prev;
        }
      });
    }, 1500); // Change step every 1.5 seconds (faster)

    return () => clearInterval(timer);
  }, [onNavigate]);

  const steps = [
    { name: 'Xác nhận\nđơn hàng', completed: currentStep >= 0 },
    { name: 'Tìm\ntài xế', completed: currentStep >= 1 },
    { name: 'Chuẩn bị\nmón ăn', completed: currentStep >= 2 },
    { name: 'Đang\ngiao', completed: currentStep >= 3 },
    { name: 'Sắp\nđến', completed: currentStep >= 4 },
  ];

  const getStatusTitle = () => {
    switch (currentStep) {
      case 0: return 'Đơn hàng đã được xác nhận';
      case 1: return 'Đang tìm tài xế';
      case 2: return 'Đang chuẩn bị món ăn';
      case 3: return 'Tài xế đang trên đường';
      case 4: return 'Sắp đến nơi';
      default: return 'Đơn hàng đã xác nhận';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusIcon}>
          <CheckCircle size={60} color='#06B6D4' strokeWidth={2} />
        </View>

        <Text style={styles.statusTitle}>Đơn hàng đã xác nhận</Text>
        <Text style={styles.mainTitle}>{getStatusTitle()}</Text>

        <View style={styles.searchIcon}>
          <Search size={80} color='#06B6D4' strokeWidth={2.5} />
        </View>

        <View style={styles.stepsContainer}>
          {steps.map((step, idx) => (
            <View key={idx} style={styles.stepWrapper}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    step.completed && styles.stepDotActive,
                  ]}
                />
                <Text style={styles.stepText}>{step.name}</Text>
              </View>
              {idx < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    steps[idx + 1].completed && styles.stepLineActive,
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpButtonText}>Cần trợ giúp?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => onNavigate('home')}
        >
          <Text style={styles.cancelButtonText}>✕ Hủy đơn</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 60,
  },
  statusIcon: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
  },
  searchIcon: {
    marginBottom: 40,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  stepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
  stepDotActive: {
    backgroundColor: '#06B6D4',
  },
  stepText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    position: 'absolute',
    left: '50%',
    top: 6,
  },
  stepLineActive: {
    backgroundColor: '#06B6D4',
  },
  helpButton: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#06B6D4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06B6D4',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
  },
});
