"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import HideContentModal from "./hide-content-modal";

interface Answer {
  _id: string;
  content: string;
  isHidden?: boolean;
  hideReason?: string;
  user?: {
    name: string;
    email: string;
  };
}

interface AnswerActionsProps {
  answer: Answer;
  onUpdate: () => void;
}

export default function AnswerActions({
  answer,
  onUpdate,
}: AnswerActionsProps) {
  const { accessToken } = useAuth();
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
    if (!confirm("Are you sure you want to unhide this answer?")) {
      return;
    }

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
      // Try to parse as JSON (Tiptap format)
      const parsed = JSON.parse(content);
      const text = extractTextFromTiptap(parsed);
      return text.length > 100 ? text.substring(0, 100) + "..." : text;
    } catch {
      // If not JSON, treat as plain text
      return content.length > 100 ? content.substring(0, 100) + "..." : content;
    }
  };

  const extractTextFromTiptap = (content: any): string => {
    if (!content || !content.content) return "";
    return content.content
      .map((node: any) => {
        if (node.type === "text") return node.text || "";
        if (node.content) return extractTextFromTiptap(node);
        return "";
      })
      .join("");
  };

  return (
    <div className="flex justify-end gap-2">
      {answer.isHidden ? (
        <button
          onClick={handleUnhide}
          disabled={loading}
          className="rounded-md border p-2 hover:bg-green-50 text-green-600 border-green-300 disabled:opacity-50"
          title={`Unhide answer${
            answer.hideReason ? ` (Hidden for: ${answer.hideReason})` : ""
          }`}
        >
          <EyeSlashIcon className="w-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsHideModalOpen(true)}
          disabled={loading}
          className="rounded-md border p-2 hover:bg-red-50 text-red-600 border-red-300 disabled:opacity-50"
          title="Hide answer"
        >
          <EyeSlashIcon className="w-4" />
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
