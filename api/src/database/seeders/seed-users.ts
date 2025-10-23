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

  const newAdmins = [
    {
      name: 'Nguyen Van A',
      nickName: 'nguyenvana',
      email: 'nguyenvana@chatoverflow.com',
      password: await bcrypt.hash('admin123', 10),
      avatar: 'https://i.pravatar.cc/150?img=5',
      bio: 'Senior System Administrator',
      gender: 'male',
      status: 'active',
      role: 'admin',
      address: {
        province: 'Ho Chi Minh',
        ward: 'District 3',
        street: '789 Nguyen Thi Minh Khai',
      },
    },
    {
      name: 'Tran Thi B',
      nickName: 'tranthib',
      email: 'tranthib@chatoverflow.com',
      password: await bcrypt.hash('admin123', 10),
      avatar: 'https://i.pravatar.cc/150?img=6',
      bio: 'Platform Administrator',
      gender: 'female',
      status: 'active',
      role: 'admin',
      address: {
        province: 'Ha Noi',
        ward: 'Ba Dinh',
        street: '456 Le Duan',
      },
    },
    {
      name: 'Le Van C',
      nickName: 'levanc',
      email: 'levanc@chatoverflow.com',
      password: await bcrypt.hash('admin123', 10),
      avatar: 'https://i.pravatar.cc/150?img=7',
      bio: 'Technical Administrator',
      gender: 'male',
      status: 'active',
      role: 'admin',
      address: {
        province: 'Da Nang',
        ward: 'Hai Chau',
        street: '321 Tran Phu',
      },
    },
  ];

  try {
    let addedCount = 0;
    let skippedCount = 0;

    for (const userData of newAdmins) {
      const existingUser = await userModel.findOne({ email: userData.email });

      if (existingUser) {
        console.log(` Skipped (already exists): ${userData.email}`);
        skippedCount++;
      } else {
        const user = new userModel(userData);
        await user.save();
        console.log(`Created admin: ${userData.email}`);
        addedCount++;
      }
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
