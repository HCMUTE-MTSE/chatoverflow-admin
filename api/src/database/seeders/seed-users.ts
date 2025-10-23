import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../../features/auth/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));

  console.log('🌱 Starting user seeding...');

  // Sample users
  const users = [
    {
      name: 'Admin User',
      nickName: 'admin',
      email: 'admin@chatoverflow.com',
      password: await bcrypt.hash('admin123', 10),
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'System Administrator',
      gender: 'male',
      status: 'active',
      address: {
        province: 'Ho Chi Minh',
        ward: 'District 1',
        street: '123 Main Street',
      },
    },
    {
      name: 'Test User',
      nickName: 'testuser',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      avatar: 'https://i.pravatar.cc/150?img=2',
      bio: 'Test account for development',
      gender: 'female',
      status: 'active',
      address: {
        province: 'Ha Noi',
        ward: 'Hoan Kiem',
        street: '456 Test Avenue',
      },
    },
    {
      name: 'John Doe',
      nickName: 'johndoe',
      email: 'john@example.com',
      password: await bcrypt.hash('john123', 10),
      avatar: 'https://i.pravatar.cc/150?img=3',
      bio: 'Software Developer',
      gender: 'male',
      status: 'active',
    },
    {
      name: 'Jane Smith',
      nickName: 'janesmith',
      email: 'jane@example.com',
      password: await bcrypt.hash('jane123', 10),
      avatar: 'https://i.pravatar.cc/150?img=4',
      bio: 'Product Manager',
      gender: 'female',
      status: 'inactive',
    },
  ];

  try {
    // Clear existing users
    await userModel.deleteMany({});
    console.log('✅ Cleared existing users');

    // Insert new users
    for (const userData of users) {
      const user = new userModel(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.email}`);
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@chatoverflow.com | Password: admin123');
    console.log('   Email: test@example.com | Password: password123');
    console.log('   Email: john@example.com | Password: john123');
    console.log('   Email: jane@example.com | Password: jane123');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
