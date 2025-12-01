import type { Storage, StorageOptions, NamespacedStorage } from './types';
import { withNamespace } from '../features/namespace';

function storageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const storage = window.localStorage;
    if (!storage) return false;
    const key = '__storage_test__';
    storage.setItem(key, key);
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

class MemoryStorage implements globalThis.Storage {
  private map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  get length(): number {
    return this.map.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.map.keys());
    return keys[index] ?? null;
  }
}

function getAvailableStorage(): globalThis.Storage {
  if (storageAvailable()) {
    return window.localStorage;
  }

  return new MemoryStorage();
}

export function createStorage(): Storage {
  const storage = getAvailableStorage();

  const get = <T = unknown>(key: string, options?: StorageOptions): T | null => {
    try {
      const item = storage.getItem(key);
      if (item === null) return null;

      const parsed = JSON.parse(item) as T;
      return parsed;
    } catch (e) {
      storage.removeItem(key);

      if (options?.strict) {
        throw new Error(
          `Failed to deserialize value for key "${key}": ${e instanceof Error ? e.message : String(e)}`
        );
      }
      return null;
    }
  };

  const set = <T>(key: string, value: T, options?: StorageOptions): boolean => {
    try {
      const serialized = JSON.stringify(value);
      storage.setItem(key, serialized);
      return true;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        if (options?.strict) {
          throw new Error(`Storage quota exceeded for key "${key}"`);
        }
        return false;
      }

      if (options?.strict) {
        throw new Error(
          `Failed to serialize value for key "${key}": ${e instanceof Error ? e.message : String(e)}`
        );
      }
      return false;
    }
  };

  const remove = (key: string): boolean => {
    try {
      storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  };

  const clear = (): void => {
    try {
      storage.clear();
    } catch {
      //
    }
  };

  const has = (key: string): boolean => {
    try {
      return storage.getItem(key) !== null;
    } catch {
      return false;
    }
  };

  const keys = (): string[] => {
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
  };

  const namespace = (prefix: string): NamespacedStorage => {
    return withNamespace(storageInstance, prefix);
  };

  const storageInstance: Storage = {
    get,
    set,
    remove,
    clear,
    has,
    keys,
    namespace,
  };

  return storageInstance;
}
