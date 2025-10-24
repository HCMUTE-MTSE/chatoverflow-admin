import { Metadata } from "next";
import { notFound } from "next/navigation";
import QuestionDetail from "@/app/ui/questions/question-detail";
import BackButton from "@/app/ui/back-button";
import { Suspense } from "react";
import { QuestionDetailSkeleton } from "@/app/ui/skeletons";

export const metadata: Metadata = {
  title: "Question Detail | ChatOverflow Admin",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ includeReplies?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const id = resolvedParams.id;
  const includeReplies = resolvedSearchParams?.includeReplies === "true";

  if (!id) {
    notFound();
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <BackButton href="/dashboard/questions">Back to Questions</BackButton>
      </div>
      <Suspense fallback={<QuestionDetailSkeleton />}>
        <QuestionDetail id={id} includeReplies={includeReplies} />
      </Suspense>
    </div>
  );
}
