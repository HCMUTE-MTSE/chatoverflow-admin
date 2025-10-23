"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchQuestionDetails,
  incrementQuestionViews,
  type QuestionWithDetails,
} from "@/app/lib/api/questions";
import { Breadcrumb, QuestionHeader, AnswersSection } from "./components";

export default function QuestionDetail({
  id,
  includeReplies = true,
}: {
  id: string;
  includeReplies?: boolean;
}) {
  const [question, setQuestion] = useState<QuestionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestion() {
      try {
        setLoading(true);
        includeReplies = true;
        const questionData = await fetchQuestionDetails({ id, includeReplies });
        console.log("=== Question Detail Debug ===");
        console.log("Fetched question data:", questionData);
        console.log("includeReplies:", includeReplies);
        console.log("Answers count:", questionData.answers?.length);
        console.log(
          "Answers with replies:",
          questionData.answers?.map((answer) => ({
            answerId: answer._id,
            content: answer.content.substring(0, 50) + "...",
            repliesCount: answer.replies?.length || 0,
            hasRepliesArray: !!answer.replies,
            repliesData: answer.replies,
          }))
        );
        setQuestion(questionData);

        // Increment view count
        // await incrementQuestionViews(id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load question"
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuestion();
  }, [id, includeReplies]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-32 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-semibold mb-2">
          {error || "Question not found"}
        </div>
        <Link
          href="/dashboard/questions"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Questions
        </Link>
      </div>
    );
  }

  const handleUpdate = () => {
    // Reload question data to refresh the page
    setQuestion(null);
    setLoading(true);
    fetchQuestionDetails({ id, includeReplies: true })
      .then(setQuestion)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb questionTitle={question.title} />

      {/* Question Header */}
      <QuestionHeader question={question as any} onUpdate={handleUpdate} />

      {/* Answers Section */}
      <AnswersSection
        answers={question.answers || []}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
