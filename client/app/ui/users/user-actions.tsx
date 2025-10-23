"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { PencilIcon } from "@heroicons/react/24/outline";
import EditUserModal from "@/app/ui/users/edit-modal";
import { ToastContainer, ToastProps } from "@/app/ui/toast";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const { data: session } = useSession();

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
      const token = (session as any)?.accessToken;
      console.log("token", token);
      if (!token) {
        throw new Error("No access token available. Please login again.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

  return (
    <>
      <div className={`flex justify-end gap-2 ${className}`}>
        <button
          onClick={handleEdit}
          disabled={isLoading}
          className="rounded-md border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-50"
          title="Edit user"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Modal */}
      <EditUserModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </>
  );
}
