"use client";

import { useState } from "react";
import { EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/app/hooks/useAuth";
import HideContentModal from "../hide-content-modal";
import { extractTextFromJsonContent } from "@/app/ui/tiptap-renderer";
import type { Answer } from "@/app/lib/api/questions";

interface AnswerActionsProps {
  answer: Answer & { isHidden?: boolean; hideReason?: string };
  onUpdate: () => void;
}

export default function AnswerActions({
  answer,
  onUpdate,
}: AnswerActionsProps) {
  const { accessToken, user } = useAuth();
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleHide = async (reason: string, sendEmail: boolean) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/questions/answers/${answer._id}/hide`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ reason, sendEmail }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to hide answer");
      }

      const data = await response.json();
      alert(data.message || "Answer hidden successfully");
      onUpdate();
    } catch (error: any) {
      console.error("Error hiding answer:", error);
      alert(error.message || "Failed to hide answer");
    } finally {
      setLoading(false);
      setIsHideModalOpen(false);
    }
  };

  const handleUnhide = async () => {
    if (!confirm("Are you sure you want to unhide this answer?")) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/questions/answers/${answer._id}/unhide`,
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
        console.error("Failed to unhide answer:", errorData);
        throw new Error(errorData.message || "Failed to unhide answer");
      }

      const data = await response.json();
      alert(data.message || "Answer unhidden successfully");
      onUpdate();
    } catch (error: any) {
      console.error("Error unhiding answer:", error);
      alert(error.message || "Failed to unhide answer");
    } finally {
      setLoading(false);
    }
  };

  const getContentPreview = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      const text = extractTextFromJsonContent(parsed);
      return text.length > 100 ? text.substring(0, 100) + "..." : text;
    } catch {
      return content.length > 100 ? content.substring(0, 100) + "..." : content;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {answer.isHidden ? (
        <button
          onClick={handleUnhide}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 text-sm rounded-md border border-green-300 text-green-600 hover:bg-green-50 disabled:opacity-50"
          title={`Unhide answer${
            answer.hideReason ? ` (Hidden for: ${answer.hideReason})` : ""
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
          title="Hide answer"
        >
          <EyeSlashIcon className="w-4 h-4" />
          Hide
        </button>
      )}

      <HideContentModal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        onHide={handleHide}
        contentType="answer"
        contentTitle={getContentPreview(answer.content)}
        authorEmail={answer.user?.email}
        loading={loading}
      />
    </div>
  );
}
