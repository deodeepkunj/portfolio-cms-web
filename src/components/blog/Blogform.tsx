"use client";

import { useState, FormEvent } from "react";
import BlogEditor from "@/components/blog/BlogEditor";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { slugify } from "@/constants";
import { useBlogApi } from "@/hooks/useBlogApi";

type BlogStatus = "draft" | "published";

export default function BlogForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<BlogStatus>("draft");

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [success, setSuccess] = useState(false);
  const { loading, error, createBlog } = useBlogApi();

  const handleSubmit = async (e: FormEvent) => {
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
      await createBlog(payload);
      setSuccess(true);

      // Reset form
      setTitle("");
      setSlug("");
      setContent("");
      setExcerpt("");
      setMetaTitle("");
      setMetaDescription("");
      setStatus("draft");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error creating blog →", err);
    }
  };

  return (
    <ComponentCard title="Create Blog">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-8">
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
                <p className="text-sm text-green-800 dark:text-green-200">✓ Blog saved successfully!</p>
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

          {/* ================= RIGHT: SETTINGS ================= */}
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
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as BlogStatus)
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <Button type="submit" size="sm" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : "Save Blog"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </ComponentCard>
  );
}