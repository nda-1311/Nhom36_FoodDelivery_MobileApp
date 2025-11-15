const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAddressForAllUsers() {
  try {
    console.log('🏠 Tạo địa chỉ mặc định cho tất cả users...\n');

    const users = await prisma.user.findMany();

    if (users.length === 0) {
      console.error('❌ Không tìm thấy user nào!');
      return;
    }

    console.log(`👥 Tìm thấy ${users.length} users\n`);

    for (const user of users) {
      console.log(`\n📧 User: ${user.email} (${user.id})`);

      // Kiểm tra xem đã có address chưa
      const existingAddress = await prisma.address.findFirst({
        where: { userId: user.id },
      });

      if (existingAddress) {
        console.log(`   ✅ Đã có address: ${existingAddress.id}`);
        continue;
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

      console.log(`   ✅ Đã tạo address: ${address.id}`);
    }

    console.log('\n═══════════════════════════════════');
    console.log('🎉 Hoàn thành!');
    console.log('\n📋 Danh sách địa chỉ:\n');

    const allAddresses = await prisma.address.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    allAddresses.forEach((addr, index) => {
      console.log(`${index + 1}. User: ${addr.user.email}`);
      console.log(`   Address ID: ${addr.id}`);
      console.log(`   Label: ${addr.label}`);
      console.log(`   Full Address: ${addr.fullAddress}\n`);
    });
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAddressForAllUsers();
