import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { PostsController } from './controllers/posts.controller';
import { CommentsController } from './controllers/comments.controller';
import { PostsService } from './services/posts.service';
import { CommentsService } from './services/comments.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      database: new Uint8Array(0),
      entities: [Post, Comment],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Post, Comment]),
  ],
  controllers: [PostsController, CommentsController],
  providers: [PostsService, CommentsService],
})
export class AppModule {}
