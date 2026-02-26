import { TestContext, startTestServer, stopTestServer, resetDatabase } from '../src/test-helpers';

describe('getManyReference', () => {
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

  async function seedPostWithComments() {
    const post1 = await ctx.dataProvider.create('posts', {
      data: { title: 'Post 1', body: 'Body 1' },
    });
    const post2 = await ctx.dataProvider.create('posts', {
      data: { title: 'Post 2', body: 'Body 2' },
    });

    for (let i = 1; i <= 5; i++) {
      await ctx.dataProvider.create('comments', {
        data: { postId: post1.data.id, body: `Comment ${i}`, author: `Author ${i}` },
      });
    }
    await ctx.dataProvider.create('comments', {
      data: { postId: post2.data.id, body: 'Other comment', author: 'Other' },
    });

    return { post1, post2 };
  }

  it('retrieves comments for a specific post via target/id', async () => {
    const { post1 } = await seedPostWithComments();

    const result = await ctx.dataProvider.getManyReference('comments', {
      target: 'postId',
      id: post1.data.id,
      pagination: { page: 1, perPage: 25 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    });

    expect(result.data).toHaveLength(5);
    expect(result.total).toBe(5);
    result.data.forEach((c: any) => {
      expect(c.postId).toBe(post1.data.id);
    });
  });

  it('paginates referenced records', async () => {
    const { post1 } = await seedPostWithComments();

    const page1 = await ctx.dataProvider.getManyReference('comments', {
      target: 'postId',
      id: post1.data.id,
      pagination: { page: 1, perPage: 2 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    });

    const page2 = await ctx.dataProvider.getManyReference('comments', {
      target: 'postId',
      id: post1.data.id,
      pagination: { page: 2, perPage: 2 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    });

    expect(page1.data).toHaveLength(2);
    expect(page2.data).toHaveLength(2);
    expect(page1.total).toBe(5);
    expect(page1.data[0].id).not.toBe(page2.data[0].id);
  });

  it('sorts referenced records', async () => {
    const { post1 } = await seedPostWithComments();

    const asc = await ctx.dataProvider.getManyReference('comments', {
      target: 'postId',
      id: post1.data.id,
      pagination: { page: 1, perPage: 25 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    });

    const desc = await ctx.dataProvider.getManyReference('comments', {
      target: 'postId',
      id: post1.data.id,
      pagination: { page: 1, perPage: 25 },
      sort: { field: 'id', order: 'DESC' },
      filter: {},
    });

    expect(asc.data[0].id).toBeLessThan(asc.data[4].id);
    expect(desc.data[0].id).toBeGreaterThan(desc.data[4].id);
  });

  it('returns empty when no references exist', async () => {
    const post = await ctx.dataProvider.create('posts', {
      data: { title: 'Lonely', body: 'No comments' },
    });

    const result = await ctx.dataProvider.getManyReference('comments', {
      target: 'postId',
      id: post.data.id,
      pagination: { page: 1, perPage: 25 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    });

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('combines reference filter with additional filters', async () => {
    const { post1 } = await seedPostWithComments();

    const result = await ctx.dataProvider.getManyReference('comments', {
      target: 'postId',
      id: post1.data.id,
      pagination: { page: 1, perPage: 25 },
      sort: { field: 'id', order: 'ASC' },
      filter: { author: 'Author 1' },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].author).toBe('Author 1');
  });
});
