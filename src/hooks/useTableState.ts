import { useCallback, useState } from 'react';

interface TableState {
  query: string;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
  page: number;
}

const DEFAULT_STATE: TableState = { query: '', sortBy: null, sortOrder: 'asc', page: 1 };

function readStored(key: string): TableState {
  try {
    const raw = localStorage.getItem(`admin-table:${key}`);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<TableState>;
    return {
      query: typeof parsed.query === 'string' ? parsed.query : '',
      sortBy: typeof parsed.sortBy === 'string' ? parsed.sortBy : null,
      sortOrder: parsed.sortOrder === 'desc' ? 'desc' : 'asc',
      page: typeof parsed.page === 'number' && parsed.page > 0 ? parsed.page : 1,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

/**
 * Persists table query / sort / page per table key in localStorage.
 * Reuses existing DataTable sort props — no new table system.
 */
export function useTableState(key: string) {
  const [state, setState] = useState<TableState>(() => readStored(key));

  const update = useCallback(
    (patch: Partial<TableState>) => {
      setState((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(`admin-table:${key}`, JSON.stringify(next));
        } catch {
          // ignore quota errors
        }
        return next;
      });
    },
    [key]
  );

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    try {
      localStorage.removeItem(`admin-table:${key}`);
    } catch {
      // ignore
    }
  }, [key]);

  return { ...state, update, reset };
}
