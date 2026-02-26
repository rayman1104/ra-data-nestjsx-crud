import { TestContext, startTestServer, stopTestServer, resetDatabase } from '../src/test-helpers';

describe('getList', () => {
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

  const defaultSort = { field: 'id', order: 'ASC' } as const;

  it('returns paginated results with data[] and total', async () => {
    await ctx.dataProvider.create('posts', { data: { title: 'A', body: 'A' } });
    await ctx.dataProvider.create('posts', { data: { title: 'B', body: 'B' } });
    await ctx.dataProvider.create('posts', { data: { title: 'C', body: 'C' } });

    const result = await ctx.dataProvider.getList('posts', {
      pagination: { page: 1, perPage: 10 },
      sort: defaultSort,
      filter: {},
    });

    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it('respects pagination (page/perPage)', async () => {
    for (let i = 1; i <= 5; i++) {
      await ctx.dataProvider.create('posts', { data: { title: `Post ${i}`, body: `Body ${i}` } });
    }

    const page1 = await ctx.dataProvider.getList('posts', {
      pagination: { page: 1, perPage: 2 },
      sort: defaultSort,
      filter: {},
    });

    const page2 = await ctx.dataProvider.getList('posts', {
      pagination: { page: 2, perPage: 2 },
      sort: defaultSort,
      filter: {},
    });

    expect(page1.data).toHaveLength(2);
    expect(page2.data).toHaveLength(2);
    expect(page1.total).toBe(5);
    // Pages should return different records
    expect(page1.data[0].id).not.toBe(page2.data[0].id);
  });

  it('sorts ascending by field', async () => {
    await ctx.dataProvider.create('posts', { data: { title: 'Banana', body: 'B' } });
    await ctx.dataProvider.create('posts', { data: { title: 'Apple', body: 'A' } });
    await ctx.dataProvider.create('posts', { data: { title: 'Cherry', body: 'C' } });

    const result = await ctx.dataProvider.getList('posts', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'title', order: 'ASC' },
      filter: {},
    });

    expect(result.data[0].title).toBe('Apple');
    expect(result.data[1].title).toBe('Banana');
    expect(result.data[2].title).toBe('Cherry');
  });

  it('sorts descending', async () => {
    await ctx.dataProvider.create('posts', { data: { title: 'Banana', body: 'B' } });
    await ctx.dataProvider.create('posts', { data: { title: 'Apple', body: 'A' } });
    await ctx.dataProvider.create('posts', { data: { title: 'Cherry', body: 'C' } });

    const result = await ctx.dataProvider.getList('posts', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'title', order: 'DESC' },
      filter: {},
    });

    expect(result.data[0].title).toBe('Cherry');
    expect(result.data[1].title).toBe('Banana');
    expect(result.data[2].title).toBe('Apple');
  });

  it('returns empty data[] when no records', async () => {
    const result = await ctx.dataProvider.getList('posts', {
      pagination: { page: 1, perPage: 10 },
      sort: defaultSort,
      filter: {},
    });

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('handles page beyond available data', async () => {
    await ctx.dataProvider.create('posts', { data: { title: 'Only', body: 'One' } });

    const result = await ctx.dataProvider.getList('posts', {
      pagination: { page: 100, perPage: 10 },
      sort: defaultSort,
      filter: {},
    });

    expect(result.data).toEqual([]);
    expect(result.total).toBe(1);
  });
});
