import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Comment } from '../entities/comment.entity';
import { CommentsService } from '../services/comments.service';

@Crud({
  model: { type: Comment },
  query: { alwaysPaginate: true },
})
@Controller('comments')
export class CommentsController {
  constructor(public service: CommentsService) {}
}
