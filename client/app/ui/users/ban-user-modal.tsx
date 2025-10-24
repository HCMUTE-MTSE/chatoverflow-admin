"use client";

import { useState } from "react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface BanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBan: (
    reason: string,
    sendEmail: boolean,
    banDuration?: number
  ) => Promise<void>;
  userName: string;
  userEmail?: string;
  loading?: boolean;
}

const BAN_REASONS = [
  "Spam or promotional content",
  "Harassment or bullying",
  "Inappropriate or offensive content",
  "Violation of community guidelines",
  "Multiple policy violations",
  "Impersonation",
  "Suspicious or fraudulent activity",
  "Other",
];

const BAN_DURATIONS = [
  { value: 5, label: "5 seconds" },
  { value: 1, label: "1 Day" },
  { value: 3, label: "3 Days" },
  { value: 7, label: "1 Week" },
  { value: 14, label: "2 Weeks" },
  { value: 30, label: "1 Month" },
  { value: 90, label: "3 Months" },
  { value: 180, label: "6 Months" },
  { value: 365, label: "1 Year" },
  { value: 0, label: "Permanent" },
];

export default function BanUserModal({
  isOpen,
  onClose,
  onBan,
  userName,
  userEmail,
  loading = false,
}: BanUserModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [banDuration, setBanDuration] = useState<number>(7); // Default 1 week
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const reason = selectedReason === "Other" ? customReason : selectedReason;

    if (!reason.trim()) {
      setError("Please provide a reason for banning this user");
      return;
    }

    if (reason.length < 10) {
      setError("Reason must be at least 10 characters long");
      return;
    }

    try {
      await onBan(reason.trim(), sendEmail, banDuration);
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to ban user");
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    setBanDuration(7);
    setSendEmail(true);
    setError("");
    onClose();
  };

  const getUnbanDate = () => {
    if (banDuration === 0) return "Never (Permanent)";
    const unbanDate = new Date();
    unbanDate.setDate(unbanDate.getDate() + banDuration);
    return unbanDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ban User</h3>
              <p className="text-sm text-gray-500">
                Configure ban duration and notification settings
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              User to be banned:
            </h4>
            <p className="text-sm text-gray-700">
              <strong>Name:</strong> {userName}
            </p>
            {userEmail && (
              <p className="text-sm text-gray-700">
                <strong>Email:</strong> {userEmail}
              </p>
            )}
          </div>

          {/* Ban Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Ban Duration *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BAN_DURATIONS.map((duration) => (
                <label key={duration.value} className="flex items-center">
                  <input
                    type="radio"
                    name="banDuration"
                    value={duration.value}
                    checked={banDuration === duration.value}
                    onChange={(e) => setBanDuration(Number(e.target.value))}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {duration.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Auto-unban info */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-blue-400 mr-2" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    {banDuration === 0
                      ? "Permanent Ban"
                      : "Auto-unban scheduled"}
                  </p>
                  <p className="text-xs text-blue-600">
                    {banDuration === 0
                      ? "This user will remain banned until manually unbanned by an admin"
                      : `User will be automatically unbanned on: ${getUnbanDate()}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ban Reason */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for ban *
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {BAN_REASONS.map((reason) => (
                <label key={reason} className="flex items-center">
                  <input
                    type="radio"
                    name="banReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          {selectedReason === "Other" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom reason *
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Please specify the reason..."
                disabled={loading}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {customReason.length}/500 characters
              </p>
            </div>
          )}

          {/* Email Notification */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-gray-700">
                Send email notification to user
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              The user will receive an email explaining the ban duration and
              reason
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                loading ||
                !selectedReason ||
                (selectedReason === "Other" && !customReason.trim())
              }
            >
              {loading
                ? "Banning..."
                : `Ban for ${
                    banDuration === 0
                      ? "Permanent"
                      : `${banDuration} day${banDuration !== 1 ? "s" : ""}`
                  }`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
