const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAdminRole() {
  try {
    console.log('🔧 Đang cập nhật quyền admin...\n');

    // Update admin@gmail.com to ADMIN role
    const updatedUser = await prisma.user.update({
      where: {
        email: 'admin@gmail.com',
      },
      data: {
        role: 'ADMIN',
      },
    });

    console.log('✅ Cập nhật quyền admin thành công!');
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`🎭 Role: ${updatedUser.role}`);
    console.log(`👤 Tên: ${updatedUser.fullName}`);
    console.log(`📅 Cập nhật lúc: ${updatedUser.updatedAt}`);

    console.log('\n📊 Danh sách tất cả admin:');
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      },
    });

    admins.forEach((admin, index) => {
      console.log(`\n--- Admin ${index + 1} ---`);
      console.log(`Email: ${admin.email}`);
      console.log(`Tên: ${admin.fullName}`);
      console.log(`Status: ${admin.status}`);
    });
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.code === 'P2025') {
      console.error('❌ Không tìm thấy user với email admin@gmail.com');
    }
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminRole();
