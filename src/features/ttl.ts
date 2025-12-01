import type { Storage, TTLStorage } from '../core/types';

const TTL_PREFIX = '__ttl__';

interface TTLValue<T> {
  value: T;
  expiresAt: number;
}

/**
 * Adds TTL support to storage.
 */
export function withTTL(storage: Storage): TTLStorage {
  const setTTL = <T>(key: string, value: T, ttlMs: number): boolean => {
    const ttlValue: TTLValue<T> = {
      value,
      expiresAt: Date.now() + ttlMs,
    };
    return storage.set(`${TTL_PREFIX}${key}`, ttlValue);
  };

  const getTTL = <T>(key: string): T | null => {
    const ttlKey = `${TTL_PREFIX}${key}`;
    const ttlValue = storage.get<TTLValue<T>>(ttlKey);

    if (ttlValue === null) {
      return null;
    }

    if (Date.now() >= ttlValue.expiresAt) {
      storage.remove(ttlKey);
      return null;
    }

    return ttlValue.value;
  };

  const clearExpired = (): number => {
    let cleared = 0;
    const keys = storage.keys();

    for (const key of keys) {
      if (key.startsWith(TTL_PREFIX)) {
        const ttlValue = storage.get<TTLValue<unknown>>(key);
        if (ttlValue && Date.now() >= ttlValue.expiresAt) {
          storage.remove(key);
          cleared++;
        }
      }
    }

    return cleared;
  };

  return {
    ...storage,
    setTTL,
    getTTL,
    clearExpired,
  };
}
