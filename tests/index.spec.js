// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from '@jest/globals';

describe('Basic functionality', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with arrays', () => {
    const array = [1, 2, 3];
    expect(array).toHaveLength(3);
    expect(array).toContain(2);
  });

  it('should work with objects', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj).toHaveProperty('name', 'test');
    expect(obj).toEqual({ name: 'test', value: 42 });
  });
});
