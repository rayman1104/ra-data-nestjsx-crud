import { TestContext, startTestServer, stopTestServer, resetDatabase } from '../src/test-helpers';

describe('update', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await startTestServer();
  });

  afterAll(async () => {
    await stopTestServer(ctx.app);
  });

  beforeEach(async () => {
    await resetDatabase(ctx.dataSource);
  });

  it('updates a post with PATCH (only changed fields via countDiff)', async () => {
    const created = await ctx.dataProvider.create('posts', {
      data: { title: 'Original', body: 'Original body', isPublished: false },
    });

    const fetched = await ctx.dataProvider.getOne('posts', { id: created.data.id });

    const result = await ctx.dataProvider.update('posts', {
      id: created.data.id,
      data: { ...fetched.data, title: 'Updated' },
      previousData: fetched.data,
    });

    expect(result.data.title).toBe('Updated');
  });

  it('preserves unchanged fields', async () => {
    const created = await ctx.dataProvider.create('posts', {
      data: { title: 'Keep', body: 'Keep body', isPublished: true },
    });

    const fetched = await ctx.dataProvider.getOne('posts', { id: created.data.id });

    await ctx.dataProvider.update('posts', {
      id: created.data.id,
      data: { ...fetched.data, title: 'Changed' },
      previousData: fetched.data,
    });

    const after = await ctx.dataProvider.getOne('posts', { id: created.data.id });
    expect(after.data.body).toBe('Keep body');
    expect(after.data.isPublished).toBe(true);
  });

  it('updates a comment', async () => {
    const post = await ctx.dataProvider.create('posts', {
      data: { title: 'Post', body: 'Body' },
    });
    const comment = await ctx.dataProvider.create('comments', {
      data: { postId: post.data.id, body: 'Old comment', author: 'Alice' },
    });

    const fetched = await ctx.dataProvider.getOne('comments', { id: comment.data.id });

    const result = await ctx.dataProvider.update('comments', {
      id: comment.data.id,
      data: { ...fetched.data, body: 'New comment' },
      previousData: fetched.data,
    });

    expect(result.data.body).toBe('New comment');
  });

  it('returns the full updated entity', async () => {
    const created = await ctx.dataProvider.create('posts', {
      data: { title: 'Full', body: 'Full body' },
    });

    const fetched = await ctx.dataProvider.getOne('posts', { id: created.data.id });

    const result = await ctx.dataProvider.update('posts', {
      id: created.data.id,
      data: { ...fetched.data, title: 'Updated Full' },
      previousData: fetched.data,
    });

    expect(result.data.id).toBe(created.data.id);
    expect(result.data.title).toBe('Updated Full');
    expect(result.data.body).toBe('Full body');
    expect(result.data.createdAt).toBeDefined();
  });
});
