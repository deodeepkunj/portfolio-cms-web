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

export default function EducationForm({
  initialData,
  onSubmit,
  loading,
}: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [degree, setDegree] = useState(initialData?.degree || "");
  const [detail, setDetail] = useState(initialData?.detail || "");
  const [year, setYear] = useState(initialData?.year || "");
  const [order, setOrder] = useState(initialData?.order ?? 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      title,
      degree,
      detail,
      year,
      order: Number(order) || 0,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Institute */}
      <div>
        <Label>Institute</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {/* Degree */}
      <div>
        <Label>Degree</Label>
        <Input value={degree} onChange={(e) => setDegree(e.target.value)} />
      </div>

      {/* Detail */}
      <div>
        <Label>Description</Label>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm min-h-[120px]"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
      </div>

      {/* Year range */}
      <div>
        <Label>Duration</Label>
        <Input
          placeholder="2013-2017"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
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
        {loading ? "Saving..." : "Save Education"}
      </Button>
    </form>
  );
}
