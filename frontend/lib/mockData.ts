/**
 * Mock Data for fallback when API fails
 */

export const MOCK_RESTAURANTS = [
  {
    id: "1",
    name: "Nhà Hàng Phố Cổ",
    address: "123 Hoàn Kiếm, Hà Nội",
    phoneNumber: "024-1234-5678",
    rating: 4.5,
    totalReviews: 120,
    isOpen: true,
    deliveryFee: 15000,
    minOrderAmount: 50000,
    preparationTime: 30,
    logo: "https://via.placeholder.com/150",
    coverImage: "https://via.placeholder.com/400x200",
    openingHours: {},
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Quán Ăn Sài Gòn",
    address: "456 Nguyễn Huệ, TP.HCM",
    phoneNumber: "028-9876-5432",
    rating: 4.8,
    totalReviews: 250,
    isOpen: true,
    deliveryFee: 20000,
    minOrderAmount: 100000,
    preparationTime: 25,
    logo: "https://via.placeholder.com/150",
    coverImage: "https://via.placeholder.com/400x200",
    openingHours: {},
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
