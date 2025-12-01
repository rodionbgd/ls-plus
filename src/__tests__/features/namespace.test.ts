import { describe, it, expect, beforeEach } from 'vitest';
import { createStorage } from '../../core/storage';
import { withNamespace } from '../../features/namespace';

describe('Namespace', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage();
    storage.clear();
  });

  it('should prefix keys', () => {
    const nsStorage = withNamespace(storage, 'app');
    nsStorage.set('key', 'value');

    expect(nsStorage.get('key')).toBe('value');
    expect(storage.has('app:key')).toBe(true);
    expect(storage.get('app:key')).toBe('value');
  });

  it('should not conflict with other namespaces', () => {
    const ns1 = withNamespace(storage, 'app1');
    const ns2 = withNamespace(storage, 'app2');

    ns1.set('key', 'value1');
    ns2.set('key', 'value2');

    expect(ns1.get('key')).toBe('value1');
    expect(ns2.get('key')).toBe('value2');
  });

  it('should support nested namespaces', () => {
    const ns1 = withNamespace(storage, 'app');
    const ns2 = ns1.namespace('user');

    ns2.set('name', 'John');

    expect(ns2.get('name')).toBe('John');
    expect(storage.has('app:user:name')).toBe(true);
  });

  it('should clear only namespaced keys', () => {
    storage.set('global', 'value');
    const nsStorage = withNamespace(storage, 'app');
    nsStorage.set('key1', 'value1');
    nsStorage.set('key2', 'value2');

    nsStorage.clear();

    expect(storage.get('global')).toBe('value');
    expect(nsStorage.get('key1')).toBeNull();
    expect(nsStorage.get('key2')).toBeNull();
  });

  it('should return only namespaced keys', () => {
    storage.set('global', 'value');
    const nsStorage = withNamespace(storage, 'app');
    nsStorage.set('key1', 'value1');
    nsStorage.set('key2', 'value2');

    const keys = nsStorage.keys();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
    expect(keys).not.toContain('global');
  });

  it('should check existence in namespace', () => {
    const nsStorage = withNamespace(storage, 'app');
    expect(nsStorage.has('key')).toBe(false);
    nsStorage.set('key', 'value');
    expect(nsStorage.has('key')).toBe(true);
  });

  it('should remove namespaced keys', () => {
    const nsStorage = withNamespace(storage, 'app');
    nsStorage.set('key', 'value');
    nsStorage.remove('key');
    expect(nsStorage.get('key')).toBeNull();
  });
});
