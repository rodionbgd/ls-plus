import { describe, it, expect, beforeEach } from 'vitest';
import { createStorage, createSessionStorage } from '../../core/storage';
import { MemoryStorage } from '../../core/memory';

describe('Storage adapters', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should use custom storage', () => {
    const memory = new MemoryStorage();
    const storage = createStorage({ storage: memory });

    storage.set('key', 'value');
    expect(storage.get('key')).toBe('value');
    expect(window.localStorage.getItem('key')).toBeNull();
    expect(memory.getItem('key')).not.toBeNull();
  });

  it('should apply prefix', () => {
    const storage = createStorage({ prefix: 'app' });
    storage.set('key', 'value');

    expect(storage.get('key')).toBe('value');
    expect(window.localStorage.getItem('app:key')).not.toBeNull();
    expect(window.localStorage.getItem('key')).toBeNull();
  });

  it('should clear only owned keys without wiping foreign data', () => {
    window.localStorage.setItem('foreign', '"keep"');
    const storage = createStorage();
    storage.set('own', 'value');
    storage.clear();

    expect(storage.get('own')).toBeNull();
    expect(window.localStorage.getItem('foreign')).toBe('"keep"');
  });

  it('should use sessionStorage', () => {
    const storage = createSessionStorage();
    storage.set('key', 'session');

    expect(storage.get('key')).toBe('session');
    expect(window.sessionStorage.getItem('key')).not.toBeNull();
    expect(window.localStorage.getItem('key')).toBeNull();
  });
});
