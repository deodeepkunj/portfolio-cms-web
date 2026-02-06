"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRecommendationApi } from "@/hooks/useRecommendationApi";

export default function RecommendationListPage() {
  const { getAll, remove } = useRecommendationApi();
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
      "Are you sure you want to delete this recommendation?"
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
    <ComponentCard title="Recommendations">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Manage testimonials and recommendations
        </p>

        <Link href="/recommendations/create">
          <Button size="sm">+ Add Recommendation</Button>
        </Link>
      </div>

      {/* States */}
      {loading && (
        <p className="text-sm text-gray-500">Loading recommendations...</p>
      )}

      {!loading && data.length === 0 && (
        <p className="text-sm text-gray-500">No recommendations found.</p>
      )}

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((item) => (
          <div
            key={item._id}
            className="relative border rounded-lg p-5 bg-white hover:shadow-sm transition"
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
            <div className="flex items-center gap-4 mb-4">
              <img
                src={item.image}
                alt={item.name}
                className="h-14 w-14 rounded-full object-cover border"
              />

              <div>
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.designation}, {item.company}
                </p>
              </div>
            </div>

            {/* Recommendation */}
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">
              “{item.view}”
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <a
                href={item.linkedinURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                View LinkedIn
              </a>

              <div className="flex gap-2">
                <Link href={`/recommendations/${item._id}/edit`}>
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
