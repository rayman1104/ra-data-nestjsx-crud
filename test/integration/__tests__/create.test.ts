import { TestContext, startTestServer, stopTestServer, resetDatabase } from '../src/test-helpers';

describe('create', () => {
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

  it('creates a post and returns it with an id', async () => {
    const result = await ctx.dataProvider.create('posts', {
      data: { title: 'Hello', body: 'World', isPublished: true },
    });

    expect(result.data.id).toBeDefined();
    expect(typeof result.data.id).toBe('number');
    expect(result.data.title).toBe('Hello');
  });

  it('creates a comment with a foreign key', async () => {
    const post = await ctx.dataProvider.create('posts', {
      data: { title: 'Post', body: 'Body' },
    });

    const comment = await ctx.dataProvider.create('comments', {
      data: { postId: post.data.id, body: 'Nice post', author: 'Alice' },
    });

    expect(comment.data.id).toBeDefined();
    expect(comment.data.postId).toBe(post.data.id);
  });

  it('auto-generates createdAt', async () => {
    const created = await ctx.dataProvider.create('posts', {
      data: { title: 'Timestamped', body: 'Body' },
    });

    const fetched = await ctx.dataProvider.getOne('posts', { id: created.data.id });
    expect(fetched.data.createdAt).toBeDefined();
  });

  it('creates multiple records with unique ids', async () => {
    const r1 = await ctx.dataProvider.create('posts', {
      data: { title: 'First', body: 'Body1' },
    });
    const r2 = await ctx.dataProvider.create('posts', {
      data: { title: 'Second', body: 'Body2' },
    });
    const r3 = await ctx.dataProvider.create('posts', {
      data: { title: 'Third', body: 'Body3' },
    });

    const ids = [r1.data.id, r2.data.id, r3.data.id];
    expect(new Set(ids).size).toBe(3);
  });
});
