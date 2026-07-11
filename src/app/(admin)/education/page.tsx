"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useEducationApi } from "@/hooks/useEducationApi";

export default function EducationListPage() {
  const { getAll, remove } = useEducationApi();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getAll()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this education entry?"
    );
    if (!confirm) return;

    setDeletingId(id);
    try {
      await remove(id);
      setData((prev) => prev.filter((item) => item._id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ComponentCard title="Education">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Manage your education history
        </p>

        <Link href="/education/create">
          <Button size="sm">+ Add Education</Button>
        </Link>
      </div>

      {/* States */}
      {loading && (
        <p className="text-sm text-gray-500">Loading education...</p>
      )}

      {!loading && data.length === 0 && (
        <p className="text-sm text-gray-500">No education entries found.</p>
      )}

      {/* List */}
      <div className="space-y-4">
        {data.map((item) => (
          <div
            key={item._id}
            className="relative border rounded-lg p-5 bg-white hover:shadow-sm transition dark:border-gray-800 dark:bg-white/[0.03]"
          >
            {/* Status */}
            <span
              className={`absolute top-4 right-4 text-xs px-2 py-1 rounded ${
                item.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {item.isActive ? "Active" : "Inactive"}
            </span>

            {/* Header */}
            <div className="mb-3">
              <p className="font-semibold text-gray-900 dark:text-white">
                {item.title}
              </p>
              <p className="text-sm italic text-gray-600 dark:text-gray-400">
                {item.degree}
              </p>
            </div>

            {/* Description */}
            <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
              {item.detail}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{item.year}</p>

              <div className="flex gap-2">
                <Link href={`/education/${item._id}/edit`}>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  disabled={deletingId === item._id}
                  onClick={() => handleDelete(item._id)}
                >
                  {deletingId === item._id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ComponentCard>
  );
}
