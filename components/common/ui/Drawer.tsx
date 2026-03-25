'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';

import type { ReactNode } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Drawer (volet latéral) — glisse depuis la droite sur desktop, plein écran sur mobile.
 * Le contenu de la page reste visible en arrière-plan.
 */
export default function Drawer({ isOpen, onClose, children }: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            style={{ marginBottom: 0 }} // fix space under the backdrop (reason unknown)
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-60"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 right-0 z-60 w-full lg:w-[760px] bg-gray-50 dark:bg-gray-900 overflow-y-auto shadow-2xl"
          >
            <div className="p-4 sm:p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
