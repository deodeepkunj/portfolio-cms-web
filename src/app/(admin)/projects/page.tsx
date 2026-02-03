"use client";

import React, {useEffect, useState} from "react";
import {useDropzone} from "react-dropzone";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {toast} from "react-hot-toast";
import {v4 as uuidv4} from "uuid";
import TextArea from "@/components/form/input/TextArea";

// --- Types ---
type ProjectItem = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    technologies: string[];
    order: number;
    projectUrl: string
};

type ProjectsData = {
    status: "draft" | "published";
    header: { badge: string; title: string; subtitle: string };
    items: ProjectItem[];
};


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
export default function FeaturedProjectsCard() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ProjectsData>({
        status: "draft",
        header: {badge: "Our Work", title: "Featured Projects", subtitle: ""},
        items: [],
    });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("/api/projects?mode=cms");
                if (!res.ok) return;
                const data = await res.json();
                if (data && data.header) setFormData(data);
            } catch (err) {
                console.error("Fetch error", err);
            }
        };
        fetchProjects();
    }, []);

   const handleSave = async () => {
  try {
    setLoading(true);

    // ensure latest state is used
    await new Promise((r) => setTimeout(r, 0));

    console.log("Saving payload:", formData.items);

    const res = await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error();
    toast.success("Projects updated successfully");
    setIsEditing(false);
  } catch {
    toast.error("Failed to save changes");
  } finally {
    setLoading(false);
  }
};

    const updateItem = (id: string, field: keyof ProjectItem, value: any) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item) => (item.id === id ? {...item, [field]: value} : item)),
        }));
    };

    return (
        <div
            className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-2">
                        {formData.header.title || "Featured Projects"}
                    </h4>
                    <p className="text-sm text-gray-500">{formData.header.subtitle || "Manage your portfolio items"}</p>
                </div>

                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleSave} disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                        >
                            Edit Projects
                        </button>
                    )}
                </div>
            </div>

            {isEditing ? (
                /* --- EDIT MODE --- */
                <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <div className="space-y-4">
                            <Label>Header Badge</Label>
                            <Input value={formData.header.badge} onChange={(e) => setFormData({
                                ...formData,
                                header: {...formData.header, badge: e.target.value}
                            })}/>
                        </div>
                        <div className="space-y-4">
                            <Label>Section Title</Label>
                            <Input value={formData.header.title} onChange={(e) => setFormData({
                                ...formData,
                                header: {...formData.header, title: e.target.value}
                            })}/>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Label className="text-base font-bold">Project Items</Label>
                        {formData.items.sort((a, b) => a.order - b.order).map((project) => (
                            <ProjectItemEditor
                                key={project.id}
                                project={project}
                                onUpdate={(field, value) => updateItem(project.id, field, value)}
                                onDelete={() => setFormData({
                                    ...formData,
                                    items: formData.items.filter(p => p.id !== project.id)
                                })}
                            />
                        ))}
                        <Button
                            variant="outline"
                            className="w-full border-dashed py-6"
                            onClick={() => setFormData({
                                ...formData,
                                items: [...formData.items, {
                                    id: uuidv4(),
                                    title: "",
                                    description: "",
                                    imageUrl: "",
                                    technologies: [],
                                    projectUrl:"",
                                    order: formData.items.length
                                }]
                            })}
                        >
                            + Add New Project
                        </Button>
                    </div>
                </div>
            ) : (
                /* --- VIEW MODE --- */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.items.length > 0 ? formData.items.map((project) => (
                        <div key={project.id}
                             className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-gray-50/30 dark:bg-transparent">
                            <div className="aspect-video mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                {project.imageUrl ? (
                                    <img src={project.imageUrl} className="w-full h-full object-cover"
                                         alt={project.title}/>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">No
                                        Image Uploaded</div>
                                )}
                            </div>
                            <h5 className="font-bold text-gray-800 dark:text-white">{project.title || "Untitled Project"}</h5>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description || "No description provided."}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {project.technologies.map((t, i) => (
                                    <span key={i}
                                          className="text-[10px] bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded text-brand-600">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-2 py-10 text-center text-gray-400 border border-dashed rounded-xl">
                            No projects added yet. Click edit to start.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* --- Project Item Editor Component --- */
/* --- Project Item Editor Component --- */
function ProjectItemEditor({
  project,
  onUpdate,
  onDelete,
}: {
  project: ProjectItem;
  onUpdate: (f: keyof ProjectItem, v: any) => void;
  onDelete: () => void;
}) {
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: async (files) => {
      if (!files[0]) return;

      try {
        setUploading(true);
        const uploadedUrl = await uploadImage(files[0]);
        onUpdate("imageUrl", uploadedUrl);
        toast.success("Image uploaded");
      } catch {
        toast.error("Image upload failed");
      } finally {
        setUploading(false); // ✅ FIX
      }
    },
  });

  const handleAddTag = () => {
    const value = tagInput.trim();
    if (value && !project.technologies.includes(value)) {
      onUpdate("technologies", [...project.technologies, value]);
      setTagInput("");
    }
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
      {/* header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">
          Project Config
        </span>
        <button onClick={onDelete} className="text-red-500 text-xs font-medium">
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image */}
        <div
          {...getRootProps()}
          className="border-2 border-dashed rounded-xl h-40 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 dark:bg-gray-800"
        >
          <input {...getInputProps()} />
          {project.imageUrl ? (
            <img src={project.imageUrl} className="h-full w-full object-cover" />
          ) : (
            <p className="text-[10px] text-gray-400 uppercase font-bold">
              Drop Image Here
            </p>
          )}
        </div>

        {uploading && <p className="text-xs text-gray-400">Uploading…</p>}

        {/* Content */}
        <div className="lg:col-span-2 space-y-4">
          <Input
            placeholder="Project Title"
            value={project.title}
            onChange={(e) => onUpdate("title", e.target.value)}
          />

          <Input
            type="number"
            placeholder="Order"
            value={project.order}
            onChange={(e) => onUpdate("order", Number(e.target.value))}
          />

          <TextArea
            rows={2}
            placeholder="Project description"
            value={project.description}
            onChange={(e: any) =>
              onUpdate("description", e.target.value)
            }
          />

        <Input
            placeholder="Project URL"
            value={project.projectUrl}
            onChange={(e) => onUpdate("projectUrl", e.target.value)}
        />

          {/* Tags */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {project.technologies.map((t) => (
                <span key={t} className="text-[10px] px-2 py-1 rounded bg-brand-50">
                  {t}
                  <button
                    onClick={() =>
                      onUpdate(
                        "technologies",
                        project.technologies.filter((x) => x !== t)
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              placeholder="Add technology"
              className="border px-3 py-2 rounded w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
