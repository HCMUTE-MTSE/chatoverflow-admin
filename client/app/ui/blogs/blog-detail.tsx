"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteBlogDialog } from "./delete-blog-dialog";

interface BlogDetailProps {
  blogId: string;
}

interface BlogData {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content_html: string;
  coverImage: string;
  tags: string[];
  user: {
    _id: string;
    name: string;
    avatar: string;
  } | null;
  upvotedBy: string[];
  downvotedBy: string[];
  isPublished: boolean;
  totalComments: number;
  createdAt: string;
  updatedAt: string;
}

export function BlogDetail({ blogId }: BlogDetailProps) {
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken, isAuthenticated } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<BlogData | undefined>();
  const router = useRouter();
  const handleDeleteSuccess = () => {
    toast.success("Blog deleted successfully!", {
      description: "Redirecting to blogs list...",
      duration: 2000,
    });

    // Redirect to blogs list after 1 second
    setTimeout(() => {
      router.push("/dashboard/blogs");
    }, 1000);
  };

  useEffect(() => {
    const loadBlog = async () => {
      if (!accessToken || !isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch blog");
        }

        const result = await response.json();
        if (result.success && result.data) {
          setBlog(result.data);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        toast.error("Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [blogId, accessToken, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading blog...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Blog not found</div>
      </div>
    );
  }

  const upvotes = blog.upvotedBy.length;
  const downvotes = blog.downvotedBy.length;

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={() => {
              setBlogToDelete(blog);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Cover Image */}
      <Card>
        <CardContent className="p-0">
          <div className="relative w-full h-[400px] overflow-hidden rounded-t-lg">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Meta */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={blog.isPublished ? "default" : "secondary"}>
                    {blog.isPublished ? "Published" : "Draft"}
                  </Badge>
                  {blog.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-3xl font-bold">
                  {blog.title}
                </CardTitle>
                <p className="text-lg text-muted-foreground">{blog.summary}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{blog.totalComments} comments</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: blog.content_html }}
              />
            </CardContent>
          </Card>

          {/* Engagement Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="p-2 bg-green-500/10 text-green-500 rounded-full">
                    <ThumbsUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{upvotes}</div>
                    <div className="text-sm text-muted-foreground">Upvotes</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="p-2 bg-red-500/10 text-red-500 rounded-full">
                    <ThumbsDown className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{downvotes}</div>
                    <div className="text-sm text-muted-foreground">
                      Downvotes
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Author Info */}
          {blog.user && (
            <Card>
              <CardHeader>
                <CardTitle>Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={blog.user.avatar} alt={blog.user.name} />
                    <AvatarFallback>
                      {blog.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">{blog.user.name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blog Info */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Blog ID
                </div>
                <div className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
                  {blog._id}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Slug
                </div>
                <div className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
                  /{blog.slug}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Created At
                </div>
                <div className="text-sm mt-1">
                  {new Date(blog.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </div>
                <div className="text-sm mt-1">
                  {new Date(blog.updatedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Comments</span>
                <span className="font-semibold">{blog.totalComments}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Votes
                </span>
                <span className="font-semibold">{upvotes + downvotes}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Net Score</span>
                <span className="font-semibold">{upvotes - downvotes}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <DeleteBlogDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        blog={blogToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
