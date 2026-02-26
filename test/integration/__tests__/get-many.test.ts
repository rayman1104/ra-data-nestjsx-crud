import { TestContext, startTestServer, stopTestServer, resetDatabase } from '../src/test-helpers';

describe('getMany', () => {
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

  it('retrieves multiple records by ids', async () => {
    const r1 = await ctx.dataProvider.create('posts', { data: { title: 'A', body: 'A' } });
    const r2 = await ctx.dataProvider.create('posts', { data: { title: 'B', body: 'B' } });
    await ctx.dataProvider.create('posts', { data: { title: 'C', body: 'C' } });

    const result = await ctx.dataProvider.getMany('posts', {
      ids: [r1.data.id, r2.data.id],
    });

    expect(result.data).toHaveLength(2);
    const ids = result.data.map((d: any) => d.id);
    expect(ids).toContain(r1.data.id);
    expect(ids).toContain(r2.data.id);
  });

  it('returns all regardless of id order', async () => {
    const r1 = await ctx.dataProvider.create('posts', { data: { title: 'A', body: 'A' } });
    const r2 = await ctx.dataProvider.create('posts', { data: { title: 'B', body: 'B' } });
    const r3 = await ctx.dataProvider.create('posts', { data: { title: 'C', body: 'C' } });

    const result = await ctx.dataProvider.getMany('posts', {
      ids: [r3.data.id, r1.data.id, r2.data.id],
    });

    expect(result.data).toHaveLength(3);
  });

  it('works with a single id', async () => {
    const r1 = await ctx.dataProvider.create('posts', { data: { title: 'Only', body: 'One' } });

    const result = await ctx.dataProvider.getMany('posts', {
      ids: [r1.data.id],
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('Only');
  });

  it('normalizes response format (json.data || json)', async () => {
    const r1 = await ctx.dataProvider.create('posts', { data: { title: 'Test', body: 'Body' } });

    const result = await ctx.dataProvider.getMany('posts', {
      ids: [r1.data.id],
    });

    // The provider normalizes: json.data || json
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data[0]).toHaveProperty('id');
  });
});
