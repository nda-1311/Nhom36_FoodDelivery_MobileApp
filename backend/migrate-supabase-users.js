/**
 * Script to create a user account with a specific email
 * This is useful for migrating users from Supabase Auth to Prisma DB
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUserAccount() {
  try {
    // User details from Supabase Auth
    const users = [
      {
        email: '1dap2xoe@gmail.com',
        fullName: 'Duc Anh',
        password: '123456', // Default password - user nên đổi sau
      },
      {
        email: 'admin@gmail.com',
        fullName: 'Admin',
        password: 'admin123',
      },
      {
        email: 'chaobuoilangnda@gmail.com',
        fullName: 'Đức Huy',
        password: '123456',
      },
    ];

    console.log('🔐 Đang tạo tài khoản...\n');

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`⚠️  Email ${userData.email} đã tồn tại. Bỏ qua.\n`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          fullName: userData.fullName,
          role: 'CUSTOMER',
          status: 'ACTIVE',
          emailVerified: true, // Mark as verified since they existed in Supabase
        },
      });

      console.log('✅ Tạo tài khoản thành công!');
      console.log(`📧 Email: ${userData.email}`);
      console.log(`🔑 Mật khẩu tạm thời: ${userData.password}`);
      console.log(`👤 Tên: ${userData.fullName}`);
      console.log(`🎭 Role: ${user.role}`);
      console.log(`\n💡 User nên đổi mật khẩu sau khi đăng nhập!\n`);
    }

    console.log('\n📊 Danh sách tất cả users hiện có:');
    const allUsers = await prisma.user.findMany({
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

    allUsers.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log(`Email: ${user.email}`);
      console.log(`Tên: ${user.fullName}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${user.status}`);
    });
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUserAccount();
