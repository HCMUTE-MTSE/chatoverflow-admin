import { Metadata } from "next";
import { BlogDetail } from "@/app/ui/blogs/blog-detail";

export const metadata: Metadata = {
  title: "Blogs details",
};

export default async function Page({ params }: { params: { id: string } }) {
  return <BlogDetail blogId={params.id} />;
}
