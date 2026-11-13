"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type QueryState<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "error"; data?: undefined; error: string }
  | { status: "success"; data: T; error?: undefined };

/**
 * Loads data from a service call and tracks loading / error / success.
 *
 * `key` identifies what is being loaded (e.g. a patient id); when it changes the call runs
 * again. `reload()` fetches again while keeping current data on screen and resolves once the
 * new data is in state, so callers can `await` it before navigating. `retry()` shows the
 * loading state first (use it from an error state).
 */
export function useServiceQuery<T>(key: string, load: () => Promise<T>) {
  const [state, setState] = useState<QueryState<T>>({ status: "loading" });
  const [trackedKey, setTrackedKey] = useState(key);
  const latestRequest = useRef(0);

  // A new key means new data: show loading instead of the previous record.
  if (trackedKey !== key) {
    setTrackedKey(key);
    setState({ status: "loading" });
  }

  const fetchData = useCallback(async (fn: () => Promise<T>) => {
    const request = ++latestRequest.current;
    try {
      const data = await fn();
      if (request === latestRequest.current) setState({ status: "success", data });
    } catch (err) {
      if (request === latestRequest.current) {
        setState({ status: "error", error: err instanceof Error ? err.message : "Something went wrong." });
      }
    }
  }, []);

  useEffect(() => {
    void fetchData(load);
    // Ignore results that arrive after the key changed or the component unmounted.
    return () => {
      // A counter, not a DOM ref: bumping it is exactly how stale responses are ignored.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      latestRequest.current++;
    };
    // `load` is intentionally not a dependency: callers pass an inline function, and the key
    // already captures when the data must be fetched again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fetchData]);

  const reload = () => fetchData(load);
  const retry = () => {
    setState({ status: "loading" });
    return fetchData(load);
  };

  return { ...state, reload, retry };
}
