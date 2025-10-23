"use client";

import { useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Simple debounce implementation
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

  return ((...args: Parameters<T>) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      callback(...args);
    }, delay);

    setDebounceTimer(timer);
  }) as T;
}

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest First" },
  { value: "createdAt-asc", label: "Oldest First" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "email-asc", label: "Email A-Z" },
  { value: "email-desc", label: "Email Z-A" },
];

export default function UsersSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams);
    const [sortBy, sortOrder] = sortValue.split("-");

    params.set("page", "1");
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    replace(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    replace(`${pathname}?${params.toString()}`);
  };

  const currentSort = `${searchParams.get("sortBy") || "createdAt"}-${
    searchParams.get("sortOrder") || "desc"
  }`;
  const currentSearch = searchParams.get("search") || "";
  const currentRole = searchParams.get("role") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentGender = searchParams.get("gender") || "";

  const hasActiveFilters =
    currentSearch ||
    currentRole ||
    currentStatus ||
    currentGender ||
    currentSort !== "createdAt-desc";

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-grow">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Sort Select */}
        <div className="flex gap-2">
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              showFilters || hasActiveFilters
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={currentRole}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={currentStatus}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={currentGender}
                onChange={(e) => handleFilterChange("gender", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>

          {currentSearch && (
            <div className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              <span>Search: "{currentSearch}"</span>
              <button
                onClick={() => handleSearch("")}
                className="hover:text-blue-600"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}

          {currentRole && (
            <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
              <span>Role: {currentRole}</span>
              <button
                onClick={() => handleFilterChange("role", "")}
                className="hover:text-green-600"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}

          {currentStatus && (
            <div className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
              <span>Status: {currentStatus}</span>
              <button
                onClick={() => handleFilterChange("status", "")}
                className="hover:text-purple-600"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}

          {currentGender && (
            <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800">
              <span>Gender: {currentGender}</span>
              <button
                onClick={() => handleFilterChange("gender", "")}
                className="hover:text-orange-600"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}

          {currentSort !== "createdAt-desc" && (
            <div className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800">
              <span>
                Sort:{" "}
                {SORT_OPTIONS.find((opt) => opt.value === currentSort)?.label}
              </span>
              <button
                onClick={() => handleSortChange("createdAt-desc")}
                className="hover:text-indigo-600"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
