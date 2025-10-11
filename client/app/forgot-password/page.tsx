"use client";

import { useState } from "react";
import { lusitana } from "@/app/ui/fonts";
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import Link from "next/link";
import { requestOtpApi, resetPasswordWithOtpApi } from "@/app/lib/api/auth";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsPending(true);

    try {
      const result = await requestOtpApi(email);

      if (result.success) {
        setSuccessMessage(
          result.message || "OTP đã được gửi đến email của bạn"
        );
        setStep("otp");
      } else {
        setErrorMessage(result.message || "Gửi OTP thất bại");
      }
    } catch (error) {
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsPending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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

    setIsPending(true);

    try {
      const result = await resetPasswordWithOtpApi(email, otp, newPassword);

      if (result.success) {
        setSuccessMessage(
          result.message || "Đặt lại mật khẩu thành công! Đang chuyển hướng..."
        );
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setErrorMessage(result.message || "Đặt lại mật khẩu thất bại");
      }
    } catch (error) {
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-full text-white">
            <h1 className={`${lusitana.className} text-2xl font-bold`}>
              {step === "email" ? "Quên mật khẩu" : "Nhập mã OTP"}
            </h1>
          </div>
        </div>

        {step === "email" ? (
          <form onSubmit={handleRequestOtp} className="space-y-3">
            <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
              <p className="mb-4 text-sm text-gray-600">
                Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
              </p>

              <div className="w-full">
                <div>
                  <label
                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Nhập email của bạn"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                  </div>
                </div>
              </div>

              <Button className="mt-4 w-full" disabled={isPending}>
                {isPending ? "Đang gửi..." : "Gửi mã OTP"}
              </Button>

              <div className="mt-4 text-center">
                <Link
                  href="/login"
                  className="flex items-center justify-center text-sm text-blue-500 hover:text-blue-700"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Quay lại đăng nhập
                </Link>
              </div>

              <div
                className="flex h-8 items-end space-x-1 mt-2"
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
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-3">
            <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
              <p className="mb-4 text-sm text-gray-600">
                Mã OTP đã được gửi đến <strong>{email}</strong>
              </p>

              <div className="w-full space-y-4">
                <div>
                  <label
                    className="mb-3 block text-xs font-medium text-gray-900"
                    htmlFor="otp"
                  >
                    Mã OTP
                  </label>
                  <div className="relative">
                    <input
                      className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500"
                      id="otp"
                      type="text"
                      name="otp"
                      placeholder="Nhập mã OTP"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                </div>

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
                    />
                    <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-3 block text-xs font-medium text-gray-900"
                    htmlFor="confirmPassword"
                  >
                    Xác nhận mật khẩu
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
                    />
                    <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                  </div>
                </div>
              </div>

              <Button className="mt-4 w-full" disabled={isPending}>
                {isPending ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>

              <div className="mt-4 flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <ArrowLeftIcon className="inline h-4 w-4 mr-1" />
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-blue-500 hover:text-blue-700"
                  disabled={isPending}
                >
                  Gửi lại OTP
                </button>
              </div>

              <div
                className="flex h-8 items-end space-x-1 mt-2"
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
        )}
      </div>
    </main>
  );
}
