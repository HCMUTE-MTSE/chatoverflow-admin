"use server";

import { cookies } from "next/headers";

// Base API URL - Update this with your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// API Response type
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// User type
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  status: string;
}

// Login response
interface LoginResponse {
  user: User;
  accessToken: string;
}

/**
 * Login API
 */
export async function loginApi(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Important for cookies
    });

    const data: ApiResponse<LoginResponse> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Login failed");
    }

    // Get refreshToken from Set-Cookie header if needed
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      // Store refresh token in httpOnly cookie
      const cookieStore = await cookies();
      const refreshTokenMatch = setCookie.match(/refreshToken=([^;]+)/);
      if (refreshTokenMatch) {
        cookieStore.set("refreshToken", refreshTokenMatch[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    };
  }
}

/**
 * Refresh Token API
 */
export async function refreshTokenApi() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
      credentials: "include",
    });

    const data: ApiResponse<{ accessToken: string }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Token refresh failed");
    }

    return {
      success: true,
      accessToken: data.data?.accessToken,
    };
  } catch (error) {
    console.error("Refresh token error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Token refresh failed",
    };
  }
}

/**
 * Logout API
 */
export async function logoutApi() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: refreshToken ? `refreshToken=${refreshToken}` : "",
      },
      credentials: "include",
    });

    const data: ApiResponse = await response.json();

    // Clear refresh token cookie
    cookieStore.delete("refreshToken");

    if (!response.ok || !data.success) {
      console.error("Logout response not ok, but continuing...");
    }

    return {
      success: true,
      message: data.message || "Logged out successfully",
    };
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear the cookie even if API call fails
    const cookieStore = await cookies();
    cookieStore.delete("refreshToken");

    return {
      success: false,
      message: error instanceof Error ? error.message : "Logout failed",
    };
  }
}

/**
 * Request OTP for forgot password
 */
export async function requestOtpApi(email: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/forgot-password/request-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data: ApiResponse<{ email: string }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to send OTP");
    }

    return {
      success: true,
      message: data.message,
      email: data.data?.email,
    };
  } catch (error) {
    console.error("Request OTP error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send OTP",
    };
  }
}

/**
 * Reset password with OTP (forgot password flow)
 */
export async function resetPasswordWithOtpApi(
  email: string,
  otp: string,
  newPassword: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data: ApiResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to reset password");
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Reset password with OTP error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to reset password",
    };
  }
}

/**
 * Reset password (authenticated user changing password)
 */
export async function resetPasswordApi(
  accessToken: string,
  newPassword: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ newPassword }),
    });

    const data: ApiResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to reset password");
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to reset password",
    };
  }
}

/**
 * Helper function to make authenticated API calls
 */
export async function authenticatedFetch(
  url: string,
  accessToken: string,
  options: RequestInit = {}
) {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // If 401, try to refresh token
    if (response.status === 401) {
      const refreshResult = await refreshTokenApi();
      if (refreshResult.success && refreshResult.accessToken) {
        // Retry with new token
        const retryResponse = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${refreshResult.accessToken}`,
            "Content-Type": "application/json",
          },
        });
        return retryResponse;
      }
    }

    return response;
  } catch (error) {
    console.error("Authenticated fetch error:", error);
    throw error;
  }
}
