"use client";

import { useState } from "react";
import { XMarkIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface HideContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, sendEmail: boolean) => Promise<void>;
  contentType: "question" | "answer" | "reply";
  contentTitle?: string;
  authorEmail?: string;
}

const PREDEFINED_REASONS = [
  "Spam or promotional content",
  "Inappropriate language or harassment",
  "Misinformation or false claims",
  "Copyright infringement",
  "Off-topic or irrelevant content",
  "Duplicate content",
  "Violation of community guidelines",
  "Personal attacks or hate speech",
  "Other (specify below)",
];

export default function HideContentModal({
  isOpen,
  onClose,
  onConfirm,
  contentType,
  contentTitle,
  authorEmail,
}: HideContentModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const isCustomReason = selectedReason === "Other (specify below)";
  const finalReason = isCustomReason ? customReason : selectedReason;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalReason.trim()) {
      alert("Please select or enter a reason");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(finalReason.trim(), sendEmail);
      // Reset form
      setSelectedReason("");
      setCustomReason("");
      setSendEmail(true);
      onClose();
    } catch (error) {
      console.error("Error hiding content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    setSendEmail(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <EyeSlashIcon className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Hide {contentType}
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {contentTitle && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 font-medium">Content:</p>
              <p className="text-sm text-gray-800 line-clamp-3">
                {contentTitle}
              </p>
            </div>
          )}

          {authorEmail && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-600 font-medium">Author:</p>
              <p className="text-sm text-blue-800">{authorEmail}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reason for hiding *
              </label>
              <div className="space-y-2">
                {PREDEFINED_REASONS.map((reason, index) => (
                  <label key={index} className="flex items-start">
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Reason Input */}
            {isCustomReason && (
              <div>
                <label
                  htmlFor="customReason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Please specify the reason *
                </label>
                <textarea
                  id="customReason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Please provide a detailed reason..."
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {customReason.length}/500 characters
                </p>
              </div>
            )}

            {/* Send Email Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                disabled={isLoading}
              />
              <label htmlFor="sendEmail" className="ml-2 text-sm text-gray-700">
                Send notification email to the author
                {authorEmail && (
                  <span className="text-gray-500"> ({authorEmail})</span>
                )}
              </label>
            </div>

            {/* Warning */}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !finalReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {isLoading ? "Hiding..." : "Hide Content"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
