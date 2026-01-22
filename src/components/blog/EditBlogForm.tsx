"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import BlogEditor from "@/components/blog/BlogEditor";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useBlogApi } from "@/hooks/useBlogApi";
import { slugify } from "@/constants";
import { Modal } from "@/components/ui/modal";

type BlogStatus = "draft" | "published";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: BlogStatus;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

type Props = {
  blogId: string;
};

export default function EditBlogForm({ blogId }: Props) {
  const router = useRouter();
  const { loading, error, getBlogById, updateBlog, deleteBlog } = useBlogApi();
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<BlogStatus>("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setInitialLoading(true);
      const blog: Blog = await getBlogById(blogId);
      setTitle(blog.title);
      setSlug(blog.slug);
      setContent(blog.content);
      setExcerpt(blog.excerpt);
      setStatus(blog.status);
      setMetaTitle(blog.seo.metaTitle);
      setMetaDescription(blog.seo.metaDescription);
    } catch (err) {
      console.error("Error fetching blog:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    const payload = {
      title,
      slug,
      content,
      excerpt,
      status,
      seo: {
        metaTitle,
        metaDescription,
      },
    };

    try {
      setUpdateLoading(true);
      await updateBlog(blogId, payload);
      setSuccess(true);

      // Auto-clear success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating blog:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteBlog(blogId);
      setDeleteSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/admin/blogs");
      }, 2000);
    } catch (err) {
      console.error("Error deleting blog:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <ComponentCard title="Edit Blog">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading blog...</p>
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Edit Blog">
      <form onSubmit={handleUpdate}>
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-sm text-green-800 dark:text-green-200">✓ Blog updated successfully!</p>
              </div>
            )}

            {/* Delete Success Message */}
            {deleteSuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-sm text-green-800 dark:text-green-200">✓ Blog deleted successfully! Redirecting...</p>
              </div>
            )}

            {/* Title */}
            <div>
              <Label>Blog Title</Label>
              <Input
                type="text"
                placeholder="Enter blog title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSlug(slugify(e.target.value));
                }}
              />
            </div>

            {/* Slug */}
            <div>
              <Label>Slug</Label>
              <Input
                type="text"
                placeholder="blog-title-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                URL Preview: <span className="font-medium">/blog/{slug || "your-slug"}</span>
              </p>
            </div>

            {/* Content */}
            <div>
              <Label>Content</Label>
              <div className="border rounded-md bg-white dark:bg-gray-900">
                <BlogEditor value={content} onChange={setContent} />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <Label>Excerpt</Label>
              <Input
                type="text"
                placeholder="Short summary for blog listing and SEO"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </div>

          {/* RIGHT COLUMN - SETTINGS */}
          <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-6 h-fit">
            {/* SEO CARD */}
            <div className="border rounded-md p-5 bg-gray-50 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                SEO Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    type="text"
                    placeholder="SEO title (60 chars)"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Meta Description</Label>
                  <Input
                    type="text"
                    placeholder="SEO description (160 chars)"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* PUBLISH CARD */}
            <div className="border rounded-md p-5 bg-white dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                Publish
              </h3>

              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <select
                    className="w-full border border-gray-200 dark:border-white/[0.05] rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as BlogStatus)
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Updating..." : "Update Blog"}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={openDeleteModal}
                  disabled={deleteLoading}
                >
                  Delete Blog
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        showCloseButton={true}
        className="max-w-[500px] m-4"
      >
        <div className="p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Delete Blog
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete <span className="font-semibold">"{title}"</span>? This action cannot be undone.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={closeDeleteModal}
              className="order-2 sm:order-1"
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? "Deleting..." : "Delete Blog"}
            </Button>
          </div>
        </div>
      </Modal>
    </ComponentCard>
  );
}
