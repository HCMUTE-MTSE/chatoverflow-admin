import { Metadata } from "next";
import UsersTable from "@/app/ui/users/table";
import UsersSearch from "@/app/ui/users/search";
import { QuestionsTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Users | ChatOverflow Admin",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    role?: string;
    status?: string;
    gender?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}) {
  const params = await searchParams;

  const search = params.search || "";
  const currentPage = Number(params.page) || 1;
  const role = params.role || "";
  const status = params.status || "";
  const gender = params.gender || "";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <div className="mt-4 md:mt-8">
        <UsersSearch />
      </div>

      <Suspense
        key={search + currentPage + role + status + gender + sortBy + sortOrder}
        fallback={<QuestionsTableSkeleton />}
      >
        <UsersTable
          search={search}
          currentPage={currentPage}
          role={role}
          status={status}
          gender={gender}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </Suspense>
    </div>
  );
}
