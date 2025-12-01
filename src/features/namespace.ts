import type { Storage, NamespacedStorage } from '../core/types';

/**
 * Creates namespaced storage with prefix.
 */
export function withNamespace(storage: Storage, prefix: string): NamespacedStorage {
  const prefixedKey = (key: string): string => `${prefix}:${key}`;

  const get = <T = unknown>(key: string, options?: Parameters<Storage['get']>[1]): T | null => {
    return storage.get<T>(prefixedKey(key), options);
  };

  const set = <T>(key: string, value: T, options?: Parameters<Storage['set']>[2]): boolean => {
    return storage.set(prefixedKey(key), value, options);
  };

  const remove = (key: string): boolean => {
    return storage.remove(prefixedKey(key));
  };

  const clear = (): void => {
    const keys = storage.keys();
    const prefixWithColon = `${prefix}:`;
    for (const key of keys) {
      if (key.startsWith(prefixWithColon)) {
        storage.remove(key);
      }
    }
  };

  const has = (key: string): boolean => {
    return storage.has(prefixedKey(key));
  };

  const keys = (): string[] => {
    const allKeys = storage.keys();
    const prefixWithColon = `${prefix}:`;
    return allKeys
      .filter((key) => key.startsWith(prefixWithColon))
      .map((key) => key.slice(prefixWithColon.length));
  };

  const namespace = (subPrefix: string): NamespacedStorage => {
    return withNamespace(storage, `${prefix}:${subPrefix}`);
  };

  return {
    get,
    set,
    remove,
    clear,
    has,
    keys,
    namespace,
  };
}
