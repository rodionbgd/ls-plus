# ls-plus

<div align="center">

![npm version](https://img.shields.io/npm/v/ls-plus?style=flat-square)
![npm downloads](https://img.shields.io/npm/dm/ls-plus?style=flat-square)
![bundle size](https://img.shields.io/bundlephobia/minzip/ls-plus?style=flat-square)
![license](https://img.shields.io/npm/l/ls-plus?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)

A lightweight, zero-dependency localStorage wrapper with TTL, namespaces, and SSR support.

[Installation](#installation) • [Documentation](#api-reference) • [Examples](#examples) • [GitHub](https://github.com/rodionbgd/ls-plus)

</div>

## Features

- 🚀 **Zero dependencies** - No external dependencies
- 💾 **TypeScript** - Full type safety with generics
- ⏱️ **TTL support** - Automatic expiration of stored values
- 🏷️ **Namespaces** - Organize keys with prefixes
- 🌐 **SSR ready** - Works in Node.js and browser environments
- 🔄 **Fallback** - Automatic fallback to in-memory storage when localStorage is unavailable
- 📦 **Small** - Less than 2KB gzipped
- 🌳 **Tree-shakeable** - Import only what you need

## Installation

```bash
npm install ls-plus
```

## Basic Usage

```typescript
import { createStorage } from 'ls-plus';

const storage = createStorage();

// Set and get values
storage.set('user', { name: 'John', age: 30 });
const user = storage.get<{ name: string; age: number }>('user');

// Remove values
storage.remove('user');

// Clear all
storage.clear();

// Check existence
if (storage.has('user')) {
  // ...
}

// Get all keys
const keys = storage.keys();
```

## TTL (Time To Live)

Store values with automatic expiration:

```typescript
import { createStorage, withTTL } from 'ls-plus';

const storage = createStorage();
const ttlStorage = withTTL(storage);

// Set value with 1 hour TTL (in milliseconds)
ttlStorage.setTTL('session', { token: 'abc123' }, 3600000);

// Get value (returns null if expired)
const session = ttlStorage.getTTL('session');

// Clear all expired entries
const cleared = ttlStorage.clearExpired();
```

## Namespaces

Organize your storage with namespaces:

```typescript
import { createStorage } from 'ls-plus';

const storage = createStorage();

// Create a namespaced storage
const userStorage = storage.namespace('user');
userStorage.set('name', 'John');
userStorage.set('email', 'john@example.com');

// Keys are prefixed: 'user:name', 'user:email'

// Nested namespaces
const settingsStorage = userStorage.namespace('settings');
settingsStorage.set('theme', 'dark');
// Key: 'user:settings:theme'

// Clear only namespaced keys
userStorage.clear(); // Removes all 'user:*' keys
```

## Error Handling

By default, the library uses "safe" mode (returns `null`/`false` on errors). You can enable strict mode:

```typescript
// Safe mode (default)
const value = storage.get('key'); // Returns null on error

// Strict mode
try {
  const value = storage.get('key', { strict: true });
} catch (error) {
  // Handle error
}
```

## SSR Support

The library automatically detects the environment and falls back to in-memory storage when `localStorage` is unavailable (Node.js, private browsing mode, etc.):

```typescript
// Works in both browser and Node.js
const storage = createStorage();
storage.set('key', 'value'); // Uses localStorage in browser, Map in Node.js
```

## Combining Features

You can combine TTL and namespaces:

```typescript
import { createStorage, withTTL } from 'ls-plus';

const storage = createStorage();
const userStorage = storage.namespace('user');
const ttlUserStorage = withTTL(userStorage);

// Store with TTL in namespace
ttlUserStorage.setTTL('session', { token: 'abc' }, 3600000);
```

## API Reference

### `createStorage(): Storage`

Creates a new storage instance using localStorage.

### `Storage`

#### `get<T>(key: string, options?: StorageOptions): T | null`

Get a value by key. Returns `null` if key doesn't exist or parsing fails.

#### `set<T>(key: string, value: T, options?: StorageOptions): boolean`

Set a value by key. Returns `true` on success, `false` on error.

#### `remove(key: string): boolean`

Remove a value by key.

#### `clear(): void`

Clear all values.

#### `has(key: string): boolean`

Check if a key exists.

#### `keys(): string[]`

Get all keys.

#### `namespace(prefix: string): NamespacedStorage`

Create a namespaced storage instance.

### `withTTL(storage: Storage): TTLStorage`

Add TTL support to a storage instance.

#### `setTTL<T>(key: string, value: T, ttlMs: number): boolean`

Set a value with TTL (time to live in milliseconds).

#### `getTTL<T>(key: string): T | null`

Get a value with TTL. Returns `null` if expired or doesn't exist.

#### `clearExpired(): number`

Clear all expired entries. Returns the number of cleared entries.

### `withNamespace(storage: Storage, prefix: string): NamespacedStorage`

Create a namespaced storage instance (alternative to `storage.namespace()`).

## TypeScript

Full TypeScript support with generics:

```typescript
interface User {
  name: string;
  age: number;
}

const user: User = { name: 'John', age: 30 };
storage.set<User>('user', user);
const retrieved = storage.get<User>('user'); // Type: User | null
```

## License

MIT

