"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "warning";
  title: string;
  message?: string;
  duration?: number;
  onRemove: (id: string) => void;
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onRemove,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const icons = {
    success: CheckCircleIcon,
    error: ExclamationTriangleIcon,
    warning: ExclamationTriangleIcon,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-900",
    error: "bg-red-50 border-red-200 text-red-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
  };

  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
  };

  const Icon = icons[type];

  return (
    <div
      className={`w-[400px] max-w-[90vw] shadow-lg rounded-lg pointer-events-auto border ${colors[type]} p-4`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${iconColors[type]}`} />
        </div>
        <div className="ml-3 flex-1 min-w-0 break-words">
          <p className="text-sm font-semibold leading-5">{title}</p>
          {message && (
            <p className="mt-1 text-sm opacity-90 leading-5 break-words whitespace-pre-wrap">
              {message}
            </p>
          )}
        </div>
        <div className="ml-3 flex-shrink-0">
          <button
            onClick={() => onRemove(id)}
            className="rounded-md inline-flex hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 flex flex-col items-end">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
