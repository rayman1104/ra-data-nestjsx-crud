import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`NestJS CRUD backend running at http://localhost:${port}`);
  console.log(`  Posts:    http://localhost:${port}/posts`);
  console.log(`  Comments: http://localhost:${port}/comments`);
}

bootstrap();
