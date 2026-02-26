import { TestContext, startTestServer, stopTestServer, resetDatabase } from '../src/test-helpers';

describe('getOne', () => {
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

  it('retrieves a post by id with correct fields', async () => {
    const created = await ctx.dataProvider.create('posts', {
      data: { title: 'My Post', body: 'Content', isPublished: true },
    });

    const result = await ctx.dataProvider.getOne('posts', { id: created.data.id });
    expect(result.data.id).toBe(created.data.id);
    expect(result.data.title).toBe('My Post');
    expect(result.data.body).toBe('Content');
    expect(result.data.isPublished).toBe(true);
  });

  it('retrieves a comment with postId', async () => {
    const post = await ctx.dataProvider.create('posts', {
      data: { title: 'Post', body: 'Body' },
    });
    const comment = await ctx.dataProvider.create('comments', {
      data: { postId: post.data.id, body: 'A comment', author: 'Bob' },
    });

    const result = await ctx.dataProvider.getOne('comments', { id: comment.data.id });
    expect(result.data.postId).toBe(post.data.id);
    expect(result.data.author).toBe('Bob');
  });

  it('returns full entity including createdAt', async () => {
    const created = await ctx.dataProvider.create('posts', {
      data: { title: 'Timed', body: 'Body' },
    });

    const result = await ctx.dataProvider.getOne('posts', { id: created.data.id });
    expect(result.data.createdAt).toBeDefined();
    expect(typeof result.data.createdAt).toBe('string');
  });

  it('rejects with error for non-existent id', async () => {
    await expect(
      ctx.dataProvider.getOne('posts', { id: 99999 }),
    ).rejects.toThrow();
  });
});
