const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Kiểm tra tài khoản trong database...\n');

    // Lấy tất cả users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      console.log('❌ Không tìm thấy tài khoản nào trong database!');
      console.log('📝 Database có vẻ trống hoặc chưa có dữ liệu.\n');
    } else {
      console.log(`✅ Tìm thấy ${users.length} tài khoản:\n`);
      users.forEach((user, index) => {
        console.log(`--- Tài khoản ${index + 1} ---`);
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Tên: ${user.fullName}`);
        console.log(`Role: ${user.role}`);
        console.log(`Status: ${user.status}`);
        console.log(`Email Verified: ${user.emailVerified}`);
        console.log(`Ngày tạo: ${user.createdAt}`);
        console.log('');
      });
    }

    // Kiểm tra email cụ thể nếu có
    const testEmail = '1dap2xoe@gmail.com'; // Email trong ảnh của bạn
    const specificUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (specificUser) {
      console.log(`✅ Tìm thấy tài khoản với email ${testEmail}`);
      console.log(`Status: ${specificUser.status}`);
      console.log(`Email Verified: ${specificUser.emailVerified}`);
    } else {
      console.log(`❌ Không tìm thấy tài khoản với email ${testEmail}`);
    }
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra database:', error.message);
    console.error('\nChi tiết lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
