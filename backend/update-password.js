const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    const email = 'admin@gmail.com';
    const newPassword = 'admin123';

    console.log('🔐 Đang cập nhật mật khẩu...\n');

    // Kiểm tra user có tồn tại không
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Không tìm thấy tài khoản với email: ${email}`);
      return;
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Cập nhật mật khẩu thành công!\n');
    console.log('═══════════════════════════════════');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Mật khẩu mới: ${newPassword}`);
    console.log(`👤 Tên: ${user.fullName}`);
    console.log(`👑 Role: ${user.role}`);
    console.log('═══════════════════════════════════');
    console.log(`\n💡 Bạn có thể đăng nhập với mật khẩu mới!`);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật mật khẩu:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
