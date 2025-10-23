import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isOnForgotPassword =
        nextUrl.pathname.startsWith("/forgot-password");

      console.log("Auth middleware:", {
        pathname: nextUrl.pathname,
        isLoggedIn,
        isOnDashboard,
      });

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login page
      }

      if (isLoggedIn && (isOnLogin || isOnForgotPassword)) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
