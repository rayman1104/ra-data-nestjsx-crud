import { TestContext, startTestServer, stopTestServer, resetDatabase } from '../src/test-helpers';

describe('delete', () => {
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

  it('deletes a post by id and confirms gone via getOne 404', async () => {
    const created = await ctx.dataProvider.create('posts', {
      data: { title: 'ToDelete', body: 'Body' },
    });

    await ctx.dataProvider.delete('posts', { id: created.data.id, previousData: created.data });

    await expect(
      ctx.dataProvider.getOne('posts', { id: created.data.id }),
    ).rejects.toThrow();
  });

  it('deletes a comment', async () => {
    const post = await ctx.dataProvider.create('posts', {
      data: { title: 'Post', body: 'Body' },
    });
    const comment = await ctx.dataProvider.create('comments', {
      data: { postId: post.data.id, body: 'Comment', author: 'Alice' },
    });

    await ctx.dataProvider.delete('comments', {
      id: comment.data.id,
      previousData: comment.data,
    });

    await expect(
      ctx.dataProvider.getOne('comments', { id: comment.data.id }),
    ).rejects.toThrow();
  });

  it('cascade deletes comments when post is deleted', async () => {
    const post = await ctx.dataProvider.create('posts', {
      data: { title: 'Parent', body: 'Body' },
    });
    await ctx.dataProvider.create('comments', {
      data: { postId: post.data.id, body: 'Child 1', author: 'A' },
    });
    await ctx.dataProvider.create('comments', {
      data: { postId: post.data.id, body: 'Child 2', author: 'B' },
    });

    await ctx.dataProvider.delete('posts', { id: post.data.id, previousData: post.data });

    // All comments for that post should be gone
    const result = await ctx.dataProvider.getList('comments', {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    });

    expect(result.data).toHaveLength(0);
  });

  it('returns deleted entity data with id', async () => {
    const created = await ctx.dataProvider.create('posts', {
      data: { title: 'WillReturn', body: 'Body' },
    });

    const result = await ctx.dataProvider.delete('posts', {
      id: created.data.id,
      previousData: created.data,
    });

    expect(result.data.id).toBe(created.data.id);
  });
});
