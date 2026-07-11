"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

type Props = {
  initialData?: any;
  onSubmit: (payload: any) => Promise<void>;
  loading?: boolean;
};

export default function ExperienceForm({
  initialData,
  onSubmit,
  loading,
}: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [desc, setDesc] = useState<string[]>(
    initialData?.desc?.length ? initialData.desc : [""]
  );
  const [year, setYear] = useState(initialData?.year || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [order, setOrder] = useState(initialData?.order ?? 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const updateBullet = (index: number, value: string) => {
    const next = [...desc];
    next[index] = value;
    setDesc(next);
  };

  const addBullet = () => setDesc([...desc, ""]);

  const removeBullet = (index: number) =>
    setDesc(desc.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      title,
      role,
      desc: desc.map((b) => b.trim()).filter(Boolean),
      year,
      location,
      order: Number(order) || 0,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company */}
      <div>
        <Label>Company</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {/* Role */}
      <div>
        <Label>Role / Title</Label>
        <Input value={role} onChange={(e) => setRole(e.target.value)} />
      </div>

      {/* Bullets */}
      <div>
        <Label>Highlights</Label>
        <div className="space-y-3">
          {desc.map((bullet, index) => (
            <div key={index} className="flex items-start gap-2">
              <textarea
                className="w-full border rounded px-3 py-2 text-sm min-h-[60px]"
                value={bullet}
                onChange={(e) => updateBullet(index, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeBullet(index)}
                className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addBullet}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-brand-500 hover:text-brand-500 dark:border-gray-700"
          >
            + Add Highlight
          </button>
        </div>
      </div>

      {/* Year range & Location */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Duration</Label>
          <Input
            placeholder="03/2025 - Present"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div>
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
      </div>

      {/* Order */}
      <div>
        <Label>Order</Label>
        <Input
          type="number"
          value={order.toString()}
          onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
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

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Experience"}
      </Button>
    </form>
  );
}
