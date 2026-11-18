import { describe, it, expect, beforeEach } from 'vitest';
import { createStorage, withNamespace } from '../index';

describe('Integration', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    window.localStorage.clear();
    storage = createStorage();
  });

  it('should work with namespace and ttl together', () => {
    const nsStorage = withNamespace(storage, 'app');

    nsStorage.set('temp', 'value', { ttl: 1000 });
    expect(nsStorage.get('temp')).toBe('value');
    expect(storage.has('app:temp')).toBe(true);
  });

  it('should use namespace method from storage', () => {
    const nsStorage = storage.namespace('app');
    nsStorage.set('key', 'value');
    expect(nsStorage.get('key')).toBe('value');
  });
});
