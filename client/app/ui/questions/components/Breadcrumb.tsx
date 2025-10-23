"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface BreadcrumbProps {
  questionTitle: string;
}

export default function Breadcrumb({ questionTitle }: BreadcrumbProps) {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/dashboard/questions"
            className="text-blue-600 hover:text-blue-800"
          >
            Questions
          </Link>
        </li>
        <li>
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
        </li>
        <li className="text-gray-500 truncate max-w-md">{questionTitle}</li>
      </ol>
    </nav>
  );
}
