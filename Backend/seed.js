require('dotenv').config();
const mongoose = require('mongoose');
const DocumentLevel = require('./models/DocumentLevel'); // Xuất trực tiếp model
const { User } = require('./models/User');
const { Role } = require('./models/Role');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => seedData())
  .catch((err) => {
    console.error('Connection error:', err);
    process.exit(1);
  });

async function seedData() {
  try {
    // Xoá dữ liệu cũ nếu cần
    await DocumentLevel.deleteMany({});
    await Role.deleteMany({});
    await User.deleteMany({});

    // Seed DocumentLevels
    const documentLevels = [
      { name: 'public', level: 1 },
      { name: 'teacher only', level: 2 },
      { name: 'private', level: 3 },
    ];
    await DocumentLevel.insertMany(documentLevels);
    console.log('DocumentLevels seeded');

    // Seed Roles
    const roles = [
      { name: 'Sinh viên', role: 'student' },
      { name: 'Giảng viên', role: 'teacher' },
      { name: 'Admin', role: 'admin' },
    ];
    const insertedRoles = await Role.insertMany(roles);
    console.log('Roles seeded');

    // Tạo tài khoản admin với password "admin123"
    const adminRole = insertedRoles.find((r) => r.role === 'admin');

    const adminUser = new User({
      nickname: 'Admin',
      username: 'admin',
      password: 'admin123',
      role: adminRole._id,
    });

    await adminUser.save();
    console.log('Admin user seeded');

    process.exit();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}