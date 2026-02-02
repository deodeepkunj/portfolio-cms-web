"use client";

import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { TechStackData, TechTool } from "../../../../types";

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

export default function TechStackCard() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TechStackData>({
        status: "draft",
        header: {
            badge: "Our Tools",
            title: "Technical Stack",
            subtitle: "",
        },
        tools: [],
    });

    useEffect(() => {
        fetch("/api/tech-stack?mode=cms")
            .then((res) => res.json())
            .then((data) => data?.header && setFormData(data));
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/tech-stack", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Tech Stack saved");
                setIsEditing(false);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 border rounded-2xl bg-white dark:bg-white/[0.03]">
            <div className="flex justify-between mb-6">
                <h4 className="text-lg font-semibold">Technical Stack Settings</h4>
                <Button size="sm" onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
                    {loading ? "Saving..." : isEditing ? "Save Changes" : "Edit Stack"}
                </Button>
            </div>

            {isEditing ? (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            placeholder="Badge"
                            value={formData.header.badge}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    header: { ...formData.header, badge: e.target.value },
                                })
                            }
                        />
                        <Input
                            placeholder="Title"
                            value={formData.header.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    header: { ...formData.header, title: e.target.value },
                                })
                            }
                        />
                    </div>

                    {/* Tools */}
                    <div className="space-y-4">
                        <Label>Stack Tools</Label>

                        <div className="grid md:grid-cols-2 gap-4">
                            {formData.tools
                                .sort((a, b) => a.order - b.order)
                                .map((tool, idx) => (
                                    <ToolItemEditor
                                        key={tool.id}
                                        tool={tool}
                                        onUpdate={(field, value) => {
                                            const tools = [...formData.tools];
                                            tools[idx] = { ...tools[idx], [field]: value };
                                            setFormData({ ...formData, tools });
                                        }}
                                        onDelete={() =>
                                            setFormData({
                                                ...formData,
                                                tools: formData.tools.filter((t) => t.id !== tool.id),
                                            })
                                        }
                                    />
                                ))}
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-dashed"
                            onClick={() =>
                                setFormData({
                                    ...formData,
                                    tools: [
                                        ...formData.tools,
                                        {
                                            id: uuidv4(),
                                            name: "",
                                            description: "",
                                            imageUrl: "",
                                            order: formData.tools.length,
                                        },
                                    ],
                                })
                            }
                        >
                            + Add Tool
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto">
                    {formData.tools.map((tool) => (
                        <div key={tool.id} className="min-w-[220px] p-4 border rounded-xl flex gap-3">
                            <img src={tool.imageUrl} className="w-10 h-10 rounded bg-gray-100" />
                            <div>
                                <p className="font-medium">{tool.name}</p>
                                <p className="text-xs text-gray-500">{tool.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ToolItemEditor({
    tool,
    onUpdate,
    onDelete,
}: {
    tool: TechTool;
    onUpdate: (f: keyof TechTool, v: any) => void;
    onDelete: () => void;
}) {
    const [uploading, setUploading] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { "image/*": [] },
        multiple: false,
        onDrop: async ([file]) => {
            if (!file) return;
            try {
                setUploading(true);
                const url = await uploadImage(file);
                onUpdate("imageUrl", url);
                toast.success("Image uploaded");
            } catch {
                toast.error("Upload failed");
            } finally {
                setUploading(false);
            }
        },
    });

    return (
        <div className="p-4 border rounded-xl space-y-3 relative">
            <div className="flex gap-4 items-center">
                <div
                    {...getRootProps()}
                    className="w-12 h-12 border-2 border-dashed rounded cursor-pointer flex items-center justify-center"
                >
                    <input {...getInputProps()} />
                    {tool.imageUrl ? (
                        <img src={tool.imageUrl} className="w-full h-full object-contain" />
                    ) : (
                        "+"
                    )}
                </div>

                <Input
                    placeholder="Tool name"
                    value={tool.name}
                    onChange={(e) => onUpdate("name", e.target.value)}
                />
            </div>

            <Input
                placeholder="Description"
                value={tool.description}
                onChange={(e) => onUpdate("description", e.target.value)}
            />

            <Input
                type="number"
                placeholder="Order"
                value={tool.order}
                onChange={(e) => onUpdate("order", Number(e.target.value))}
            />

            {uploading && <p className="text-xs text-gray-400">Uploading...</p>}

            <button
                onClick={onDelete}
                className="absolute top-2 right-2 text-red-500"
            >
                ×
            </button>
        </div>
    );
}
