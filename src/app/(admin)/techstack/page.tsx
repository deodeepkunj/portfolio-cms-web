"use client";

import React, {useEffect, useState} from "react";
import {useDropzone} from "react-dropzone";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {toast} from "react-hot-toast";
import {v4 as uuidv4} from "uuid";

type TechTool = { id: string; name: string; imageUrl: string; order: number };
type TechStackData = {
    status: "draft" | "published";
    header: { badge: string; title: string; subtitle: string };
    tools: TechTool[];
};

export default function TechStackCard() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TechStackData>({
        status: "draft",
        header: {badge: "Our Tools", title: "Technical Stack", subtitle: ""},
        tools: [],
    });

    useEffect(() => {
        fetch("/api/tech-stack?mode=cms")
            .then(res => res.json())
            .then(data => data.header && setFormData(data));
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/tech-stack", {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success("Tech Stack saved!");
                setIsEditing(false);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03]">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">Technical Stack
                    Settings</h4>
                <Button size="sm" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
                    {loading ? "Saving..." : isEditing ? "Save Changes" : "Edit Stack"}
                </Button>
            </div>

            {isEditing ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Badge" value={formData.header.badge} onChange={(e) => setFormData({
                            ...formData,
                            header: {...formData.header, badge: e.target.value}
                        })}/>
                        <Input placeholder="Title" value={formData.header.title} onChange={(e) => setFormData({
                            ...formData,
                            header: {...formData.header, title: e.target.value}
                        })}/>
                    </div>

                    <div className="space-y-4">
                        <Label>Stack Tools</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.tools.map((tool, idx) => (
                                <ToolItemEditor
                                    key={tool.id}
                                    tool={tool}
                                    onUpdate={(f, v) => {
                                        const newTools = [...formData.tools];
                                        newTools[idx] = {...newTools[idx], [f]: v};
                                        setFormData({...formData, tools: newTools});
                                    }}
                                    onDelete={() => setFormData({
                                        ...formData,
                                        tools: formData.tools.filter(t => t.id !== tool.id)
                                    })}
                                />
                            ))}
                        </div>
                        <Button variant="outline" className="w-full border-dashed" onClick={() => setFormData({
                            ...formData,
                            tools: [...formData.tools, {
                                id: uuidv4(),
                                name: "",
                                imageUrl: "",
                                order: formData.tools.length
                            }]
                        })}>
                            + Add Tool
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {formData.tools.map(tool => (
                        <div key={tool.id} className="min-w-[200px] p-4 border rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0"/>
                            <span className="text-sm font-medium dark:text-gray-400">{tool.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ToolItemEditor({tool, onUpdate, onDelete}: {
    tool: TechTool;
    onUpdate: (f: string, v: any) => void;
    onDelete: () => void
}) {
    const {getRootProps, getInputProps} = useDropzone({
        onDrop: (files) => onUpdate("imageUrl", URL.createObjectURL(files[0]))
    });

    return (
        <div className="p-4 border rounded-xl flex items-center gap-4 relative group">
            <div {...getRootProps()}
                 className="w-12 h-12 border-2 border-dashed rounded cursor-pointer overflow-hidden flex-shrink-0">
                <input {...getInputProps()} />
                {tool.imageUrl ? <img src={tool.imageUrl} className="object-contain"/> :
                    <div className="h-full bg-gray-50"/>}
            </div>
            <div className="flex-1">
                <Input
                    className="w-full text-sm bg-transparent outline-none border-b border-transparent focus:border-brand-500"
                    value={tool.name}
                    placeholder="Tool Name (e.g. Docker)"
                    onChange={(e) => onUpdate("name", e.target.value)}
                />
            </div>
            <button onClick={onDelete} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">×
            </button>
        </div>
    );
}