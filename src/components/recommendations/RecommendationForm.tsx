"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

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


type Props = {
  initialData?: any;
  onSubmit: (payload: any) => Promise<void>;
  loading?: boolean;
};

export default function RecommendationForm({
  initialData,
  onSubmit,
  loading,
}: Props) {
  const [name, setName] = useState(initialData?.name || "");
  const [designation, setDesignation] = useState(initialData?.designation || "");
  const [company, setCompany] = useState(initialData?.company || "");
  const [view, setView] = useState(initialData?.view || "");
  const [linkedinURL, setLinkedinURL] = useState(initialData?.linkedinURL || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [image, setImage] = useState<string | null>(initialData?.image || null);
  const [uploading, setUploading] = useState(false);

  /* ---------------- DROPZONE ---------------- */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: async (files) => {
      if (!files.length) return;

      try {
        setUploading(true);
        const url = await uploadImage(files[0]);
        setImage(url);
      } catch (err) {
        console.error("Image upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload an image");
      return;
    }

    await onSubmit({
      name,
      image,
      designation,
      company,
      view,
      linkedinURL,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      {/* Image */}
      <div>
        <Label>Profile Image</Label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
            isDragActive ? "border-indigo-500" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {uploading
            ? "Uploading image..."
            : "Drag & drop image or click to upload"}
        </div>

        {image && (
          <img
            src={image}
            alt="Preview"
            className="mt-3 h-24 w-24 rounded-full object-cover border"
          />
        )}
      </div>

      {/* Designation */}
      <div>
        <Label>Designation</Label>
        <Input
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
        />
      </div>

      {/* Company */}
      <div>
        <Label>Company</Label>
        <Input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {/* Recommendation Text */}
      <div>
        <Label>Recommendation</Label>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm min-h-[120px]"
          value={view}
          onChange={(e) => setView(e.target.value)}
        />
      </div>

      {/* LinkedIn URL */}
      <div>
        <Label>LinkedIn URL</Label>
        <Input
          type="url"
          placeholder="https://linkedin.com/in/username"
          value={linkedinURL}
          onChange={(e) => setLinkedinURL(e.target.value)}
        />
      </div>

      {/* Active */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <Label>Active</Label>
      </div>

      <Button type="submit" disabled={loading || uploading}>
        {loading ? "Saving..." : "Save Recommendation"}
      </Button>
    </form>
  );
}
