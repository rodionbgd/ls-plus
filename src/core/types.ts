export interface StorageOptions {
  strict?: boolean;
}

export interface SetOptions extends StorageOptions {
  ttl?: number;
}

export interface CreateStorageOptions {
  storage?: globalThis.Storage;
  prefix?: string;
}

export interface Storage {
  get<T = unknown>(key: string, options?: StorageOptions): T | null;
  set<T>(key: string, value: T, options?: SetOptions): boolean;
  remove(key: string): boolean;
  clear(): void;
  has(key: string): boolean;
  keys(): string[];
  clearExpired(): number;
  namespace(prefix: string): NamespacedStorage;
}

export interface NamespacedStorage extends Storage {
  namespace(prefix: string): NamespacedStorage;
}
