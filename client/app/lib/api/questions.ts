// API functions for questions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Question {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  askedTime: string;
  views: number;
  upvotedBy: string[];
  downvotedBy: string[];
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  answerCount?: number;
  upvoteCount: number;
  downvoteCount: number;
  netVotes: number;
}

export interface Answer {
  _id: string;
  content: string;
  question: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  upvotedBy: string[];
  downvotedBy: string[];
  createdAt: string;
  updatedAt: string;
  replyCount?: number;
  upvoteCount: number;
  downvoteCount: number;
  netVotes: number;
  replies?: Reply[];
}

export interface Reply {
  _id: string;
  content: string;
  answer: string;
  parent: string | null;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  upvotedBy: string[];
  downvotedBy: string[];
  createdAt: string;
  updatedAt: string;
  nestedRepliesCount?: number;
  nestedReplies?: Reply[];
  upvoteCount: number;
  downvoteCount: number;
  netVotes: number;
}

export interface QuestionWithDetails extends Question {
  answers?: Answer[];
}

export interface PaginatedQuestions {
  data: Question[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function fetchQuestions({
  query = "",
  page = 1,
  limit = 10,
  tags = "",
  sortBy = "createdAt",
  sortOrder = "desc",
  includeUser = true,
  includeAnswerCount = true,
}: {
  query?: string;
  page?: number;
  limit?: number;
  tags?: string;
  sortBy?: string;
  sortOrder?: string;
  includeUser?: boolean;
  includeAnswerCount?: boolean;
} = {}): Promise<PaginatedQuestions> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
    includeUser: includeUser.toString(),
    includeAnswerCount: includeAnswerCount.toString(),
  });

  if (query) params.append("search", query);
  if (tags) params.append("tags", tags);

  const response = await fetch(`${API_BASE_URL}/questions?${params}`, {
    headers: {
      "Content-Type": "application/json",
    },
    // Add cache control for better performance
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchQuestionDetails({
  id,
  includeReplies = true,
}: {
  id: string;
  includeReplies?: boolean;
}): Promise<QuestionWithDetails> {
  const params = new URLSearchParams({
    includeReplies: includeReplies.toString(),
  });

  const url = `${API_BASE_URL}/questions/${id}/details?${params}`;
  console.log("=== API Call Debug ===");
  console.log("Fetching from URL:", url);
  console.log("includeReplies parameter:", includeReplies);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 30 }, // Revalidate every 30 seconds for detail pages
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Question not found");
    }
    throw new Error(`Failed to fetch question details: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("API Response:", data);
  console.log("Response answers:", data.answers?.length);
  console.log("First answer replies:", data.answers?.[0]?.replies);

  return data;
}

export async function incrementQuestionViews(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/questions/${id}/view`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    // Don't throw error for view increment failures, just log
    console.error(`Failed to increment views for question ${id}`);
  }
}

export async function fetchPopularQuestions(
  limit: number = 10
): Promise<Question[]> {
  const response = await fetch(
    `${API_BASE_URL}/questions/popular?limit=${limit}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes for popular questions
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch popular questions: ${response.statusText}`
    );
  }

  return response.json();
}

export async function fetchRecentQuestions(
  limit: number = 10
): Promise<Question[]> {
  const response = await fetch(
    `${API_BASE_URL}/questions/recent?limit=${limit}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Revalidate every minute for recent questions
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch recent questions: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchQuestionsByTag(
  tag: string,
  limit: number = 20
): Promise<Question[]> {
  const response = await fetch(
    `${API_BASE_URL}/questions/by-tag/${encodeURIComponent(
      tag
    )}?limit=${limit}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 120 }, // Revalidate every 2 minutes for tag-based queries
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch questions by tag: ${response.statusText}`);
  }

  return response.json();
}
