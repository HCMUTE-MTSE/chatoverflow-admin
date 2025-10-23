const AUTH_PREFIX = process.env.AUTH_SECRET || "chatoverflow";
const ACCESS_TOKEN_KEY = `${AUTH_PREFIX}_accessToken`;
const USER_KEY = `${AUTH_PREFIX}_user`;

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  status: string;
}

export function setAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
}

export function removeAccessToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function setUser(user: StoredUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): StoredUser | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
  }
  return null;
}

export function removeUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearAuthData(): void {
  removeAccessToken();
  removeUser();
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
