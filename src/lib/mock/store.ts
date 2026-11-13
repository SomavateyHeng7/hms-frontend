/**
 * In-browser mock database for the prototype (roadmap Phase 1, F2).
 *
 * Each module keeps its sample records in a collection that is seeded from typed sample
 * data and saved to localStorage, so a demo survives a page refresh. Services wrap these
 * collections; components never touch them directly. When a real API exists, the service
 * changes and the collection goes away.
 *
 * Storage can be unavailable (private windows, blocked site data), so every read and write
 * falls back to memory.
 */

const STORAGE_PREFIX = "hms-demo:";
/** Bump to discard everyone's saved demo data after a breaking change to sample data. */
const STORAGE_VERSION = 1;

export interface MockCollection<T extends { id: string }> {
  all(): T[];
  get(id: string): T | undefined;
  find(predicate: (item: T) => boolean): T | undefined;
  insert(item: T): T;
  update(id: string, changes: Partial<T>): T | undefined;
  remove(id: string): boolean;
  /** Restore the original sample data. */
  reset(): void;
}

function storageKey(name: string) {
  return `${STORAGE_PREFIX}v${STORAGE_VERSION}:${name}`;
}

function readStorage(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  } catch {
    // Storage full or blocked: keep working from memory.
  }
}

/**
 * @param name   unique collection name, e.g. "patients"
 * @param seed   sample records used on first load and on reset
 * @param revive converts a record read back from JSON (e.g. ISO strings back to Date)
 */
export function createMockCollection<T extends { id: string }>(
  name: string,
  seed: () => T[],
  revive: (raw: T) => T = (raw) => raw
): MockCollection<T> {
  const key = storageKey(name);
  let items: T[] | null = null;

  const load = (): T[] => {
    if (items) return items;
    const saved = readStorage(key);
    if (saved) {
      try {
        items = (JSON.parse(saved) as T[]).map(revive);
        return items;
      } catch {
        // Corrupt saved data: fall back to the seed.
      }
    }
    items = seed();
    return items;
  };

  const save = () => writeStorage(key, JSON.stringify(items));

  return {
    all: () => [...load()],
    get: (id) => load().find((item) => item.id === id),
    find: (predicate) => load().find(predicate),
    insert(item) {
      items = [...load(), item];
      save();
      return item;
    },
    update(id, changes) {
      let updated: T | undefined;
      items = load().map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...changes };
        return updated;
      });
      if (updated) save();
      return updated;
    },
    remove(id) {
      const before = load().length;
      items = load().filter((item) => item.id !== id);
      if (items.length === before) return false;
      save();
      return true;
    },
    reset() {
      items = seed();
      save();
    },
  };
}

/** Simulated network latency so loading states are visible in demos. */
export const mockDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export class ServiceUnavailableError extends Error {
  constructor(system: string) {
    super(`${system} is not reachable right now.`);
    this.name = "ServiceUnavailableError";
  }
}

/**
 * Demo scenario switch read from the URL, e.g. `?patients=offline` or `?patients=empty`,
 * so edge cases can be shown during a walkthrough.
 */
export function demoScenario(param: string): "offline" | "empty" | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(param);
  return value === "offline" || value === "empty" ? value : null;
}

/** Removes every saved demo collection, returning the prototype to its sample data. */
export function resetAllDemoData() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Nothing saved, or storage blocked.
  }
}
