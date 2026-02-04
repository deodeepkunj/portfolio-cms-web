"use client";

import { useState, FormEvent } from "react";
import { useDropzone } from "react-dropzone";
import BlogEditor from "@/components/blog/BlogEditor";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { slugify } from "@/constants";
import { useBlogApi } from "@/hooks/useBlogApi";

/* -------------------- IMAGE UPLOAD API -------------------- */
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

type BlogStatus = "draft" | "published";

export default function BlogForm() {
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

  const [success, setSuccess] = useState(false);
  const { loading, error, createBlog } = useBlogApi();

  /* -------------------- DROPZONE -------------------- */
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
        console.error("Image upload failed →", err);
      } finally {
        setUploadingImage(false);
      }
    },
  });

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async (e: FormEvent) => {
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
      console.log("payload", payload)
      await createBlog(payload);
      setSuccess(true);

      setTitle("");
      setSlug("");
      setContent("");
      setExcerpt("");
      setMetaTitle("");
      setMetaDescription("");
      setCategoriesInput("");
      setBannerUrl(null);
      setStatus("draft");

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error creating blog →", err);
    }
  };

  return (
    <ComponentCard title="Create Blog">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-8">
          {/* ================= LEFT ================= */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✓ Blog saved successfully!
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
              <p className="mt-1 text-xs text-gray-500">
                /blog/{slug || "your-slug"}
              </p>
            </div>

            {/* Banner Image */}
            <div>
              <Label>Banner Image</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
                  isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                }`}
              >
                <input {...getInputProps()} />
                {uploadingImage ? (
                  <p className="text-sm">Uploading image...</p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Drag & drop image here, or click to select
                  </p>
                )}
              </div>

              {bannerUrl && (
                <img
                  src={bannerUrl}
                  alt="Banner preview"
                  className="mt-3 rounded-md border max-h-48 object-cover"
                />
              )}
            </div>

            {/* Content */}
            <div>
              <Label>Content</Label>
              <div className="border rounded-md bg-white">
                <BlogEditor value={content} onChange={setContent} />
              </div>
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

          {/* ================= RIGHT ================= */}
          <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-6 h-fit">
            {/* Categories */}
            <div className="border rounded-md p-5 bg-gray-50">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-600">
                Categories
              </h3>
              <Input
                placeholder="e.g. React, Next.js, Performance"
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Comma separated values
              </p>
            </div>

            {/* SEO */}
            <div className="border rounded-md p-5 bg-gray-50">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-600">
                SEO Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Meta Description</Label>
                  <Input
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Publish */}
            <div className="border rounded-md p-5 bg-white">
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

              <Button
                type="submit"
                size="sm"
                className="w-full mt-4"
                disabled={loading || uploadingImage}
              >
                {loading ? "Saving..." : "Save Blog"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </ComponentCard>
  );
}
