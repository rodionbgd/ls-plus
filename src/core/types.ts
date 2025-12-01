/**
 * Options for storage operations.
 */
export interface StorageOptions {
  /**
   * In strict mode throws errors, in safe mode returns null/false.
   * @default false
   */
  strict?: boolean;
}

/**
 * Base Storage interface.
 */
export interface Storage {
  /**
   * Get value by key.
   */
  get<T = unknown>(key: string, options?: StorageOptions): T | null;

  /**
   * Set value by key.
   */
  set<T>(key: string, value: T, options?: StorageOptions): boolean;

  /**
   * Remove value by key.
   */
  remove(key: string): boolean;

  /**
   * Clear all values.
   */
  clear(): void;

  /**
   * Check if key exists.
   */
  has(key: string): boolean;

  /**
   * Get all keys.
   */
  keys(): string[];

  /**
   * Create namespaced storage with prefix.
   */
  namespace(prefix: string): NamespacedStorage;
}

/**
 * Storage with namespaces support.
 */
export interface NamespacedStorage extends Storage {
  /**
   * Create nested namespace.
   */
  namespace(prefix: string): NamespacedStorage;
}

/**
 * Storage with TTL support.
 */
export interface TTLStorage extends Storage {
  /**
   * Set value with time to live (TTL).
   */
  setTTL<T>(key: string, value: T, ttlMs: number): boolean;

  /**
   * Get value with TTL (returns null if expired).
   */
  getTTL<T>(key: string): T | null;

  /**
   * Clear all expired entries.
   * @returns Number of removed entries.
   */
  clearExpired(): number;
}
