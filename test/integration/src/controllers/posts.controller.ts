import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Post } from '../entities/post.entity';
import { PostsService } from '../services/posts.service';

@Crud({
  model: { type: Post },
  query: { alwaysPaginate: true },
})
@Controller('posts')
export class PostsController {
  constructor(public service: PostsService) {}
}
