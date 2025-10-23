"use client";

import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import AnswerComponent from "./AnswerComponent";
import type { Answer } from "@/app/lib/api/questions";

interface AnswersSectionProps {
  answers: Answer[];
  onUpdate: () => void;
}

export default function AnswersSection({
  answers,
  onUpdate,
}: AnswersSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Answers ({answers?.length || 0})
      </h2>

      {answers && answers.length > 0 ? (
        <div className="space-y-6">
          {answers.map((answer) => (
            <AnswerComponent
              key={answer._id}
              answer={answer as any}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No answers yet
          </h3>
        </div>
      )}
    </div>
  );
}
