"use client";

import { useEffect, useState } from "react";
import UserAvatar from "@/app/ui/user-avatar";
import Image from "next/image";
import UserActions from "./user-actions";
import { format } from "date-fns";
import { useAuth } from "@/app/hooks/useAuth";

interface User {
  _id: string;
  name: string;
  nickName?: string;
  email: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: {
    province?: string;
    ward?: string;
    street?: string;
  };
  gender: "male" | "female" | "other";
  role: "admin" | "user";
  status: "active" | "inactive" | "banned" | "pending";
  banReason?: string;
  bannedAt?: string;
  banExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  data: User[];
  total: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UsersTableProps {
  search: string;
  currentPage: number;
  role: string;
  status: string;
  gender: string;
  sortBy: string;
  sortOrder: string;
}

const roleColors = {
  admin: "bg-purple-100 text-purple-800",
  user: "bg-blue-100 text-blue-800",
};

const genderColors = {
  male: "bg-blue-100 text-blue-800",
  female: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800",
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  banned: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export default function UsersTable({
  search,
  currentPage,
  role,
  status,
  gender,
  sortBy,
  sortOrder,
}: UsersTableProps) {
  const { accessToken } = useAuth();
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);
        if (role) queryParams.append("role", role);
        if (status) queryParams.append("status", status);
        if (gender) queryParams.append("gender", gender);
        if (sortBy) queryParams.append("sortBy", sortBy);
        if (sortOrder) queryParams.append("sortOrder", sortOrder);
        queryParams.append("page", currentPage.toString());
        queryParams.append("limit", "10");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setUsersData(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    }

    if (accessToken) fetchUsers();
  }, [
    accessToken,
    search,
    currentPage,
    role,
    status,
    gender,
    sortBy,
    sortOrder,
  ]);

  if (loading) return <p className="mt-6 text-center">Loading users...</p>;
  if (!usersData || usersData.data.length === 0)
    return (
      <div className="mt-6 text-center text-gray-500">No users found.</div>
    );

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile view */}
          <div className="md:hidden">
            {usersData.data.map((user) => (
              <div
                key={user._id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <UserAvatar
                      user={{
                        _id: user._id,
                        name: user.name,
                        avatar: user.avatar,
                      }}
                      size="md"
                    />
                    <div className="ml-3">
                      <p className="text-xl font-medium">{user.name}</p>
                      {user.nickName && (
                        <p className="text-sm text-gray-500">
                          @{user.nickName}
                        </p>
                      )}
                      <p className="text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          roleColors[user.role as keyof typeof roleColors]
                        }`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          statusColors[user.status as keyof typeof statusColors]
                        }`}
                      >
                        {user.status}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          genderColors[user.gender as keyof typeof genderColors]
                        }`}
                      >
                        {user.gender}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Created:{" "}
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </p>
                    {user.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                  </div>
                  <UserActions user={user} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  User
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Role
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Gender
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {usersData.data.map((user, index) => (
                <tr
                  key={user._id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        user={{
                          _id: user._id,
                          name: user.name,
                          avatar: user.avatar,
                        }}
                        size="sm"
                      />
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        {user.nickName && (
                          <p className="text-xs text-gray-500">
                            @{user.nickName}
                          </p>
                        )}
                        <p className="text-gray-500">{user.email}</p>
                        {user.bio && (
                          <p className="text-xs text-gray-400 line-clamp-1 max-w-48">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        roleColors[user.role as keyof typeof roleColors]
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex flex-col">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          statusColors[user.status as keyof typeof statusColors]
                        }`}
                      >
                        {user.status}
                      </span>
                      {user.status === "banned" && (
                        <div className="mt-1 text-xs space-y-1">
                          {user.banReason && (
                            <div
                              className="text-red-600 max-w-32 truncate"
                              title={user.banReason}
                            >
                              Reason: {user.banReason}
                            </div>
                          )}
                          {user.banExpiresAt ? (
                            <div
                              className="text-orange-600"
                              title={`Auto-unban: ${new Date(
                                user.banExpiresAt
                              ).toLocaleString()}`}
                            >
                              Expires:{" "}
                              {format(
                                new Date(user.banExpiresAt),
                                "MMM dd, yyyy"
                              )}
                            </div>
                          ) : (
                            <div className="text-red-700 font-medium">
                              Permanent
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        genderColors[user.gender as keyof typeof genderColors]
                      }`}
                    >
                      {user.gender}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {format(new Date(user.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <UserActions user={user} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {usersData.totalPages > 1 && (
        <div className="mt-5 flex w-full justify-center">
          <div className="flex items-center space-x-2">
            <a
              href={`?${new URLSearchParams({
                search,
                role,
                status,
                gender,
                sortBy,
                sortOrder,
                page: Math.max(1, currentPage - 1).toString(),
              })}`}
              className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md ${
                !usersData.hasPrevPage
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none"
                  : "text-gray-500 bg-white hover:bg-gray-50"
              }`}
            >
              Previous
            </a>

            <span className="px-3 py-2 text-sm text-gray-700">
              Page {usersData.page} of {usersData.totalPages}
            </span>

            <a
              href={`?${new URLSearchParams({
                search,
                role,
                status,
                gender,
                sortBy,
                sortOrder,
                page: Math.min(
                  usersData.totalPages,
                  currentPage + 1
                ).toString(),
              })}`}
              className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md ${
                !usersData.hasNextPage
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none"
                  : "text-gray-500 bg-white hover:bg-gray-50"
              }`}
            >
              Next
            </a>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">{usersData.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="text-2xl font-bold text-green-600">
            {usersData.data.filter((u) => u.status === "active").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Admin Users</h3>
          <p className="text-2xl font-bold text-purple-600">
            {usersData.data.filter((u) => u.role === "admin").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Banned Users</h3>
          <p className="text-2xl font-bold text-red-600">
            {usersData.data.filter((u) => u.status === "banned").length}
          </p>
        </div>
      </div>
    </div>
  );
}
