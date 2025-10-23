"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/app/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { DeleteBlogDialog } from "./delete-blog-dialog";

export type Blog = {
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
  };
  isPublished: boolean;
  totalComments: number;
  createdAt: string;
  updatedAt: string;
};

export function BlogsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState<Blog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    nexturl: null as string | null,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [blogToDelete, setBlogToDelete] = React.useState<Blog | undefined>();

  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();

  const columns: ColumnDef<Blog>[] = [
    {
      id: "select",
      size: 40,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      size: 250,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="max-w-[250px]">
          <div className="font-medium truncate">{row.getValue("title")}</div>
          <div className="text-xs text-muted-foreground truncate">
            /{row.original.slug}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "summary",
      size: 300,
      header: "Summary",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-muted-foreground">
          {row.getValue("summary")}
        </div>
      ),
    },
    {
      accessorKey: "tags",
      size: 150,
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string[];
        return (
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isPublished",
      size: 100,
      header: "Status",
      cell: ({ row }) => {
        const isPublished = row.getValue("isPublished") as boolean;
        return (
          <Badge
            variant={isPublished ? "default" : "destructive"}
            className={
              isPublished
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }
          >
            {isPublished ? "Published" : "Draft"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalComments",
      size: 100,
      header: () => <div className="text-center">Comments</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("totalComments")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      size: 180,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          {new Date(row.getValue("createdAt")).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ),
    },
    {
      id: "actions",
      size: 50,
      enableHiding: false,
      cell: ({ row }) => {
        const blog = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(blog._id)}
              >
                Copy blog ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/blogs/${blog._id}`}
                  className="flex items-center cursor-pointer"
                >
                  View blog
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  setBlogToDelete(blog);
                  setDeleteDialogOpen(true);
                }}
              >
                Delete blog
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const loadBlogs = React.useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!accessToken) {
        console.error("No access token available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/blogs?page=${page}&limit=${limit}`,
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
          throw new Error("Failed to fetch blogs");
        }

        const result = await response.json();
        if (result.success && result.data) {
          setData(result.data);
          setPagination(result.pagination);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadBlogs(1, 10);
    }
  }, [authLoading, isAuthenticated, loadBlogs]);

  const handleNextPage = () => {
    if (pagination.nexturl) {
      loadBlogs(pagination.page + 1, pagination.limit);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      loadBlogs(pagination.page - 1, pagination.limit);
    }
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (authLoading || loading) {
    return <div>Loading blogs...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please login to view blogs</div>;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filter blogs by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
          <span className="ml-2">• Page {pagination.page}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={pagination.page === 1 || loading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!pagination.nexturl || loading}
          >
            Next
          </Button>
        </div>
      </div>
      <DeleteBlogDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        blog={blogToDelete}
        onSuccess={loadBlogs}
      />
    </div>
  );
}
