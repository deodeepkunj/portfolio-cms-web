"use client";

import { useParams } from "next/navigation";
import EditBlogForm from "@/components/blog/EditBlogForm";

export default function EditBlogPage() {
  const params = useParams();
  const blogId = params?.id as string;

  if (!blogId) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-red-600">Blog ID not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-1">Edit Blog</h1>
      <p className="text-sm text-gray-500 mb-6">
        Editing blog ID: {blogId}
      </p>

      <EditBlogForm blogId={blogId} />
    </div>
  );
}
