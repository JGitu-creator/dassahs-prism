'use client';

import { useEffect, useRef } from 'react';

/**
 * Allows closing Neural Command / Neural Identity modals by:
 * 1) Pressing Escape, OR
 * 2) Typing the word "engage" anywhere while the modal is open (when not typing inside an input/textarea/select).
 */
export function useEngageShortcut(isOpen: boolean, onClose: () => void) {
  const bufferRef = useRef('');
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      bufferRef.current = '';
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (
        tagName === 'input'
        || tagName === 'textarea'
        || tagName === 'select'
        || target?.isContentEditable
      ) {
        return;
      }

      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(-6);
        if (bufferRef.current === 'engage') {
          bufferRef.current = '';
          onCloseRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
}
