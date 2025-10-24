// A lots of thing to do
import { fetchFilteredCustomers } from "@/app/lib/data";

import CustomersTable from "@/app/ui/customers/table";
import { DataTableDemo } from "@/app/ui/tags/table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags",
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  return <DataTableDemo />;
}
