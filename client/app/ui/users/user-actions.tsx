"use client";

import { useState } from "react";

import {
  PencilIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import EditUserModal from "@/app/ui/users/edit-modal";
import BanUserModal from "@/app/ui/users/ban-user-modal";
import { ToastContainer, ToastProps } from "@/app/ui/toast";
import { useAuth } from "@/app/hooks/useAuth";

interface User {
  _id: string;
  name: string;
  nickName?: string;
  email: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: {
    province?: string;
    ward?: string;
    street?: string;
  };
  gender: "male" | "female" | "other";
  role: "admin" | "user";
  status: "active" | "inactive" | "banned" | "pending";
  banReason?: string;
  bannedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserActionsProps {
  user: User;
  className?: string;
}

export default function UserActions({
  user,
  className = "",
}: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

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

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (userId: string, userData: Partial<User>) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available. Please login again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to update user (${response.status})`
        );
      }

      const updatedUser = await response.json();
      console.log("User updated successfully:", updatedUser);

      // Show success toast
      addToast({
        type: "success",
        title: "Success!",
        message: "User updated successfully.",
      });

      // Close modal
      setIsEditModalOpen(false);

      // Refresh the page to show updated data after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Error updating user:", err);

      // Show error toast
      addToast({
        type: "error",
        title: "Error!",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update user. Please try again.",
      });

      throw err; // Re-throw so the modal can handle loading state
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  const handleBan = async (
    reason: string,
    sendEmail: boolean,
    banDuration?: number
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${user._id}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason, sendEmail, banDuration }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to ban user");
      }

      const data = await response.json();

      addToast({
        type: "success",
        title: "Success!",
        message: data.message || "User banned successfully",
      });

      // Refresh the page to show updated data after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Error banning user:", error);
      addToast({
        type: "error",
        title: "Error!",
        message: error.message || "Failed to ban user",
      });
      throw error; // Re-throw to let modal handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!confirm(`Are you sure you want to unban ${user.name}?`)) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${user._id}/unban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ sendEmail: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unban user");
      }

      const data = await response.json();

      addToast({
        type: "success",
        title: "Success!",
        message: data.message || "User unbanned successfully",
      });

      // Refresh the page to show updated data after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Error unbanning user:", error);
      addToast({
        type: "error",
        title: "Error!",
        message: error.message || "Failed to unban user",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`flex justify-end gap-2 ${className}`}>
        {/* Edit Button */}
        <button
          onClick={handleEdit}
          disabled={isLoading}
          className="rounded-md border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-50"
          title="Edit user"
        >
          <PencilIcon className="w-4 h-4" />
        </button>

        {/* Ban/Unban Actions - Don't show for admin users */}
        {user.role !== "admin" && (
          <>
            {user.status === "banned" ? (
              <button
                onClick={handleUnban}
                disabled={isLoading}
                className="rounded-md border border-green-300 p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                title={`Unban user${
                  user.banReason ? ` (Banned for: ${user.banReason})` : ""
                }`}
              >
                <CheckCircleIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsBanModalOpen(true)}
                disabled={isLoading}
                className="rounded-md border border-red-300 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                title="Ban user"
              >
                <NoSymbolIcon className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* Admin indicator */}
        {user.role === "admin" && (
          <div className="flex items-center text-xs text-gray-500 px-2">
            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
            Admin
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditUserModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />

      {/* Ban Modal */}
      <BanUserModal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        onBan={handleBan}
        userName={user.name}
        userEmail={user.email}
        loading={isLoading}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </>
  );
}
