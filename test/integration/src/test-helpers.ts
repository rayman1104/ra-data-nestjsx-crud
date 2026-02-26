import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DataProvider } from 'ra-core';
import crudProvider from 'ra-data-nestjsx-crud';
import { AppModule } from './app.module';

export interface TestContext {
  app: INestApplication;
  dataProvider: DataProvider;
  dataSource: DataSource;
}

export async function startTestServer(): Promise<TestContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.listen(0);

  const url = await app.getUrl();
  // Normalize: replace [::1] or IPv6 with 127.0.0.1
  const normalizedUrl = url.replace(/\[::1\]/, '127.0.0.1');

  const dataProvider = crudProvider(normalizedUrl);
  const dataSource = moduleRef.get(DataSource);

  return { app, dataProvider, dataSource };
}

export async function resetDatabase(dataSource: DataSource): Promise<void> {
  // Delete in order to respect FK constraints
  await dataSource.query('DELETE FROM comments');
  await dataSource.query('DELETE FROM posts');
  // Reset autoincrement counters (sqlite_sequence may not exist yet)
  try {
    await dataSource.query("DELETE FROM sqlite_sequence WHERE name='comments'");
    await dataSource.query("DELETE FROM sqlite_sequence WHERE name='posts'");
  } catch {
    // sqlite_sequence table doesn't exist if no inserts have happened yet
  }
}

export async function stopTestServer(app: INestApplication): Promise<void> {
  await app.close();
}
