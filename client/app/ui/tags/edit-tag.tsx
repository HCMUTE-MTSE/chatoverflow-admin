"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/app/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: {
    _id: string;
    name: string;
    displayName: string;
    description: string;
  };
  onSuccess?: () => void;
}

export function DialogEditTag({
  open,
  onOpenChange,
  tag,
  onSuccess,
}: DialogProps) {
  const { accessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!accessToken || !tag) {
      toast.error("Authentication required", {
        description: "No access token or tag data available",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const updateData = {
        displayName: formData.get("displayName") as string,
        description: formData.get("description") as string,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tags/${tag._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update tag");
      }

      toast.success("Tag updated successfully!", {
        description: "Your changes have been saved",
        duration: 3000,
      });

      onOpenChange(false);

      // Call onSuccess callback to reload data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      toast.error("Failed to update tag", {
        description:
          error instanceof Error ? error.message : "An error occurred",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
          <DialogDescription>
            Make changes to your tag here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input
                id="name-1"
                name="name"
                defaultValue={tag?.name || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="displayName-1">Display Name</Label>
              <Input
                id="displayName-1"
                name="displayName"
                defaultValue={tag?.displayName || ""}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description-1">Description</Label>
              <Textarea
                placeholder="Type description of tag"
                id="description-1"
                name="description"
                defaultValue={tag?.description || ""}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
