import { describe, expect, it } from 'bun:test';
import { createPaginationMeta, parsePaginationParams } from './pagination.util';

describe('Pagination Utility', () => {
  it('should parse pagination query params with safe defaults', () => {
    const params = parsePaginationParams({});
    expect(params.page).toBe(1);
    expect(params.limit).toBe(10);
    expect(params.offset).toBe(0);
    expect(params.sortOrder).toBe('desc');
  });

  it('should calculate offset and clamp limit accurately', () => {
    const params = parsePaginationParams({ page: '3', limit: '25', sortOrder: 'asc' });
    expect(params.page).toBe(3);
    expect(params.limit).toBe(25);
    expect(params.offset).toBe(50);
    expect(params.sortOrder).toBe('asc');
  });

  it('should build pagination metadata correctly', () => {
    const meta = createPaginationMeta(2, 10, 35);
    expect(meta.page).toBe(2);
    expect(meta.limit).toBe(10);
    expect(meta.total).toBe(35);
    expect(meta.totalPages).toBe(4);
  });
});
