import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from '../auth/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { EmailService } from '../../common/services/email.service';
import { AutoUnbanTask } from '../../common/tasks/auto-unban.task';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, EmailService, AutoUnbanTask],
  exports: [UsersService],
})
export class UsersModule implements OnModuleInit {
  constructor(private readonly autoUnbanTask: AutoUnbanTask) {}

  onModuleInit() {
    // Start the auto-unban scheduler when module initializes
    this.autoUnbanTask.startAutoUnbanScheduler();
  }
}
