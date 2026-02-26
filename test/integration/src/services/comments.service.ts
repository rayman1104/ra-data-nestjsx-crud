import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentsService extends TypeOrmCrudService<Comment> {
  constructor(@InjectRepository(Comment) repo: Repository<Comment>) {
    super(repo);
  }
}
