"use client";

import { useState } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import UserAvatar from "@/app/ui/user-avatar";
import { renderTiptapContent } from "@/app/ui/tiptap-renderer";
import AnswerActions from "./AnswerActions";
import ReplyComponent from "./ReplyComponent";
import { formatTimeAgo } from "./utils";
import type { Answer } from "@/app/lib/api/questions";

interface AnswerComponentProps {
  answer: Answer & { isHidden?: boolean; hideReason?: string };
  onUpdate: () => void;
}

export default function AnswerComponent({
  answer,
  onUpdate,
}: AnswerComponentProps) {
  const [showReplies, setShowReplies] = useState(false);
  const hasReplies = answer.replies && answer.replies.length > 0;

  // Debug: Log reply data
  console.log(
    `Answer ${answer._id} has ${answer.replies?.length || 0} replies:`,
    answer.replies
  );

  return (
    <div
      className={`border rounded-lg p-6 mb-6 ${
        answer.isHidden ? "bg-red-50 border-red-200" : "bg-white"
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <UserAvatar user={answer.user} size="lg" />
        </div>
        <div className="flex-grow">
          <div className="flex items-center space-x-2 mb-3">
            <p className="font-medium text-gray-900">{answer.user?.name}</p>
            <span className="text-gray-500">•</span>
            <p className="text-sm text-gray-500">
              {formatTimeAgo(new Date(answer.createdAt))}
            </p>
            {answer.isHidden && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                Hidden
              </span>
            )}
          </div>

          {answer.isHidden && answer.hideReason && (
            <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded text-sm">
              <span className="font-medium text-red-800">Hidden reason:</span>
              <span className="text-red-700 ml-1">{answer.hideReason}</span>
            </div>
          )}

          <div className="mb-4">{renderTiptapContent(answer.content)}</div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <ArrowUpIcon className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">
                  {answer.upvoteCount || answer.upvotedBy?.length || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowDownIcon className="w-5 h-5 text-red-500" />
                <span className="text-red-600 font-medium">
                  {answer.downvoteCount || answer.downvotedBy?.length || 0}
                </span>
              </div>
              {/* Always show replies button for debugging */}
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>{answer.replies?.length || 0} replies</span>
                {showReplies ? (
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                )}
              </button>
            </div>
            <AnswerActions answer={answer} onUpdate={onUpdate} />
          </div>
        </div>
      </div>

      {showReplies && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium text-gray-900 mb-4">
            Replies ({answer.replies?.length || 0})
          </h4>
          {hasReplies ? (
            answer.replies?.map((reply) => (
              <ReplyComponent
                key={reply._id}
                reply={reply}
                onUpdate={onUpdate}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No replies yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
