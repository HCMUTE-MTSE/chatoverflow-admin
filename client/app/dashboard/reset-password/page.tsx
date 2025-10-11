import ResetPasswordForm from "@/app/ui/dashboard/reset-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center p-6">
      <ResetPasswordForm />
    </div>
  );
}
