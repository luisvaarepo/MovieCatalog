import '@testing-library/jest-dom';

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
