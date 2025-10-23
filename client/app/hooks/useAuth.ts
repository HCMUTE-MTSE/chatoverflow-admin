"use client";

import { useState, useEffect } from "react";
import { getAccessToken, getUser, type StoredUser } from "@/app/lib/storage";

interface UseAuthReturn {
  accessToken: string | null;
  user: StoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Custom hook to replace useSession
 * Uses localStorage instead of NextAuth session
 */
export function useAuth(): UseAuthReturn {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const token = getAccessToken();
      const userData = getUser();

      setAccessToken(token);
      setUser(userData);
      setIsLoading(false);
    }
  }, []);

  return {
    accessToken,
    user,
    isAuthenticated: !!accessToken,
    isLoading,
  };
}
