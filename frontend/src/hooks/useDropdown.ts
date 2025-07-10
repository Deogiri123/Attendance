import { useState } from 'react';

interface UseDropdownReturn {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const useDropdown = (): UseDropdownReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  return { isOpen, toggle, close };
};