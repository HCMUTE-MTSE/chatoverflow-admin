"use server";

import { cookies } from "next/headers";

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// API Response type
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
  pagination?: {
    page: number;
    limit: number;
    nexturl: string | null;
  };
}

// Tag type
export interface Tag {
  _id?: string;
  name: string;
  displayName: string;
  questionCount: number;
  description: string;
  updatedAt: string;
}

/**
 * Get access token from cookies
 */
async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}

/**
 * Fetch all tags with pagination
 */
export async function fetchTags(page: number = 1, limit: number = 10) {
  try {
    const accessToken = await getAccessToken();
    console.log("Api Base URL:", API_BASE_URL);
    const response = await fetch(
      `${API_BASE_URL}/tags?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        credentials: "include",
        cache: "no-store", // Disable caching for fresh data
      }
    );

    const data: ApiResponse<Tag[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch tags");
    }

    return {
      success: true,
      data: data.data,
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("Fetch tags error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch tags",
      data: [],
    };
  }
}

/**
 * Get a single tag by name
 */
export async function getTagByName(name: string) {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}/tags/${name}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      credentials: "include",
      cache: "no-store",
    });

    const data: ApiResponse<Tag> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch tag");
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Fetch tag error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch tag",
    };
  }
}

/**
 * Create a new tag
 */
export async function createTag(tagData: {
  name: string;
  displayName: string;
  description: string;
}) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("Unauthorized: No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify(tagData),
    });

    const data: ApiResponse<Tag> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to create tag");
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Create tag error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create tag",
    };
  }
}

/**
 * Update an existing tag
 */
export async function updateTag(
  name: string,
  tagData: {
    displayName?: string;
    description?: string;
  }
) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("Unauthorized: No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/tags/${name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify(tagData),
    });

    const data: ApiResponse<Tag> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to update tag");
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error("Update tag error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update tag",
    };
  }
}

/**
 * Delete a tag
 */
export async function deleteTag(name: string) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("Unauthorized: No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/tags/${name}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });

    const data: ApiResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to delete tag");
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Delete tag error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete tag",
    };
  }
}

/**
 * Search tags by query
 */
export async function searchTags(
  query: string,
  page: number = 1,
  limit: number = 10
) {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      `${API_BASE_URL}/tags/search?q=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        credentials: "include",
        cache: "no-store",
      }
    );

    const data: ApiResponse<Tag[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to search tags");
    }

    return {
      success: true,
      data: data.data,
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("Search tags error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to search tags",
      data: [],
    };
  }
}
