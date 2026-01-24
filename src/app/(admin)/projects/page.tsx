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
};

type ProjectsData = {
    status: "draft" | "published";
    header: { badge: string; title: string; subtitle: string };
    items: ProjectItem[];
};

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
            const res = await fetch("/api/projects", {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error();
            toast.success("Projects updated successfully");
            setIsEditing(false);
        } catch (err) {
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
function ProjectItemEditor({project, onUpdate, onDelete}: {
    project: ProjectItem;
    onUpdate: (f: keyof ProjectItem, v: any) => void;
    onDelete: () => void
}) {
    const [tagInput, setTagInput] = useState("");

    const {getRootProps, getInputProps} = useDropzone({
        accept: {"image/*": []},
        multiple: false,
        onDrop: (files) => {
            if (files[0]) {
                const url = URL.createObjectURL(files[0]);
                onUpdate("imageUrl", url);
            }
        }
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
            <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">Project Config</span>
                <button type="button" onClick={onDelete}
                        className="text-red-500 text-xs hover:text-red-700 font-medium">
                    Remove
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Image Upload */}
                <div {...getRootProps()}
                     className="border-2 border-dashed rounded-xl h-40 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 dark:bg-gray-800 hover:border-brand-500 transition-all">
                    <input {...getInputProps()} />
                    {project.imageUrl ? (
                        <img src={project.imageUrl} className="h-full w-full object-cover" alt="Preview"/>
                    ) : (
                        <div className="text-center p-4">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Drop Image Here</p>
                        </div>
                    )}
                </div>

                {/* Right: Text Content */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Project Title</Label>
                            <Input value={project.title} onChange={(e) => onUpdate("title", e.target.value)}
                                   placeholder="e.g. E-Commerce Platform"/>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Display Order</Label>
                            <Input type="number" value={project.order.toString()}
                                   onChange={(e) => onUpdate("order", parseInt(e.target.value) || 0)}/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Description</Label>
                        <TextArea
                            className="w-full text-sm border border-gray-300 rounded-lg p-3 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-brand-500 outline-none"
                            rows={2}
                            placeholder="Briefly describe the project and solutions..."
                            value={project.description}
                            onChange={(e: any) => onUpdate("description", e.target.value)}
                        />
                    </div>

                    {/* FIXED Technology Tag Input */}
                    <div className="space-y-2">
                        <Label className="text-xs">Technologies (Press Enter to add)</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {project.technologies.map((t, i) => (
                                <span key={i}
                                      className="bg-brand-50 dark:bg-brand-500/10 text-brand-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                                    {t}
                                    <button type="button"
                                            onClick={() => onUpdate("technologies", project.technologies.filter(tag => tag !== t))}
                                            className="hover:text-red-500 font-bold ml-1">×</button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
                                placeholder="e.g. React Native"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleAddTag();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-200"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}