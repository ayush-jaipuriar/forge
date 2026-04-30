import '@testing-library/jest-dom/vitest'
import {
  IDBCursor,
  IDBCursorWithValue,
  IDBDatabase,
  IDBFactory,
  IDBIndex,
  IDBKeyRange,
  IDBObjectStore,
  IDBOpenDBRequest,
  IDBRequest,
  IDBTransaction,
  IDBVersionChangeEvent,
  indexedDB,
} from 'fake-indexeddb'
import { vi } from 'vitest'

const indexedDbGlobals = {
  indexedDB,
  IDBCursor,
  IDBCursorWithValue,
  IDBDatabase,
  IDBFactory,
  IDBIndex,
  IDBKeyRange,
  IDBObjectStore,
  IDBOpenDBRequest,
  IDBRequest,
  IDBTransaction,
  IDBVersionChangeEvent,
}

for (const [key, value] of Object.entries(indexedDbGlobals)) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  })
}

Object.defineProperty(globalThis, 'self', {
  configurable: true,
  writable: true,
  value: globalThis,
})

vi.stubGlobal('self', globalThis)

Object.defineProperty(window, 'self', {
  configurable: true,
  writable: true,
  value: window,
})

for (const [key, value] of Object.entries(indexedDbGlobals)) {
  Object.defineProperty(window, key, {
    configurable: true,
    writable: true,
    value,
  })
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }),
})
