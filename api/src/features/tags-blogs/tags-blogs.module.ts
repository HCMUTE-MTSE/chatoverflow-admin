import { Module } from '@nestjs/common';
import { BlogSchema } from './entities/blogs.entity';
import { TagSchema } from './entities/tags.entity';
import { BlogCommentSchema } from './entities/blog-comments.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './controller/blogs.controller';
import { TagsController } from './controller/tags.controller';
import { BlogsService } from './services/blogs.service';
import { AuthModule } from '../auth/auth.module';
import { BlogCommentsService } from './services/blog-comments.service';
import { TagsService } from './services/tags.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Blog', schema: BlogSchema },
      { name: 'Tag', schema: TagSchema },
      { name: 'BlogComment', schema: BlogCommentSchema },
    ]),
    AuthModule,
  ],
  controllers: [BlogsController, TagsController],
  providers: [BlogsService, BlogCommentsService, TagsService],
  exports: [BlogsService, TagsService],
})
export class TagsBlogsModule {}
