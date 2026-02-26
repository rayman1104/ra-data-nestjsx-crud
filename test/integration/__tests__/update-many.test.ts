import { TestContext, startTestServer, stopTestServer, resetDatabase } from '../src/test-helpers';

describe('updateMany', () => {
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

  it('updates multiple posts via PUT', async () => {
    const r1 = await ctx.dataProvider.create('posts', {
      data: { title: 'One', body: 'Body 1', isPublished: false },
    });
    const r2 = await ctx.dataProvider.create('posts', {
      data: { title: 'Two', body: 'Body 2', isPublished: false },
    });

    const result = await ctx.dataProvider.updateMany('posts', {
      ids: [r1.data.id, r2.data.id],
      data: { title: 'Bulk Updated', body: 'New body', isPublished: true },
    });

    expect(result.data).toHaveLength(2);

    // Verify each was updated
    const fetched1 = await ctx.dataProvider.getOne('posts', { id: r1.data.id });
    const fetched2 = await ctx.dataProvider.getOne('posts', { id: r2.data.id });
    expect(fetched1.data.title).toBe('Bulk Updated');
    expect(fetched2.data.title).toBe('Bulk Updated');
  });

  it('works with a single id', async () => {
    const r1 = await ctx.dataProvider.create('posts', {
      data: { title: 'Solo', body: 'Body', isPublished: false },
    });

    const result = await ctx.dataProvider.updateMany('posts', {
      ids: [r1.data.id],
      data: { title: 'Solo Updated', body: 'New body', isPublished: true },
    });

    expect(result.data).toHaveLength(1);
    const fetched = await ctx.dataProvider.getOne('posts', { id: r1.data.id });
    expect(fetched.data.title).toBe('Solo Updated');
  });

  it('documents PUT full-replacement behavior', async () => {
    const created = await ctx.dataProvider.create('posts', {
      data: { title: 'Original', body: 'Original body', isPublished: true },
    });

    // PUT replaces the entire entity — all fields must be sent
    await ctx.dataProvider.updateMany('posts', {
      ids: [created.data.id],
      data: { title: 'Replaced', body: 'Replaced body', isPublished: false },
    });

    const fetched = await ctx.dataProvider.getOne('posts', { id: created.data.id });
    expect(fetched.data.title).toBe('Replaced');
    expect(fetched.data.body).toBe('Replaced body');
    expect(fetched.data.isPublished).toBe(false);
  });
});
