# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-11-18

### Added

- `createStorage({ storage?, prefix? })`
- `createSessionStorage()`
- `set(key, value, { ttl })` with envelope under the same key
- `clearExpired()` on `Storage`

### Changed

- `clear()` removes only owned or prefixed keys
- Enabled tsup minify and `sideEffects: false`

### Removed

- `withTTL`, `setTTL`, `getTTL`, `TTLStorage`
- `__ttl__` key prefix

## [0.0.2] - 2025-12-01

### Added

- Initial public API: `createStorage`, `withTTL`, `withNamespace`
