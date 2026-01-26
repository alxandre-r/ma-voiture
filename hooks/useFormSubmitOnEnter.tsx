/**
 * @file hooks/useFormSubmitOnEnter.tsx
 * @description Custom hook to handle form submission on Enter key press.
 *
 * This hook provides a convenient way to add Enter key support to any form input.
 */

import { useEffect } from 'react';

/**
 * Custom hook to handle form submission on Enter key press.
 *
 * @param {React.RefObject<HTMLInputElement>} inputRef - Ref to the input element
 * @param {() => void} onSubmit - Function to call when Enter is pressed
 * @param {boolean} disabled - Whether the form submission is disabled
 */
export const useFormSubmitOnEnter = (
  inputRef: React.RefObject<HTMLInputElement>,
  onSubmit: () => void,
  disabled: boolean = false
) => {
  useEffect(() => {
    const inputElement = inputRef.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !disabled) {
        event.preventDefault();
        onSubmit();
      }
    };

    if (inputElement) {
      inputElement.addEventListener('keydown', handleKeyDown);

      return () => {
        inputElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [inputRef, onSubmit, disabled]);
};