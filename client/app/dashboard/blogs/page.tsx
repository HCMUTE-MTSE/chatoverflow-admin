// A lots of thing to do
import { fetchFilteredCustomers } from "@/app/lib/data";
import { BlogsTable } from "@/app/ui/blogs/table";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs",
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  return <BlogsTable />;
}
