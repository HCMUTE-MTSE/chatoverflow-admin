"use client";

import { useState } from "react";
import { EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/app/hooks/useAuth";
import HideContentModal from "../hide-content-modal";
import type { QuestionWithDetails } from "@/app/lib/api/questions";

interface QuestionActionsProps {
  question: QuestionWithDetails & { isHidden?: boolean; hideReason?: string };
  onUpdate: () => void;
}

export default function QuestionActions({
  question,
  onUpdate,
}: QuestionActionsProps) {
  const { accessToken, user } = useAuth();
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleHide = async (reason: string, sendEmail: boolean) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/questions/${question._id}/hide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason, sendEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to hide question");
      }

      const data = await response.json();
      alert(data.message || "Question hidden successfully");
      onUpdate();
    } catch (error: any) {
      console.error("Error hiding question:", error);
      alert(error.message || "Failed to hide question");
    } finally {
      setLoading(false);
      setIsHideModalOpen(false);
    }
  };

  const handleUnhide = async () => {
    if (!confirm("Are you sure you want to unhide this question?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/questions/${question._id}/unhide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to unhide question");
      }

      const data = await response.json();
      alert(data.message || "Question unhidden successfully");
      onUpdate();
    } catch (error: any) {
      console.error("Error unhiding question:", error);
      alert(error.message || "Failed to unhide question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {question.isHidden ? (
        <button
          onClick={handleUnhide}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1 text-sm rounded-md border border-green-300 text-green-600 hover:bg-green-50 disabled:opacity-50"
          title={`Unhide question${
            question.hideReason ? ` (Hidden for: ${question.hideReason})` : ""
          }`}
        >
          <EyeSlashIcon className="w-4 h-4" />
          Unhide Question
        </button>
      ) : (
        <button
          onClick={() => setIsHideModalOpen(true)}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
          title="Hide question"
        >
          <EyeSlashIcon className="w-4 h-4" />
          Hide Question
        </button>
      )}

      <HideContentModal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        onHide={handleHide}
        contentType="question"
        contentTitle={question.title}
        authorEmail={(question.user as any)?.email}
        loading={loading}
      />
    </div>
  );
}
