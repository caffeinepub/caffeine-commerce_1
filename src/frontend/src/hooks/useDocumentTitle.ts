import { useEffect } from 'react';

/**
 * Hook to update the document title dynamically
 * @param title - The title to set (falls back to "BISAULI" if not provided)
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const newTitle = title || 'BISAULI';
    document.title = newTitle;
  }, [title]);
}
