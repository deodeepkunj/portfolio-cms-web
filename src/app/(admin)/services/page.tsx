"use client";

import React, {useEffect, useState} from "react";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import {toast} from "react-hot-toast";
import {v4 as uuid4} from "uuid";

type ServiceItem = {
    id: string;
    title: string;
    description: string;
    icon: string;
    order: number;
};

type ServicesData = {
    status: "draft" | "published";
    header: { badge: string; title: string; subtitle: string };
    items: ServiceItem[];
};

export default function ServicesManagement() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState<ServicesData>({
        status: "draft",
        header: {badge: "Our Expertise", title: "services Offered", subtitle: ""},
        items: [],
    });

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch("/api/services?mode=cms");
                const result = await res.json();
                if (result && result.header) {
                    setFormData(result);
                }
            } catch (err) {
                console.error("Failed to fetch services", err);
            } finally {
                setFetching(false);
            }
        };
        fetchServices();
    }, []);

    const handleSave = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/services", {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save");
            toast.success("services updated successfully");
        } catch (err) {
            toast.error("Save failed");
        } finally {
            setLoading(false);
        }
    };

    const addService = () => {
        const newItem: ServiceItem = {
            id: uuid4(),
            title: "New Service",
            description: "",
            icon: "layout", // Default icon identifier
            order: formData.items.length,
        };
        setFormData({...formData, items: [...formData.items, newItem]});
    };

    const updateItem = (id: string, field: keyof ServiceItem, value: any) => {
        setFormData({
            ...formData,
            items: formData.items.map((item) => (item.id === id ? {...item, [field]: value} : item)),
        });
    };

    const removeItem = (id: string) => {
        setFormData({...formData, items: formData.items.filter((i) => i.id !== id)});
    };

    if (fetching) return <div className="p-10 text-center">Loading Services CMS...</div>;

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6">
            {/* CMS Header Actions */}
            <div
                className="flex flex-col gap-4 border-b pb-6 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Services CMS</h2>
                    <p className="text-sm text-gray-500">Update the services grid appearing on the homepage.</p>
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

            {/* Header Configuration */}
            <ComponentCard title="Main Section Header">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <InputField
                        label="Badge"
                        value={formData.header.badge}
                        onChange={(v) => setFormData({...formData, header: {...formData.header, badge: v}})}
                    />
                    <InputField
                        label="Title"
                        value={formData.header.title}
                        onChange={(v) => setFormData({...formData, header: {...formData.header, title: v}})}
                    />
                    <InputField
                        label="Subtitle"
                        value={formData.header.subtitle}
                        onChange={(v) => setFormData({...formData, header: {...formData.header, subtitle: v}})}
                    />
                </div>
            </ComponentCard>

            {/* services Grid Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Service Cards</h3>
                    <Button size="sm" variant="outline" onClick={addService}>
                        + Add Service Card
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {formData.items
                        .sort((a, b) => a.order - b.order)
                        .map((item) => (
                            <div
                                key={item.id}
                                className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                            >
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
                                >
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd"
                                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                              clipRule="evenodd"/>
                                    </svg>
                                </button>

                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <InputField
                                                label="Icon Key"
                                                value={item.icon}
                                                onChange={(v) => updateItem(item.id, "icon", v)}
                                            />
                                        </div>
                                        <div className="w-20">
                                            <InputField
                                                label="Order"
                                                type="number"
                                                value={item.order.toString()}
                                                onChange={(v) => updateItem(item.id, "order", parseInt(v) || 0)}
                                            />
                                        </div>
                                    </div>

                                    <InputField
                                        label="Service Title"
                                        value={item.title}
                                        onChange={(v) => updateItem(item.id, "title", v)}
                                    />

                                    <div>
                                        <Label>Description</Label>
                                        <textarea
                                            value={item.description}
                                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                            className="mt-1.5 h-24 w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

// Reuse helper for consistency
function InputField({
                        label,
                        value,
                        onChange,
                        type = "text",
                    }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
}) {
    return (
        <div className="w-full">
            <Label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase">{label}</Label>
            <Input type={type} value={value} onChange={(e) => onChange(e.target.value)}/>
        </div>
    );
}