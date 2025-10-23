"use client";

import { useState } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import UserAvatar from "@/app/ui/user-avatar";
import ReplyActions from "./ReplyActions";
import { formatTimeAgo } from "./utils";
import type { Reply } from "@/app/lib/api/questions";

interface ReplyComponentProps {
  reply: Reply;
  level?: number;
  onUpdate: () => void;
}

export default function ReplyComponent({
  reply,
  level = 0,
  onUpdate,
}: ReplyComponentProps) {
  const [showNested, setShowNested] = useState(false);
  const hasNestedReplies =
    reply.nestedReplies && reply.nestedReplies.length > 0;

  return (
    <div
      className={`border-l-2 ${
        (reply as any).isHidden ? "border-red-300 bg-red-50" : "border-gray-200"
      } ${level > 0 ? "ml-4" : "ml-0"}`}
    >
      <div className="pl-4 py-3">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <UserAvatar user={reply.user} size="sm" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center space-x-2 mb-2">
              <p className="font-medium text-sm text-gray-900">
                {reply.user?.name}
              </p>
              <span className="text-gray-500">•</span>
              <p className="text-xs text-gray-500">
                {formatTimeAgo(new Date(reply.createdAt))}
              </p>
              {(reply as any).isHidden && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                  Hidden
                </span>
              )}
            </div>

            {(reply as any).isHidden && (reply as any).hideReason && (
              <div className="mb-2 p-2 bg-red-100 border border-red-200 rounded text-xs">
                <span className="font-medium text-red-800">Hidden reason:</span>
                <span className="text-red-700 ml-1">
                  {(reply as any).hideReason}
                </span>
              </div>
            )}

            <div className="prose prose-sm max-w-none mb-3">
              <p className="text-gray-700">{reply.content}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <ArrowUpIcon className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">
                    {reply.upvoteCount || reply.upvotedBy?.length || 0}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowDownIcon className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">
                    {reply.downvoteCount || reply.downvotedBy?.length || 0}
                  </span>
                </div>
                {hasNestedReplies && (
                  <button
                    onClick={() => setShowNested(!showNested)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    {showNested ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                    <span>{reply.nestedReplies?.length || 0} replies</span>
                  </button>
                )}
              </div>
              <ReplyActions reply={reply as any} onUpdate={onUpdate} />
            </div>
          </div>
        </div>

        {showNested && hasNestedReplies && (
          <div className="mt-3">
            {reply.nestedReplies?.map((nestedReply) => (
              <ReplyComponent
                key={nestedReply._id}
                reply={nestedReply}
                level={level + 1}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
