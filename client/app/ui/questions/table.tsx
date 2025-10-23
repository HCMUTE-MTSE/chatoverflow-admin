import { fetchQuestions } from "@/app/lib/api/questions";
import UserAvatar from "@/app/ui/user-avatar";
import Link from "next/link";
import {
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

// Helper function to extract plain text from Tiptap JSON content
function extractTextFromTiptap(content: string): string {
  try {
    const jsonContent = JSON.parse(content);
    return extractTextFromNodes(jsonContent.content || []);
  } catch (error) {
    // Fallback to original content if parsing fails
    return content;
  }
}

// Recursive function to extract text from Tiptap nodes
function extractTextFromNodes(nodes: any[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") {
        return node.text || "";
      } else if (node.content) {
        return extractTextFromNodes(node.content);
      }
      return "";
    })
    .join("");
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

export default async function QuestionsTable({
  query,
  currentPage,
  tags,
  sortBy,
  sortOrder,
}: {
  query: string;
  currentPage: number;
  tags: string;
  sortBy: string;
  sortOrder: string;
}) {
  const questionsData = await fetchQuestions({
    query,
    page: currentPage,
    limit: 10,
    tags,
    sortBy,
    sortOrder,
    includeUser: true,
    includeAnswerCount: true,
  });

  const {
    data: questions,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
  } = questionsData;

  function formatDistanceToNow(
    date: Date,
    options: { addSuffix: boolean }
  ): import("react").ReactNode {
    const now = new Date();
    let diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const isFuture = diffInSeconds < 0;
    diffInSeconds = Math.abs(diffInSeconds);

    let value: number;
    let unit: string;

    if (diffInSeconds < 60) {
      value = diffInSeconds;
      unit = "second";
    } else if (diffInSeconds < 3600) {
      value = Math.floor(diffInSeconds / 60);
      unit = "minute";
    } else if (diffInSeconds < 86400) {
      value = Math.floor(diffInSeconds / 3600);
      unit = "hour";
    } else if (diffInSeconds < 604800) {
      value = Math.floor(diffInSeconds / 86400);
      unit = "day";
    } else if (diffInSeconds < 2419200) {
      value = Math.floor(diffInSeconds / 604800);
      unit = "week";
    } else if (diffInSeconds < 29030400) {
      value = Math.floor(diffInSeconds / 2419200);
      unit = "month";
    } else {
      value = Math.floor(diffInSeconds / 29030400);
      unit = "year";
    }

    const plural = value === 1 ? unit : `${unit}s`;
    const result = `${value} ${plural}`;

    if (!options?.addSuffix) return result;
    return isFuture ? `in ${result}` : `${result} ago`;
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Questions ({total} total)
            </h2>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Mobile view */}
          <div className="md:hidden">
            {questions?.map((question) => (
              <Link
                key={question._id}
                href={`/dashboard/questions/${question._id}`}
                className="mb-2 block w-full rounded-md bg-white p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <UserAvatar user={question.user} size="sm" showName />
                    </div>
                    <p className="text-sm font-medium">{question.title}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <EyeIcon className="mr-1 h-4 w-4" />
                      {question.views}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <ChatBubbleLeftRightIcon className="mr-1 h-4 w-4" />
                      {question.answerCount || 0}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <ArrowUpIcon className="mr-1 h-4 w-4" />
                      {question.upvoteCount}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(new Date(question.createdAt))}
                  </p>
                </div>
                {question.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {question.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {question.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{question.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Question
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Author
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Stats
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Tags
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {questions?.map((question, index) => (
                <tr
                  key={question._id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex flex-col">
                      <Link
                        href={`/dashboard/questions/${question._id}`}
                        className="truncate font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {question.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {(() => {
                          const plainText = extractTextFromTiptap(
                            question.content
                          );
                          return plainText.length > 100
                            ? plainText.substring(0, 100) + "..."
                            : plainText;
                        })()}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex items-center space-x-3">
                      <UserAvatar user={question.user} size="md" />
                      <div className="flex flex-col">
                        <p className="font-medium">{question.user?.name}</p>
                        <p className="text-xs text-gray-500">
                          {question.user?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm">
                        <ChatBubbleLeftRightIcon className="mr-1 h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {question.answerCount || 0}
                        </span>
                        <span className="ml-1 text-gray-500">answers</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <EyeIcon className="mr-1 h-4 w-4 text-gray-400" />
                        <span>{question.views}</span>
                        <span className="ml-1 text-gray-500">views</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                        <span className="text-green-600">
                          {question.upvoteCount}
                        </span>
                        <ArrowDownIcon className="ml-2 mr-1 h-4 w-4 text-red-500" />
                        <span className="text-red-600">
                          {question.downvoteCount}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex flex-wrap gap-1 max-w-32">
                      {question.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {question.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{question.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex flex-col">
                      <p className="text-sm">
                        {formatDistanceToNow(new Date(question.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/dashboard/questions/${question._id}`}
                        className="rounded-md border p-2 hover:bg-gray-100"
                      >
                        <span className="sr-only">View</span>
                        <EyeIcon className="w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-5 flex w-full justify-between">
            <div className="flex items-center">
              {hasPrevPage && (
                <Link
                  href={`/dashboard/questions?page=${
                    currentPage - 1
                  }&query=${query}&tags=${tags}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                  className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Previous
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => {
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-2">...</span>}
                      <Link
                        href={`/dashboard/questions?page=${page}&query=${query}&tags=${tags}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </Link>
                    </div>
                  );
                })}
            </div>
            <div className="flex items-center">
              {hasNextPage && (
                <Link
                  href={`/dashboard/questions?page=${
                    currentPage + 1
                  }&query=${query}&tags=${tags}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                  className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Next
                </Link>
              )}
            </div>
          </div>

          {/* No questions message */}
          {!questions ||
            (questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No questions found
                </h3>
                <p className="mt-2 text-gray-500">
                  {query || tags
                    ? "Try adjusting your search or filters"
                    : "No questions have been posted yet"}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
