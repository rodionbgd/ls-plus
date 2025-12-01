import { describe, it, expect, beforeEach } from 'vitest';
import { createStorage } from '../../core/storage';

describe('Storage', () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage();
    storage.clear();
  });

  describe('Basic operations', () => {
    it('should set and get values', () => {
      storage.set('key', { name: 'test' });
      expect(storage.get('key')).toEqual({ name: 'test' });
    });

    it('should return null for non-existent keys', () => {
      expect(storage.get('non-existent')).toBeNull();
    });

    it('should remove values', () => {
      storage.set('key', 'value');
      expect(storage.get('key')).toBe('value');
      storage.remove('key');
      expect(storage.get('key')).toBeNull();
    });

    it('should clear all values', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');
      storage.clear();
      expect(storage.get('key1')).toBeNull();
      expect(storage.get('key2')).toBeNull();
    });

    it('should check if key exists', () => {
      expect(storage.has('key')).toBe(false);
      storage.set('key', 'value');
      expect(storage.has('key')).toBe(true);
    });

    it('should return all keys', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');
      const keys = storage.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });
  });

  describe('JSON serialization', () => {
    it('should serialize objects', () => {
      const obj = { name: 'test', count: 42 };
      storage.set('obj', obj);
      expect(storage.get('obj')).toEqual(obj);
    });

    it('should serialize arrays', () => {
      const arr = [1, 2, 3];
      storage.set('arr', arr);
      expect(storage.get('arr')).toEqual(arr);
    });

    it('should serialize primitives', () => {
      storage.set('string', 'text');
      storage.set('number', 42);
      storage.set('boolean', true);
      storage.set('null', null);

      expect(storage.get('string')).toBe('text');
      expect(storage.get('number')).toBe(42);
      expect(storage.get('boolean')).toBe(true);
      expect(storage.get('null')).toBeNull();
    });

    it('should handle special values', () => {
      storage.set('nan', NaN);
      storage.set('infinity', Infinity);
      expect(storage.get('nan')).toBeNull();
      expect(storage.get('infinity')).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should return null for invalid JSON in safe mode', () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('broken', 'not valid json{');
        expect(storage.get('broken')).toBeNull();
        expect(storage.has('broken')).toBe(false);
      }
    });

    it('should throw error in strict mode for invalid JSON', () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('broken', 'not valid json{');
        expect(() => storage.get('broken', { strict: true })).toThrow();
      }
    });

    it('should return false for serialization errors in safe mode', () => {
      interface Circular {
        name: string;
        self?: Circular;
      }
      const circular: Circular = { name: 'test' };
      circular.self = circular;

      const result = storage.set('circular', circular);
      expect(result).toBe(false);
    });

    it('should throw error in strict mode for serialization errors', () => {
      interface Circular {
        name: string;
        self?: Circular;
      }
      const circular: Circular = { name: 'test' };
      circular.self = circular;

      expect(() => storage.set('circular', circular, { strict: true })).toThrow();
    });
  });

  describe('TypeScript generics', () => {
    it('should preserve types with generics', () => {
      interface User {
        name: string;
        age: number;
      }

      const user: User = { name: 'John', age: 30 };
      storage.set<User>('user', user);
      const retrieved = storage.get<User>('user');

      expect(retrieved).toEqual(user);
      if (retrieved) {
        expect(retrieved.name).toBe('John');
        expect(retrieved.age).toBe(30);
      }
    });
  });
});
