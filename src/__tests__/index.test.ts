import { describe, it, expect, beforeEach } from 'vitest';
import { createStorage, withTTL, withNamespace } from '../index';

describe('Integration', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage();
    storage.clear();
  });

  it('should work with namespace and TTL together', () => {
    const nsStorage = withNamespace(storage, 'app');
    const ttlNsStorage = withTTL(nsStorage);

    ttlNsStorage.setTTL('temp', 'value', 1000);
    expect(ttlNsStorage.getTTL('temp')).toBe('value');
    expect(storage.has('app:__ttl__temp')).toBe(true);
  });

  it('should use namespace method from storage', () => {
    const nsStorage = storage.namespace('app');
    nsStorage.set('key', 'value');
    expect(nsStorage.get('key')).toBe('value');
  });
});
