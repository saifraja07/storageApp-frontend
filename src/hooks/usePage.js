import { useCallback, useRef, useState } from "react";

/**
 * Current page number that snaps back to 1 whenever `resetKey` changes
 * (search, filter, sort, page size, opened directory...).
 *
 * The reset happens in the same render as the change, so the page is never
 * fetched with a mix of the new filters and the old page number (which would
 * cost a wasted request, or briefly show an out-of-range page).
 * `setPage` is stable.
 */
export function usePage(resetKey) {
  const [state, setState] = useState({ resetKey, page: 1 });
  if (state.resetKey !== resetKey) setState({ resetKey, page: 1 });
  const page = state.resetKey === resetKey ? state.page : 1;

  const resetKeyRef = useRef(resetKey);
  resetKeyRef.current = resetKey;
  const setPage = useCallback(
    (next) => setState({ resetKey: resetKeyRef.current, page: next }),
    [],
  );
  return [page, setPage];
}
