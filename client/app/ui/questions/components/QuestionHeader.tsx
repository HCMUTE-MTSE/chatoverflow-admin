"use client";

import {
  UserIcon,
  ClockIcon,
  TagIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import UserAvatar from "@/app/ui/user-avatar";
import { renderTiptapContent } from "@/app/ui/tiptap-renderer";
import QuestionActions from "./QuestionActions";
import { formatTimeAgo } from "./utils";
import type { QuestionWithDetails } from "@/app/lib/api/questions";

interface QuestionHeaderProps {
  question: QuestionWithDetails & { isHidden?: boolean; hideReason?: string };
  onUpdate: () => void;
}

export default function QuestionHeader({
  question,
  onUpdate,
}: QuestionHeaderProps) {
  return (
    <div
      className={`border rounded-lg p-6 mb-6 ${
        question.isHidden ? "bg-red-50 border-red-200" : "bg-white"
      }`}
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        {question.title}
        {question.isHidden && (
          <span className="ml-3 px-3 py-1 text-sm bg-red-100 text-red-700 rounded">
            Hidden
          </span>
        )}
      </h1>

      {question.isHidden && question.hideReason && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded">
          <span className="font-medium text-red-800">Hidden reason:</span>
          <span className="text-red-700 ml-1">{question.hideReason}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <UserAvatar user={question.user} size="sm" />
          <span>{question.user?.name}</span>
        </div>
        <div className="flex items-center space-x-1">
          <ClockIcon className="w-4 h-4" />
          <span>Asked {formatTimeAgo(new Date(question.createdAt))}</span>
        </div>
        <div className="flex items-center space-x-1">
          <EyeIcon className="w-4 h-4" />
          <span>{question.views} views</span>
        </div>
      </div>

      {/* Tags */}
      {question.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <TagIcon className="w-4 h-4 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Link
                key={tag}
                href={`/dashboard/questions?tags=${tag}`}
                className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 hover:bg-blue-200"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Question Content */}
      <div className="mb-6">{renderTiptapContent(question.content)}</div>

      {/* Question Stats */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <ArrowUpIcon className="w-5 h-5 text-green-500" />
            <span className="text-green-600 font-medium">
              {question.upvotedBy.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowDownIcon className="w-5 h-5 text-red-500" />
            <span className="text-red-600 font-medium">
              {question.downvotedBy.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />
            <span className="text-blue-600 font-medium">
              {question.answers?.length} answers
            </span>
          </div>
        </div>
        <QuestionActions question={question} onUpdate={onUpdate} />
      </div>
    </div>
  );
}
