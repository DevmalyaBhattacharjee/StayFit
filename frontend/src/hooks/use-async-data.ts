import { useCallback, useEffect, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: unknown;
}

interface UseAsyncDataResult<T> extends AsyncState<T> {
  /** Re-runs `fetcher`, e.g. after a retry click or a successful mutation. */
  refetch: () => void;
}

/**
 * Runs `fetcher` on mount and whenever an entry in `deps` changes (e.g. a page
 * number). Callers intentionally pass a fresh closure each render — only
 * `deps` (and `refetch()`) control when it actually re-runs.
 */
function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseAsyncDataResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, isLoading: true, error: null });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, isLoading: true, error: null });

    fetcher()
      .then((data) => {
        if (!cancelled) {
          setState({ data, isLoading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ data: null, isLoading: false, error });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run is controlled by `deps` + `refetch()`, not the fetcher identity
  }, [...deps, reloadToken]);

  const refetch = useCallback(() => setReloadToken((n) => n + 1), []);

  return { ...state, refetch };
}

export { useAsyncData };
export type { AsyncState, UseAsyncDataResult };
