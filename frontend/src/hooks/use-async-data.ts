import { useEffect, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: unknown;
}

/** Runs `fetcher` once on mount. Callers intentionally pass a fresh closure each render. */
function useAsyncData<T>(fetcher: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, isLoading: true, error: null });

  useEffect(() => {
    let cancelled = false;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch-once-on-mount by design
  }, []);

  return state;
}

export { useAsyncData };
export type { AsyncState };
