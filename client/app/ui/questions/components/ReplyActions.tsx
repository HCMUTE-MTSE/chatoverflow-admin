"use client";

import { useState } from "react";
import { EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/app/hooks/useAuth";
import HideContentModal from "../hide-content-modal";
import type { Reply } from "@/app/lib/api/questions";

interface ReplyActionsProps {
  reply: Reply & { isHidden?: boolean; hideReason?: string };
  onUpdate: () => void;
}

export default function ReplyActions({ reply, onUpdate }: ReplyActionsProps) {
  const { accessToken, user } = useAuth();
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleHide = async (reason: string, sendEmail: boolean) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/questions/replies/${reply._id}/hide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason, sendEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to hide reply");
      }

      const data = await response.json();
      alert(data.message || "Reply hidden successfully");
      onUpdate();
    } catch (error: any) {
      console.error("Error hiding reply:", error);
      alert(error.message || "Failed to hide reply");
    } finally {
      setLoading(false);
      setIsHideModalOpen(false);
    }
  };

  const handleUnhide = async () => {
    if (!confirm("Are you sure you want to unhide this reply?")) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/questions/replies/${reply._id}/unhide`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to unhide reply");
      }

      const data = await response.json();
      alert(data.message || "Reply unhidden successfully");
      onUpdate();
    } catch (error: any) {
      console.error("Error unhiding reply:", error);
      alert(error.message || "Failed to unhide reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {reply.isHidden ? (
        <button
          onClick={handleUnhide}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 text-sm rounded-md border border-green-300 text-green-600 hover:bg-green-50 disabled:opacity-50"
          title={`Unhide reply${
            reply.hideReason ? ` (Hidden for: ${reply.hideReason})` : ""
          }`}
        >
          <EyeSlashIcon className="w-4 h-4" />
          Unhide
        </button>
      ) : (
        <button
          onClick={() => setIsHideModalOpen(true)}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
          title="Hide reply"
        >
          <EyeSlashIcon className="w-4 h-4" />
          Hide
        </button>
      )}

      <HideContentModal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        onHide={handleHide}
        contentType="reply"
        contentTitle={
          reply.content.length > 100
            ? reply.content.substring(0, 100) + "..."
            : reply.content
        }
        authorEmail={reply.user?.email}
        loading={loading}
      />
    </div>
  );
}
