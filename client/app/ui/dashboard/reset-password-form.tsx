"use client";

import { useState, useEffect } from "react";
import { lusitana } from "@/app/ui/fonts";
import {
  KeyIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

export default function ResetPasswordForm() {
  const { accessToken, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!accessToken) {
      setErrorMessage("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    setIsPending(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(result.message || "Đổi mật khẩu thành công!");
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMessage(result.message || "Đổi mật khẩu thất bại");
      }
    } catch (error) {
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex-1 rounded-lg bg-white px-6 pb-4 pt-8 shadow-md">
          <h1 className={`${lusitana.className} mb-3 text-2xl font-bold`}>
            Đổi mật khẩu
          </h1>

          <div className="w-full space-y-4">
            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="newPassword"
              >
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  placeholder="Nhập mật khẩu mới"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isPending}
                />
                <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>

            <div>
              <label
                className="mb-3 block text-xs font-medium text-gray-900"
                htmlFor="confirmPassword"
              >
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPending}
                />
                <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>

          <Button className="mt-6 w-full" disabled={isPending}>
            {isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
          </Button>

          <div
            className="flex h-8 items-end space-x-1 mt-4"
            aria-live="polite"
            aria-atomic="true"
          >
            {errorMessage && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{errorMessage}</p>
              </>
            )}
            {successMessage && (
              <>
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-500">{successMessage}</p>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
