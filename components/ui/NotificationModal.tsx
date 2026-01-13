/**
 * @file components/ui/NotificationModal.tsx
 * @fileoverview Reusable notification modal component for CRUD operations.
 *
 * - Smooth progress using requestAnimationFrame
 * - Fade in / fade out with Tailwind transitions
 * - Respects parent-controlled `isOpen` and avoids double callbacks
 */

"use client";

import React, { useEffect, useRef, useState } from "react";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number; // ms to auto-dismiss
}

export default function NotificationModal({
  isOpen,
  onClose,
  message,
  type = "info",
  duration = 4000,
}: NotificationModalProps) {
  // Local UI state
  const [mounted, setMounted] = useState(false);      // whether to render the element
  const [fadingOut, setFadingOut] = useState(false);  // controls CSS fade
  const [progress, setProgress] = useState(0);        // 0..1

  // refs to manage RAF and closures
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const internalCloseRequestedRef = useRef(false); // to avoid double onClose calls
  const fadeMs = 300; // must match Tailwind transition duration used below

  // Colors / icons mapping
  const palette = {
    success: {
      bg: "bg-sky-600/95",
      border: "border-sky-500",
      text: "text-white",
      progress: "bg-sky-400",
      icon: "✅",
    },
    error: {
      bg: "bg-orange-600/95",
      border: "border-orange-500",
      text: "text-white",
      progress: "bg-orange-400",
      icon: "❌",
    },
    warning: {
      bg: "bg-yellow-600/95",
      border: "border-yellow-500",
      text: "text-white",
      progress: "bg-yellow-400",
      icon: "⚠️",
    },
    info: {
      bg: "bg-indigo-600/95",
      border: "border-indigo-500",
      text: "text-white",
      progress: "bg-indigo-400",
      icon: "ℹ️",
    },
  } as const;

  const colors = palette[type];

  // Start the progress animation using rAF
  const startProgress = () => {
    cancelRaf();
    setProgress(0);
    startRef.current = null;
    internalCloseRequestedRef.current = false;

    const step = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current!;
      const pct = Math.min(elapsed / Math.max(1, duration), 1);
      setProgress(pct);

      if (pct >= 1) {
        // completed: request internal close (if not already requested)
        internalCloseRequestedRef.current = true;
        // begin fade-out
        setFadingOut(true);
        // stop RAF
        cancelRaf();
        // after fade completes, unmount and call onClose
        setTimeout(() => {
          setMounted(false);
          // ensure we call onClose once: only call if parent didn't already close it
          try {
            onClose();
          } catch {
            /* ignore */
          }
        }, fadeMs);
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  };

  const cancelRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // When isOpen changes: open or parent-requested close
  useEffect(() => {
    if (isOpen) {
      // Open: mount, reset states, start progress
      setMounted(true);
      // small timeout to ensure mount -> allow CSS transitions for fade-in
      setTimeout(() => {
        setFadingOut(false);
      }, 10);
      startProgress();
    } else {
      // Parent requested close: if currently mounted and not already fading, fade then unmount
      if (mounted && !fadingOut) {
        cancelRaf();
        setFadingOut(true);
        // don't call onClose (parent already set isOpen=false)
        setTimeout(() => {
          setMounted(false);
        }, fadeMs);
      } else {
        // If not mounted, ensure everything cleared
        cancelRaf();
        setMounted(false);
        setFadingOut(false);
        setProgress(0);
      }
    }

    // cleanup if component unmounts
    return () => {
      cancelRaf();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Manual close handler (close button)
  const handleManualClose = () => {
    // Prevent duplicate close calls
    if (internalCloseRequestedRef.current) return;
    internalCloseRequestedRef.current = true;

    cancelRaf();
    setFadingOut(true);

    setTimeout(() => {
      setMounted(false);
      try {
        onClose();
      } catch {
        /* ignore */
      }
    }, fadeMs);
  };

  if (!mounted) return null;

  // CSS classes: fade-in/out controlled by fadingOut
  const containerTransition = `transform transition-all duration-300 ease-out`;
  const visibleClass = fadingOut ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0";

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-end justify-center px-4 pb-8">
      <div className="w-full max-w-md pointer-events-auto">
        <div
          role="status"
          aria-live="polite"
          className={`${colors.bg} ${colors.border} border rounded-xl shadow-2xl overflow-hidden ${containerTransition} ${visibleClass}`}
          style={{ transformOrigin: "center bottom" }}
        >
          {/* Progress bar */}
          <div className="h-1 w-full bg-black/5">
            <div
              className={`${colors.progress} h-full`}
              style={{ width: `${Math.round(progress * 100)}%`, transition: "width 120ms linear" }}
            />
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-xl">{colors.icon}</div>

              <div className="flex-1 min-w-0">
                <p className={`${colors.text} text-sm font-medium truncate`}>{message}</p>
              </div>

              <button
                onClick={handleManualClose}
                aria-label="Fermer la notification"
                className={`${colors.text} hover:opacity-80 transition-opacity text-sm font-medium`}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}