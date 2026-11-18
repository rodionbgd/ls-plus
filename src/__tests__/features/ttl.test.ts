import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStorage } from '../../core/storage';

describe('TTL', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    window.localStorage.clear();
    storage = createStorage();
  });

  it('should set and get values with ttl', () => {
    storage.set('temp', 'value', { ttl: 1000 });
    expect(storage.get('temp')).toBe('value');
  });

  it('should return null for expired values', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    storage.set('temp', 'value', { ttl: 100 });

    vi.advanceTimersByTime(150);
    vi.setSystemTime(now + 150);

    expect(storage.get('temp')).toBeNull();
    expect(storage.has('temp')).toBe(false);

    vi.useRealTimers();
  });

  it('should return null for non-existent keys', () => {
    expect(storage.get('non-existent')).toBeNull();
  });

  it('should clear expired entries', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    storage.set('key1', 'value1', { ttl: 100 });
    storage.set('key2', 'value2', { ttl: 150 });
    storage.set('key3', 'value3', { ttl: 300 });

    vi.advanceTimersByTime(200);
    vi.setSystemTime(now + 200);

    const cleared = storage.clearExpired();
    expect(cleared).toBe(2);
    expect(storage.get('key1')).toBeNull();
    expect(storage.get('key2')).toBeNull();
    expect(storage.get('key3')).toBe('value3');

    vi.useRealTimers();
  });

  it('should work with complex objects', () => {
    const obj = { name: 'test', data: [1, 2, 3] };
    storage.set('obj', obj, { ttl: 1000 });
    expect(storage.get('obj')).toEqual(obj);
  });
});
