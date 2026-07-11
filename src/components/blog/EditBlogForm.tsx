"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
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
  bannerImage?: string;
  categories?: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

type Props = {
  blogId: string;
};

/* ---------------- IMAGE UPLOAD API ---------------- */
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Upload failed");
  }

  const data = await res.json();
  return data.url;
}

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

  /* NEW */
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categoriesInput, setCategoriesInput] = useState("");

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setInitialLoading(true);
      const blog: Blog = await getBlogById(blogId);
      console.log(blog)

      setTitle(blog.title);
      setSlug(blog.slug);
      setContent(blog.content);
      setExcerpt(blog.excerpt);
      setStatus(blog.status);
      setMetaTitle(blog.seo.metaTitle);
      setMetaDescription(blog.seo.metaDescription);

      setBannerUrl(blog.bannerImage || null);
      setCategoriesInput(blog.categories?.join(", ") || "");
    } catch (err) {
      console.error("Error fetching blog:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  /* ---------------- DROPZONE ---------------- */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: async (files) => {
      if (!files.length) return;

      try {
        setUploadingImage(true);
        const url = await uploadImage(files[0]);
        setBannerUrl(url);
      } catch (err) {
        console.error("Banner upload failed:", err);
      } finally {
        setUploadingImage(false);
      }
    },
  });

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    const categories = categoriesInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug,
      content,
      excerpt,
      status,
      bannerImage: bannerUrl,
      categories,
      seo: {
        metaTitle,
        metaDescription,
      },
    };

    try {
      setUpdateLoading(true);
      await updateBlog(blogId, payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating blog:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteBlog(blogId);
      setDeleteSuccess(true);
      setTimeout(() => router.push("/blogs"), 2000);
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
          <p className="text-gray-500">Loading blog...</p>
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Edit Blog">
      <form onSubmit={handleUpdate}>
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border rounded-md">
                <p className="text-sm text-green-800">
                  ✓ Blog updated successfully!
                </p>
              </div>
            )}

            {/* Title */}
            <div>
              <Label>Blog Title</Label>
              <Input
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
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>

            {/* Banner Image */}
            <div>
              <Label>Banner Image</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
                  isDragActive ? "border-indigo-500" : "border-gray-300"
                }`}
              >
                <input {...getInputProps()} />
                {uploadingImage
                  ? "Uploading image..."
                  : "Drag & drop or click to upload"}
              </div>

              {bannerUrl && (
                <img
                  src={bannerUrl}
                  alt="Banner"
                  className="mt-3 rounded-md border max-h-48 object-cover"
                />
              )}
            </div>

            {/* Content */}
            <div>
              <Label>Content</Label>
              <BlogEditor value={content} onChange={setContent} />
            </div>

            {/* Excerpt */}
            <div>
              <Label>Excerpt</Label>
              <Input
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Categories */}
            <div className="border rounded-md p-5 bg-gray-50">
              <Label>Categories</Label>
              <Input
                placeholder="React, Next.js, Performance"
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma separated
              </p>
            </div>

            {/* SEO */}
            <div className="border rounded-md p-5 bg-gray-50">
              <Label>Meta Title</Label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              <Label className="mt-4">Meta Description</Label>
              <Input
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
              />
            </div>

            {/* Publish */}
            <div className="border rounded-md p-5 bg-white">
              <Label>Status</Label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as BlogStatus)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              <Button
                type="submit"
                size="sm"
                className="w-full mt-4"
                disabled={updateLoading || uploadingImage}
              >
                {updateLoading ? "Updating..." : "Update Blog"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full mt-2 text-red-600"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={deleteLoading}
              >
                Delete Blog
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Delete Blog</h2>
          <p className="mb-6">
            Are you sure you want to delete <b>{title}</b>?
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 text-white"
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </ComponentCard>
  );
}
