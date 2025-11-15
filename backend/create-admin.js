const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@gmail.com';
    const password = 'admin123';
    const fullName = 'Admin';

    console.log('👑 Đang tạo tài khoản ADMIN...\n');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });

    console.log('✅ Tạo tài khoản ADMIN thành công!\n');
    console.log('═══════════════════════════════════');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Mật khẩu: ${password}`);
    console.log(`👤 Tên: ${fullName}`);
    console.log(`👑 Role: ${admin.role}`);
    console.log(`✓  Status: ${admin.status}`);
    console.log(`✓  Email Verified: ${admin.emailVerified}`);
    console.log('═══════════════════════════════════');
    console.log(
      `\n💡 Bạn có thể đăng nhập vào admin panel với thông tin trên!`
    );
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Email này đã tồn tại!');
      console.log(
        '\n💡 Nếu muốn cập nhật role, hãy sử dụng file update-admin-role.js'
      );
    } else {
      console.error('❌ Lỗi khi tạo tài khoản:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
