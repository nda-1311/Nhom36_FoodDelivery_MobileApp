const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUser() {
  try {
    const email = '1dap2xoe@gmail.com';
    const password = '123456'; // Thay đổi mật khẩu tùy ý
    const fullName = 'Admin User';

    console.log('🔐 Đang tạo tài khoản mới...\n');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });

    console.log('✅ Tạo tài khoản thành công!\n');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Mật khẩu: ${password}`);
    console.log(`👤 Tên: ${fullName}`);
    console.log(`🎭 Role: ${user.role}`);
    console.log(`\n💡 Bạn có thể đăng nhập với thông tin trên!`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Email này đã tồn tại!');
    } else {
      console.error('❌ Lỗi khi tạo tài khoản:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
