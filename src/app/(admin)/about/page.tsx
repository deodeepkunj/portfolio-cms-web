"use client";

import React, {useEffect, useState} from "react";
import {useDropzone} from "react-dropzone";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import {toast} from "react-hot-toast";
import {v4 as uuid4} from "uuid"; // Recommended for generating unique IDs

type Feature = {
    id: string;
    icon: string;
    text: string;
    order: number;
};

type AboutUsData = {
    status: "draft" | "published";
    header: { badge: string; title: string; subtitle: string };
    hero: { imageUrl: string; yearsOfExperience: number };
    content: { heading: string; paragraphs: string[] };
    features: Feature[];
};

export default function AboutUsPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState<AboutUsData>({
        status: "draft",
        header: {badge: "", title: "", subtitle: ""},
        hero: {imageUrl: "", yearsOfExperience: 0},
        content: {heading: "", paragraphs: [""]},
        features: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/about-us");
                const data = await res.json();
                // Only merge if data is not an empty object
                if (data && data.header) {
                    setFormData(data);
                }
            } catch (err) {
                console.error("Failed to fetch About Us data", err);
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, []);

    // --- Feature Handlers ---
    const addFeature = () => {
        const newFeature: Feature = {
            id: uuid4(),
            icon: "Star", // Default icon
            text: "",
            order: formData.features.length + 1,
        };
        setFormData({...formData, features: [...formData.features, newFeature]});
    };

    const updateFeature = (id: string, field: keyof Feature, value: string | number) => {
        const updatedFeatures = formData.features.map((f) =>
            f.id === id ? {...f, [field]: value} : f
        );
        setFormData({...formData, features: updatedFeatures});
    };

    const removeFeature = (id: string) => {
        setFormData({
            ...formData,
            features: formData.features.filter((f) => f.id !== id),
        });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/about-us", {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Update failed");
            toast.success("About Us saved!");
        } catch (err) {
            toast.error("Error saving changes");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center">Loading Settings...</div>;

    return (
        <div className="mx-auto max-w-6xl space-y-8 p-6">
            {/* Header Bar */}
            <div
                className="flex flex-col gap-4 border-b pb-6 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">About Us CMS</h2>
                    <p className="text-sm text-gray-500">Configure your brand story and core features.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <SectionCard title="Company Header">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InputField
                                label="Badge"
                                value={formData.header.badge}
                                onChange={(v) => setFormData({...formData, header: {...formData.header, badge: v}})}
                            />
                            <InputField
                                label="Main Title"
                                value={formData.header.title}
                                onChange={(v) => setFormData({...formData, header: {...formData.header, title: v}})}
                            />
                            <div className="md:col-span-2">
                                <InputField
                                    label="Subtitle"
                                    value={formData.header.subtitle}
                                    onChange={(v) => setFormData({
                                        ...formData,
                                        header: {...formData.header, subtitle: v}
                                    })}
                                />
                            </div>
                        </div>
                    </SectionCard>
                    <SectionCard title="Main Content">
                        <div className="space-y-4">
                            <InputField
                                label="Heading"
                                value={formData.content.heading}
                                onChange={(v) => setFormData({...formData, content: {...formData.content, heading: v}})}
                            />
                            <div>
                                <Label>Paragraphs</Label>
                                {formData.content.paragraphs.map((p, i) => (
                                    <textarea
                                        key={i}
                                        className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        rows={3}
                                        value={p}
                                        onChange={(e) => {
                                            const newParas = [...formData.content.paragraphs];
                                            newParas[i] = e.target.value;
                                            setFormData({
                                                ...formData,
                                                content: {...formData.content, paragraphs: newParas}
                                            });
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </SectionCard>

                    {/* FEATURES SECTION */}
                    <SectionCard title="Core Features">
                        <div className="space-y-4">
                            {formData.features.sort((a, b) => a.order - b.order).map((feature, index) => (
                                <div key={feature.id}
                                     className="group relative rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                        <div className="md:col-span-3">
                                            <InputField
                                                label="Icon Name"
                                                value={feature.icon}
                                                onChange={(v) => updateFeature(feature.id, "icon", v)}
                                            />
                                        </div>
                                        <div className="md:col-span-7">
                                            <InputField
                                                label="Feature Description"
                                                value={feature.text}
                                                onChange={(v) => updateFeature(feature.id, "text", v)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <InputField
                                                label="Order"
                                                type="number"
                                                value={feature.order.toString()}
                                                onChange={(v) => updateFeature(feature.id, "order", parseInt(v) || 0)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFeature(feature.id)}
                                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addFeature}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm font-medium text-gray-500 transition-colors hover:border-brand-500 hover:text-brand-500 dark:border-gray-700"
                            >
                                + Add New Feature
                            </button>
                        </div>
                    </SectionCard>
                </div>

                {/* Sidebar Area */}
                <div className="space-y-8">
                    <HeroImageUploader
                        imageUrl={formData.hero.imageUrl}
                        onUpload={(url) => setFormData({...formData, hero: {...formData.hero, imageUrl: url}})}
                    />

                    <SectionCard title="Statistics">
                        <InputField
                            label="Years of Experience"
                            type="number"
                            value={formData.hero.yearsOfExperience.toString()}
                            onChange={(v) =>
                                setFormData({
                                    ...formData,
                                    hero: {...formData.hero, yearsOfExperience: parseInt(v) || 0}
                                })
                            }
                        />
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}

// --- Internal Helper Components ---

function SectionCard({title, children}: { title: string; children: React.ReactNode }) {
    return (
        <div
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-6 text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
            {children}
        </div>
    );
}

function InputField({label, value, onChange, type = "text"}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string
}) {
    return (
        <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</Label>
            <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5"/>
        </div>
    );
}

function HeroImageUploader({imageUrl, onUpload}: { imageUrl: string; onUpload: (url: string) => void }) {
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        accept: {"image/*": []},
        multiple: false,
        onDrop: (files) => {
            const url = URL.createObjectURL(files[0]);
            onUpload(url);
        },
    });

    return (
        <ComponentCard title="Hero Image">
            <div
                {...getRootProps()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-4 transition-all ${
                    isDragActive ? "border-brand-500 bg-brand-50/10" : "border-gray-200 dark:border-gray-700"
                }`}
            >
                <input {...getInputProps()} />
                {imageUrl ? (
                    <div className="group relative h-48 w-full overflow-hidden rounded-lg">
                        <img src={imageUrl} alt="Hero"
                             className="h-full w-full object-cover transition-transform group-hover:scale-105"/>
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <span
                                className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-black">Change Image</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-8">
                        <div
                            className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
                                 viewBox="0 0 24 24">
                                <path d="M12 4v16m8-8H4"/>
                            </svg>
                        </div>
                        <p className="text-xs text-gray-500">Click or drag image to upload</p>
                    </div>
                )}
            </div>
        </ComponentCard>
    );
}