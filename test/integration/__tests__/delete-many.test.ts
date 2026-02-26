import { TestContext, startTestServer, stopTestServer, resetDatabase } from '../src/test-helpers';

describe('deleteMany', () => {
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

  it('deletes multiple posts', async () => {
    const r1 = await ctx.dataProvider.create('posts', { data: { title: 'A', body: 'A' } });
    const r2 = await ctx.dataProvider.create('posts', { data: { title: 'B', body: 'B' } });
    await ctx.dataProvider.create('posts', { data: { title: 'C', body: 'C' } });

    const result = await ctx.dataProvider.deleteMany('posts', {
      ids: [r1.data.id, r2.data.id],
    });

    expect(result.data).toHaveLength(2);

    const remaining = await ctx.dataProvider.getList('posts', {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    });

    expect(remaining.data).toHaveLength(1);
    expect(remaining.data[0].title).toBe('C');
  });

  it('works with a single id', async () => {
    const r1 = await ctx.dataProvider.create('posts', { data: { title: 'Solo', body: 'Body' } });

    const result = await ctx.dataProvider.deleteMany('posts', {
      ids: [r1.data.id],
    });

    expect(result.data).toHaveLength(1);
  });

  it('handles deleting all records', async () => {
    const r1 = await ctx.dataProvider.create('posts', { data: { title: 'A', body: 'A' } });
    const r2 = await ctx.dataProvider.create('posts', { data: { title: 'B', body: 'B' } });

    await ctx.dataProvider.deleteMany('posts', {
      ids: [r1.data.id, r2.data.id],
    });

    const remaining = await ctx.dataProvider.getList('posts', {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'id', order: 'ASC' },
      filter: {},
    });

    expect(remaining.data).toHaveLength(0);
    expect(remaining.total).toBe(0);
  });
});
