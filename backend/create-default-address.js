const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDefaultAddress() {
  try {
    console.log('🏠 Tạo địa chỉ mặc định cho user...\n');

    // Lấy user đầu tiên
    const user = await prisma.user.findFirst();

    if (!user) {
      console.error('❌ Không tìm thấy user nào!');
      return;
    }

    console.log(`👤 User: ${user.email}\n`);

    // Kiểm tra xem đã có address chưa
    const existingAddress = await prisma.address.findFirst({
      where: { userId: user.id },
    });

    if (existingAddress) {
      console.log('✅ User đã có address:');
      console.log(`   ID: ${existingAddress.id}`);
      console.log(`   Label: ${existingAddress.label}`);
      console.log(`   Address: ${existingAddress.address}`);
      console.log(`   Type: ${existingAddress.type}`);
      return;
    }

    // Tạo address mặc định
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: 'Nhà riêng',
        fullAddress: '123 Đường Chính, Quận 1, TP.HCM',
        latitude: 10.7769,
        longitude: 106.7009,
        type: 'HOME',
        isDefault: true,
      },
    });

    console.log('✅ Đã tạo địa chỉ mặc định!');
    console.log('═══════════════════════════════════');
    console.log(`📍 ID: ${address.id}`);
    console.log(`🏷️  Label: ${address.label}`);
    console.log(`📫 Address: ${address.address}`);
    console.log(`🏠 Type: ${address.type}`);
    console.log(`✓  Default: ${address.isDefault}`);
    console.log('═══════════════════════════════════');
    console.log(`\n💡 Sử dụng addressId này khi đặt hàng: ${address.id}`);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultAddress();
