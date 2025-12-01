import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStorage } from '../../core/storage';
import { withTTL } from '../../features/ttl';

describe('TTL', () => {
  let storage: ReturnType<typeof createStorage>;
  let ttlStorage: ReturnType<typeof withTTL>;

  beforeEach(() => {
    storage = createStorage();
    storage.clear();
    ttlStorage = withTTL(storage);
  });

  it('should set and get TTL values', () => {
    ttlStorage.setTTL('temp', 'value', 1000);
    expect(ttlStorage.getTTL('temp')).toBe('value');
  });

  it('should return null for expired values', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    ttlStorage.setTTL('temp', 'value', 100);

    vi.advanceTimersByTime(150);
    vi.setSystemTime(now + 150);

    expect(ttlStorage.getTTL('temp')).toBeNull();
    expect(storage.has('__ttl__temp')).toBe(false);

    vi.useRealTimers();
  });

  it('should return null for non-existent TTL keys', () => {
    expect(ttlStorage.getTTL('non-existent')).toBeNull();
  });

  it('should clear expired entries', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    ttlStorage.setTTL('key1', 'value1', 100);
    ttlStorage.setTTL('key2', 'value2', 150);
    ttlStorage.setTTL('key3', 'value3', 300);

    vi.advanceTimersByTime(200);
    vi.setSystemTime(now + 200);

    const cleared = ttlStorage.clearExpired();
    expect(cleared).toBe(2);
    expect(ttlStorage.getTTL('key1')).toBeNull();
    expect(ttlStorage.getTTL('key2')).toBeNull();
    expect(ttlStorage.getTTL('key3')).toBe('value3');

    vi.useRealTimers();
  });

  it('should work with complex objects', () => {
    const obj = { name: 'test', data: [1, 2, 3] };
    ttlStorage.setTTL('obj', obj, 1000);
    expect(ttlStorage.getTTL('obj')).toEqual(obj);
  });
});
