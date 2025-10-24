"use client";

import { useState } from "react";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/outline";
import HideContentModal from "@/app/ui/hide-content-modal";
import { ToastContainer, ToastProps } from "@/app/ui/toast";
import { useAuth } from "@/app/hooks/useAuth";

interface ContentActionsProps {
  contentId: string;
  contentType: "question" | "answer" | "reply";
  contentTitle?: string;
  authorEmail?: string;
  isHidden?: boolean;
  className?: string;
}

export default function ContentActions({
  contentId,
  contentType,
  contentTitle,
  authorEmail,
  isHidden = false,
  className = "",
}: ContentActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const { accessToken } = useAuth();

  const addToast = (toast: Omit<ToastProps, "id" | "onRemove">) => {
    const id = Date.now().toString();
    const newToast: ToastProps = {
      ...toast,
      id,
      onRemove: removeToast,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleHideContent = async (reason: string, sendEmail: boolean) => {
    if (!accessToken) {
      throw new Error("No access token available. Please login again.");
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/${contentType}s/${contentId}/hide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason,
          sendEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to hide ${contentType} (${response.status})`
        );
      }

      addToast({
        type: "success",
        title: "Success!",
        message: `${
          contentType.charAt(0).toUpperCase() + contentType.slice(1)
        } has been hidden successfully.`,
      });

      // Refresh after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error hiding content:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnhideContent = async () => {
    if (!accessToken) {
      addToast({
        type: "error",
        title: "Error!",
        message: "No access token available. Please login again.",
      });
      return;
    }

    if (!confirm(`Are you sure you want to unhide this ${contentType}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/${contentType}s/${contentId}/unhide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to unhide ${contentType} (${response.status})`
        );
      }

      addToast({
        type: "success",
        title: "Success!",
        message: `${
          contentType.charAt(0).toUpperCase() + contentType.slice(1)
        } has been unhidden successfully.`,
      });

      // Refresh after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error unhiding content:", error);
      addToast({
        type: "error",
        title: "Error!",
        message:
          error instanceof Error
            ? error.message
            : `Failed to unhide ${contentType}. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        {isHidden ? (
          <button
            onClick={handleUnhideContent}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50"
            title={`Unhide ${contentType}`}
          >
            <EyeIcon className="w-3 h-3" />
            Unhide
          </button>
        ) : (
          <button
            onClick={() => setIsHideModalOpen(true)}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50"
            title={`Hide ${contentType}`}
          >
            <EyeSlashIcon className="w-3 h-3" />
            Hide
          </button>
        )}
      </div>

      {/* Hide Content Modal */}
      <HideContentModal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        onConfirm={handleHideContent}
        contentType={contentType}
        contentTitle={contentTitle}
        authorEmail={authorEmail}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </>
  );
}
