import { Metadata } from "next";
import QuestionsTableClient from "@/app/ui/questions/table-client";
import QuestionsSearch from "@/app/ui/questions/search";
import { QuestionsTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Questions | ChatOverflow Admin",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    page?: string;
    tags?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}) {
  const params = await searchParams;

  const query = params.query || "";
  const currentPage = Number(params.page) || 1;
  const tags = params.tags || "";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Questions</h1>
      </div>

      <div className="mt-4 md:mt-8">
        <QuestionsSearch />
      </div>

      <QuestionsTableClient
        query={query}
        currentPage={currentPage}
        tags={tags}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </div>
  );
}
