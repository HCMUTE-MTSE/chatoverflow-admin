"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import HideContentModal from "./hide-content-modal";

interface Question {
  _id: string;
  title: string;
  isHidden?: boolean;
  hideReason?: string;
}

interface QuestionActionsProps {
  question: Question;
  onUpdate: () => void;
}

export default function QuestionActions({
  question,
  onUpdate,
}: QuestionActionsProps) {
  const { accessToken, isAuthenticated, isLoading } = useAuth();
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    if (!confirm("Are you sure you want to unhide this question?")) {
      return;
    }

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
    <div className="flex justify-end gap-2">
      <button
        onClick={() =>
          window.open(`/dashboard/questions/${question._id}`, "_blank")
        }
        className="rounded-md border p-2 hover:bg-gray-100"
        title="View question"
      >
        <EyeIcon className="w-4" />
      </button>

      {question.isHidden ? (
        <button
          onClick={handleUnhide}
          disabled={loading}
          className="rounded-md border p-2 hover:bg-green-50 text-green-600 border-green-300 disabled:opacity-50"
          title={`Unhide question${
            question.hideReason ? ` (Hidden for: ${question.hideReason})` : ""
          }`}
        >
          <EyeSlashIcon className="w-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsHideModalOpen(true)}
          disabled={loading}
          className="rounded-md border p-2 hover:bg-red-50 text-red-600 border-red-300 disabled:opacity-50"
          title="Hide question"
        >
          <EyeSlashIcon className="w-4" />
        </button>
      )}

      <HideContentModal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        onHide={handleHide}
        contentType="question"
        contentTitle={question.title}
        loading={loading}
      />
    </div>
  );
}
