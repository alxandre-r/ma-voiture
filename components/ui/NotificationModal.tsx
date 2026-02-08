"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface NotificationModalProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose: () => void;
}

const variants = {
  initial: { opacity: 0, x: 80, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 80, scale: 0.95 },
};

const palette = {
  success: "border-green-500",
  error: "border-red-500",
  warning: "border-yellow-500",
  info: "border-gray-400",
};

export default function NotificationModal({
  message,
  type = "info",
  duration = 6000,
  onClose,
}: NotificationModalProps) {
  const [visible, setVisible] = useState(true);

  // auto-dismiss
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence onExitComplete={onClose}>
      {visible && (
        <motion.div
          layout
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div
            className={`rounded-xl border ${palette[type]} bg-white dark:bg-gray-900 shadow-lg`}
          >
            <div className="flex items-start gap-3 p-6 min-w-[280px] max-w-sm">
              <p className="flex-1 text-sm text-gray-800 dark:text-white">
                {message}
              </p>

              <button
                onClick={() => setVisible(false)}
                className="text-gray-800 hover:text-gray-600 dark:hover:text-white hover:cursor-pointer transition-opacity"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}