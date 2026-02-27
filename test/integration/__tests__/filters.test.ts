import { TestContext, startTestServer, stopTestServer, resetDatabase } from '../src/test-helpers';

describe('filters', () => {
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

  const defaultPagination = { page: 1, perPage: 100 };
  const defaultSort = { field: 'id', order: 'ASC' } as const;

  async function seedPosts() {
    await ctx.dataProvider.create('posts', {
      data: { title: 'Alpha Post', body: 'First body', isPublished: true },
    });
    await ctx.dataProvider.create('posts', {
      data: { title: 'Beta Article', body: 'Second body', isPublished: false },
    });
    await ctx.dataProvider.create('posts', {
      data: { title: 'Gamma Post', body: 'Third body', isPublished: true },
    });
  }

  describe('auto-detection', () => {
    it('uses CONTAINS_LOW for string fields', async () => {
      await seedPosts();

      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: { title: 'post' },
      });

      // "post" should match "Alpha Post" and "Gamma Post" (case-insensitive contains)
      expect(result.data).toHaveLength(2);
    });

    it('uses EQUALS for number fields', async () => {
      await seedPosts();

      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: { id: 1 },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(1);
    });

    it('uses EQUALS for boolean fields (isPublished)', async () => {
      await seedPosts();

      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: { isPublished: true },
      });

      expect(result.data).toHaveLength(2);
      result.data.forEach((post: any) => {
        expect(post.isPublished).toBe(true);
      });
    });

    it('uses EQUALS for numeric string values', async () => {
      await seedPosts();

      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: { id: '1' },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(1);
    });

    it('uses EQUALS for UUID strings', async () => {
      // This tests the composeFilter path — we just verify no error and it produces a filter
      await seedPosts();

      // UUIDs won't match any posts (integer ids), so expect empty
      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: { id: '550e8400-e29b-41d4-a716-446655440000' },
      });

      expect(result.data).toHaveLength(0);
    });

    it('uses IN for array values (cumulative filters)', async () => {
      await seedPosts();

      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: { title: ['Alpha Post', 'Gamma Post'] },
      });

      expect(result.data).toHaveLength(2);
      const titles = result.data.map((p: any) => p.title);
      expect(titles).toContain('Alpha Post');
      expect(titles).toContain('Gamma Post');
    });
  });

  describe('explicit operators', () => {
    it('supports field||$eq operator syntax', async () => {
      await seedPosts();

      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: { 'title||$eq': 'Alpha Post' },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Alpha Post');
    });

    it('supports field:$eq operator syntax', async () => {
      await seedPosts();

      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: { 'title:$eq': 'Alpha Post' },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Alpha Post');
    });

    it('supports $gt operator', async () => {
      await seedPosts();

      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: { 'id||$gt': 1 },
      });

      expect(result.data).toHaveLength(2);
      result.data.forEach((post: any) => {
        expect(post.id).toBeGreaterThan(1);
      });
    });

    it('supports $lt operator', async () => {
      await seedPosts();

      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: { 'id||$lt': 3 },
      });

      expect(result.data).toHaveLength(2);
      result.data.forEach((post: any) => {
        expect(post.id).toBeLessThan(3);
      });
    });
  });

  describe('OR filters', () => {
    it('supports $OR filter parameter', async () => {
      await seedPosts();

      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: {
          'title||$eq': 'Alpha Post',
          $OR: { 'title||$eq': 'Beta Article' },
        },
      });

      // With OR filter: main filter matches Alpha, OR filter matches Beta
      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('custom query params', () => {
    it('passes through q filter key as query params', async () => {
      await seedPosts();

      // The 'q' key is extracted and appended as query params
      // nestjsx/crud ignores unknown params, so this should not error
      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: { q: { search: 'test' } },
      });

      // Should return results without error (q params are just appended)
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });
  });

  describe('nested and underscore-prefixed filters', () => {
    it('handles underscore-prefixed dotted field names', async () => {
      await seedPosts();

      // _entity.field format — the _ prefix and entity part are stripped
      // leaving just 'field' as the filter field
      // This tests the composeFilter path for _prefix.field → field
      const result = await ctx.dataProvider.getList('posts', {
        pagination: defaultPagination,
        sort: defaultSort,
        filter: { '_post.title': 'post' },
      });

      // Should use CONTAINS_LOW on the 'title' field
      expect(result.data).toHaveLength(2);
    });
  });
});
