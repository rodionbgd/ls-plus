export { createStorage } from './core/storage';
export type { Storage, StorageOptions, NamespacedStorage, TTLStorage } from './core/types';

export { withTTL } from './features/ttl';
export { withNamespace } from './features/namespace';
