import type {
  Storage,
  StorageOptions,
  SetOptions,
  NamespacedStorage,
  CreateStorageOptions,
} from './types';
import { withNamespace } from '../features/namespace';
import { MemoryStorage } from './memory';
import { createEnvelope, isEnvelope, isExpired } from './envelope';

type ReadResult<T> =
  | { status: 'missing' }
  | { status: 'ok'; value: T }
  | { status: 'error'; error: unknown };

function canUseStorage(storage: globalThis.Storage): boolean {
  try {
    const key = '__storage_test__';
    storage.setItem(key, key);
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function getLocalStorage(): globalThis.Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return canUseStorage(window.localStorage) ? window.localStorage : null;
  } catch {
    return null;
  }
}

function getSessionStorage(): globalThis.Storage | null {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }
    return canUseStorage(window.sessionStorage) ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

function resolveStorage(preferred?: globalThis.Storage): globalThis.Storage {
  if (preferred && canUseStorage(preferred)) {
    return preferred;
  }

  return getLocalStorage() ?? new MemoryStorage();
}

function resolveSessionStorage(): globalThis.Storage {
  return getSessionStorage() ?? new MemoryStorage();
}

function listKeys(storage: globalThis.Storage): string[] {
  try {
    const result: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key !== null) {
        result.push(key);
      }
    }
    return result;
  } catch {
    return [];
  }
}

function createStorageInstance(storage: globalThis.Storage, prefix?: string): Storage {
  const ownedKeys = new Set<string>();

  const toPhysicalKey = (key: string): string => (prefix ? `${prefix}:${key}` : key);

  const toLogicalKey = (physicalKey: string): string | null => {
    if (!prefix) {
      return physicalKey;
    }

    const prefixWithColon = `${prefix}:`;
    if (!physicalKey.startsWith(prefixWithColon)) {
      return null;
    }

    return physicalKey.slice(prefixWithColon.length);
  };

  const track = (physicalKey: string): void => {
    ownedKeys.add(physicalKey);
  };

  const untrack = (physicalKey: string): void => {
    ownedKeys.delete(physicalKey);
  };

  const removePhysical = (physicalKey: string): boolean => {
    try {
      storage.removeItem(physicalKey);
      untrack(physicalKey);
      return true;
    } catch {
      return false;
    }
  };

  const writeRaw = (physicalKey: string, serialized: string, options?: StorageOptions): boolean => {
    try {
      storage.setItem(physicalKey, serialized);
      track(physicalKey);
      return true;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        if (options?.strict) {
          throw new Error(`Storage quota exceeded for key "${physicalKey}"`);
        }
        return false;
      }

      if (options?.strict) {
        throw new Error(
          `Failed to serialize value for key "${physicalKey}": ${
            e instanceof Error ? e.message : String(e)
          }`
        );
      }
      return false;
    }
  };

  const readPhysical = <T>(physicalKey: string): ReadResult<T> => {
    try {
      const raw = storage.getItem(physicalKey);
      if (raw === null) {
        return { status: 'missing' };
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        removePhysical(physicalKey);
        return { status: 'error', error: e };
      }

      if (isEnvelope(parsed)) {
        if (isExpired(parsed.expiresAt)) {
          removePhysical(physicalKey);
          return { status: 'missing' };
        }
        track(physicalKey);
        return { status: 'ok', value: parsed.value as T };
      }

      track(physicalKey);
      return { status: 'ok', value: parsed as T };
    } catch (e) {
      return { status: 'error', error: e };
    }
  };

  const throwIfStrict = (
    result: ReadResult<unknown>,
    key: string,
    options?: StorageOptions
  ): void => {
    if (result.status === 'error' && options?.strict) {
      throw new Error(
        `Failed to deserialize value for key "${key}": ${
          result.error instanceof Error ? result.error.message : String(result.error)
        }`
      );
    }
  };

  const get = <T = unknown>(key: string, options?: StorageOptions): T | null => {
    const result = readPhysical<T>(toPhysicalKey(key));
    throwIfStrict(result, key, options);

    if (result.status === 'ok') {
      return result.value;
    }

    return null;
  };

  const set = <T>(key: string, value: T, options?: SetOptions): boolean => {
    const physicalKey = toPhysicalKey(key);

    try {
      const ttl = options?.ttl;
      const payload =
        ttl !== undefined && Number.isFinite(ttl) && ttl > 0
          ? createEnvelope(value, Date.now() + ttl)
          : value;

      return writeRaw(physicalKey, JSON.stringify(payload), options);
    } catch (e) {
      if (options?.strict) {
        throw new Error(
          `Failed to serialize value for key "${key}": ${
            e instanceof Error ? e.message : String(e)
          }`
        );
      }
      return false;
    }
  };

  const remove = (key: string): boolean => {
    return removePhysical(toPhysicalKey(key));
  };

  const clear = (): void => {
    if (prefix) {
      const prefixWithColon = `${prefix}:`;
      for (const physicalKey of listKeys(storage)) {
        if (physicalKey.startsWith(prefixWithColon)) {
          removePhysical(physicalKey);
        }
      }
      return;
    }

    for (const physicalKey of Array.from(ownedKeys)) {
      removePhysical(physicalKey);
    }
  };

  const has = (key: string): boolean => {
    return readPhysical(toPhysicalKey(key)).status === 'ok';
  };

  const keys = (): string[] => {
    try {
      if (prefix) {
        const result: string[] = [];
        for (const physicalKey of listKeys(storage)) {
          const logical = toLogicalKey(physicalKey);
          if (logical !== null) {
            result.push(logical);
          }
        }
        return result;
      }

      return Array.from(ownedKeys)
        .map((physicalKey) => toLogicalKey(physicalKey))
        .filter((key): key is string => key !== null);
    } catch {
      return [];
    }
  };

  const clearExpired = (): number => {
    let cleared = 0;
    const candidates = prefix
      ? listKeys(storage).filter((key) => key.startsWith(`${prefix}:`))
      : Array.from(ownedKeys);

    for (const physicalKey of candidates) {
      const raw = storage.getItem(physicalKey);
      if (raw === null) {
        untrack(physicalKey);
        continue;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        continue;
      }

      if (isEnvelope(parsed) && isExpired(parsed.expiresAt)) {
        removePhysical(physicalKey);
        cleared++;
      }
    }

    return cleared;
  };

  const namespace = (nsPrefix: string): NamespacedStorage => {
    return withNamespace(storageInstance, nsPrefix);
  };

  const storageInstance: Storage = {
    get,
    set,
    remove,
    clear,
    has,
    keys,
    clearExpired,
    namespace,
  };

  return storageInstance;
}

export function createStorage(options?: CreateStorageOptions): Storage {
  return createStorageInstance(resolveStorage(options?.storage), options?.prefix);
}

export function createSessionStorage(options?: Omit<CreateStorageOptions, 'storage'>): Storage {
  return createStorageInstance(resolveSessionStorage(), options?.prefix);
}
