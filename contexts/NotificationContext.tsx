"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import NotificationModal from "@/components/ui/NotificationModal";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const showNotification = (message: string, type: NotificationType, duration = 6000) => {
    setNotifications((prev) => [
      ...prev,
      { id: crypto.randomUUID(), message, type, duration },
    ]);
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess: (msg, dur) => showNotification(msg, "success", dur),
        showError: (msg, dur) => showNotification(msg, "error", dur),
        showInfo: (msg, dur) => showNotification(msg, "info", dur),
        showWarning: (msg, dur) => showNotification(msg, "warning", dur),
      }}
    >
      {children}

      {/* Notification stack container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 px-4 sm:px-0">
        {notifications.map((n) => (
          <NotificationModal
            key={n.id}
            message={n.message}
            type={n.type}
            duration={n.duration}
            onClose={() => removeNotification(n.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
}