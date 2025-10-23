"use client";

import { useEffect, useState } from "react";
import {
  fetchQuestionDetails,
  incrementQuestionViews,
  type QuestionWithDetails,
  type Answer,
  type Reply,
} from "@/app/lib/api/questions";
import UserAvatar from "@/app/ui/user-avatar";
import {
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// Helper function to parse and render Tiptap JSON content
function renderTiptapContent(content: string): React.JSX.Element {
  try {
    const jsonContent = JSON.parse(content);
    return <TiptapRenderer content={jsonContent} />;
  } catch (error) {
    // Fallback to plain text if parsing fails
    return <p className="text-gray-700 whitespace-pre-wrap">{content}</p>;
  }
}

// Component to render Tiptap JSON structure
function TiptapRenderer({ content }: { content: any }): React.JSX.Element {
  if (!content || !content.content) {
    return <div></div>;
  }

  return (
    <div className="prose max-w-none">
      {content.content.map((node: any, index: number) => (
        <TiptapNode key={index} node={node} />
      ))}
    </div>
  );
}

// Component to render individual Tiptap nodes
function TiptapNode({ node }: { node: any }): React.JSX.Element {
  if (!node) return <></>;

  switch (node.type) {
    case "paragraph":
      return (
        <p className="mb-2">
          {node.content?.map((child: any, index: number) => (
            <TiptapNode key={index} node={child} />
          ))}
        </p>
      );

    case "text":
      let element = <>{node.text}</>;

      if (node.marks) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case "bold":
              element = <strong>{element}</strong>;
              break;
            case "italic":
              element = <em>{element}</em>;
              break;
            case "code":
              element = (
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                  {element}
                </code>
              );
              break;
            case "link":
              element = (
                <a
                  href={mark.attrs?.href}
                  className="text-blue-600 hover:text-blue-800 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {element}
                </a>
              );
              break;
          }
        });
      }

      return element;

    case "heading":
      const level = node.attrs?.level || 1;
      const headingClasses = {
        1: "text-2xl font-bold mb-4",
        2: "text-xl font-bold mb-3",
        3: "text-lg font-bold mb-2",
        4: "text-base font-bold mb-2",
        5: "text-sm font-bold mb-1",
        6: "text-sm font-bold mb-1",
      };

      const headingContent = node.content?.map((child: any, index: number) => (
        <TiptapNode key={index} node={child} />
      ));

      switch (level) {
        case 1:
          return <h1 className={headingClasses[1]}>{headingContent}</h1>;
        case 2:
          return <h2 className={headingClasses[2]}>{headingContent}</h2>;
        case 3:
          return <h3 className={headingClasses[3]}>{headingContent}</h3>;
        case 4:
          return <h4 className={headingClasses[4]}>{headingContent}</h4>;
        case 5:
          return <h5 className={headingClasses[5]}>{headingContent}</h5>;
        case 6:
          return <h6 className={headingClasses[6]}>{headingContent}</h6>;
        default:
          return <h1 className={headingClasses[1]}>{headingContent}</h1>;
      }

    case "codeBlock":
      return (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <code>
            {node.content?.map((child: any, index: number) => (
              <TiptapNode key={index} node={child} />
            ))}
          </code>
        </pre>
      );

    case "bulletList":
      return (
        <ul className="list-disc list-inside mb-4">
          {node.content?.map((child: any, index: number) => (
            <TiptapNode key={index} node={child} />
          ))}
        </ul>
      );

    case "orderedList":
      return (
        <ol className="list-decimal list-inside mb-4">
          {node.content?.map((child: any, index: number) => (
            <TiptapNode key={index} node={child} />
          ))}
        </ol>
      );

    case "listItem":
      return (
        <li className="mb-1">
          {node.content?.map((child: any, index: number) => (
            <TiptapNode key={index} node={child} />
          ))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">
          {node.content?.map((child: any, index: number) => (
            <TiptapNode key={index} node={child} />
          ))}
        </blockquote>
      );

    case "hardBreak":
      return <br />;

    default:
      // For unknown node types, try to render content if available
      if (node.content) {
        return (
          <>
            {node.content.map((child: any, index: number) => (
              <TiptapNode key={index} node={child} />
            ))}
          </>
        );
      }
      return <></>;
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2419200)
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2419200)} months ago`;
}

// Reply component for displaying nested replies
function ReplyComponent({
  reply,
  level = 0,
}: {
  reply: Reply;
  level?: number;
}) {
  const [showNested, setShowNested] = useState(false);
  const hasNestedReplies =
    reply.nestedReplies && reply.nestedReplies.length > 0;

  return (
    <div
      className={`border-l-2 border-gray-200 ${level > 0 ? "ml-4" : "ml-0"}`}
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
            </div>

            <div className="prose prose-sm max-w-none mb-3">
              <p className="text-gray-700">{reply.content}</p>
            </div>

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
          </div>
        </div>

        {showNested && hasNestedReplies && (
          <div className="mt-3">
            {reply.nestedReplies?.map((nestedReply) => (
              <ReplyComponent
                key={nestedReply._id}
                reply={nestedReply}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Answer component
function AnswerComponent({ answer }: { answer: Answer }) {
  const [showReplies, setShowReplies] = useState(false);
  const hasReplies = answer.replies && answer.replies.length > 0;

  // Debug: Log reply data
  console.log(
    `Answer ${answer._id} has ${answer.replies?.length || 0} replies:`,
    answer.replies
  );

  return (
    <div className="bg-white border rounded-lg p-6 mb-6">
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
          </div>

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
              <ReplyComponent key={reply._id} reply={reply} />
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link
              href="/dashboard/questions"
              className="text-blue-600 hover:text-blue-800"
            >
              Questions
            </Link>
          </li>
          <li>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </li>
          <li className="text-gray-500 truncate max-w-md">{question.title}</li>
        </ol>
      </nav>

      {/* Question Header */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {question.title}
        </h1>

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
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Answers ({question.answers?.length || 0})
        </h2>

        {question.answers && question.answers.length > 0 ? (
          <div className="space-y-6">
            {question.answers.map((answer) => (
              <AnswerComponent key={answer._id} answer={answer} />
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
    </div>
  );
}
