"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/app/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteBlogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog?: {
    _id: string;
    title: string;
  };
  onSuccess?: () => void;
}

export function DeleteBlogDialog({
  open,
  onOpenChange,
  blog,
  onSuccess,
}: DeleteBlogDialogProps) {
  const { accessToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!accessToken || !blog) {
      toast.error("Authentication required", {
        description: "No access token or tag data available",
      });
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/${blog._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete tag");
      }

      toast.success("Blog deleted successfully!", {
        description: `${blog.title} has been removed`,
        duration: 3000,
      });

      onOpenChange(false);

      // Call onSuccess callback to reload data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog", {
        description:
          error instanceof Error ? error.message : "An error occurred",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the blog
            &quot;{blog?.title}&quot; and remove it from all questions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
