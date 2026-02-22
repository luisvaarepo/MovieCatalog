import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Next.js Link to avoid act() warnings from next/link during tests
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ href, children, ...props }: any) => {
      // If children is a plain string or number, render a plain anchor
      if (typeof children === 'string' || typeof children === 'number') {
        return React.createElement('a', { href, ...props }, children as any);
      }
      // When children is an element, clone it and pass props/href through
      try {
        return React.cloneElement(children as any, { href, ...props });
      } catch (e) {
        return React.createElement('a', { href, ...props }, children as any);
      }
    }
  };
});

// mock localStorage for tests
class LocalStorageMock {
  store: Record<string, string> = {};
  clear() { this.store = {}; }
  getItem(key: string) { return this.store[key] ?? null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
}

if (!globalThis.localStorage) {
  // @ts-ignore
  globalThis.localStorage = new LocalStorageMock();
}
