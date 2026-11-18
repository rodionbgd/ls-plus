# ls-plus

<div align="center">

![npm version](https://img.shields.io/npm/v/ls-plus?style=flat-square)
![npm downloads](https://img.shields.io/npm/dm/ls-plus?style=flat-square)
![bundle size](https://img.shields.io/bundlephobia/minzip/ls-plus?style=flat-square)
![license](https://img.shields.io/npm/l/ls-plus?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)

A lightweight, zero-dependency localStorage wrapper with TTL, namespaces, and SSR support.

[Installation](#installation) • [Documentation](#api-reference) • [Examples](#basic-usage) • [GitHub](https://github.com/rodionbgd/ls-plus)

</div>

## Features

- 🚀 **Zero dependencies**
- 💾 **TypeScript** — generics on get/set
- ⏱️ **TTL** — `set(key, value, { ttl })`
- 🏷️ **Namespaces** — nested key prefixes
- 🌐 **SSR ready** — memory fallback when Web Storage is unavailable
- 📦 **Small** — under 2KB gzipped
- 🌳 **Tree-shakeable**

## Installation

```bash
npm install ls-plus
```

## Basic Usage

```typescript
import { createStorage } from 'ls-plus';

const storage = createStorage();

storage.set('user', { name: 'John', age: 30 });
const user = storage.get<{ name: string; age: number }>('user');

storage.remove('user');
storage.clear();

storage.has('user');
storage.keys();
```

## TTL

```typescript
import { createStorage } from 'ls-plus';

const storage = createStorage();

storage.set('session', { token: 'abc123' }, { ttl: 3600000 });

const session = storage.get('session');

const cleared = storage.clearExpired();
```

## Namespaces

```typescript
import { createStorage } from 'ls-plus';

const storage = createStorage();
const userStorage = storage.namespace('user');

userStorage.set('name', 'John');
userStorage.set('email', 'john@example.com');

const settingsStorage = userStorage.namespace('settings');
settingsStorage.set('theme', 'dark');

userStorage.clear();
```

## sessionStorage and custom adapters

```typescript
import { createStorage, createSessionStorage } from 'ls-plus';

const session = createSessionStorage();
session.set('tab', 'draft');

const storage = createStorage({
  storage: window.sessionStorage,
  prefix: 'my-app',
});
```

## Error Handling

```typescript
const value = storage.get('key');

try {
  storage.get('key', { strict: true });
} catch (error) {}
```

## SSR

```typescript
const storage = createStorage();
storage.set('key', 'value');
```

## API Reference

### `createStorage(options?: CreateStorageOptions): Storage`

| Option    | Type               | Description                                      |
| --------- | ------------------ | ------------------------------------------------ |
| `storage` | `Storage`          | Custom Web Storage (default: localStorage)       |
| `prefix`  | `string`           | Key prefix; `clear()` only removes prefixed keys |

### `createSessionStorage(options?: { prefix?: string }): Storage`

Same API, backed by `sessionStorage` (or memory fallback).

### `Storage`

- `get<T>(key, options?): T | null`
- `set<T>(key, value, options?: { ttl?: number; strict?: boolean }): boolean`
- `remove(key): boolean`
- `clear(): void` — owned or prefixed keys only
- `has(key): boolean`
- `keys(): string[]`
- `clearExpired(): number`
- `namespace(prefix): NamespacedStorage`

### `withNamespace(storage, prefix): NamespacedStorage`

## TypeScript

```typescript
interface User {
  name: string;
  age: number;
}

storage.set<User>('user', { name: 'John', age: 30 });
const retrieved = storage.get<User>('user');
```

## License

MIT
