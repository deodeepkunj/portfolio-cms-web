"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import RecommendationForm from "@/components/recommendations/RecommendationForm";
import { useRecommendationApi } from "@/hooks/useRecommendationApi";

export default function EditRecommendationPage() {
  const router = useRouter();
  const params = useParams(); // ✅ FIX
  const id = params.id as string;

  const { getById, update, remove } = useRecommendationApi();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    getById(id).then(setData);
  }, [id]);

  if (!data) {
    return (
      <ComponentCard title="Edit Recommendation">
        <p className="text-sm text-gray-500">Loading...</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Edit Recommendation">
      <RecommendationForm
        initialData={data}
        onSubmit={async (payload) => {
          await update(id, payload);
          router.push("/recommendations");
        }}
      />

      <Button
        variant="outline"
        className="mt-6 text-red-600"
        onClick={async () => {
          await remove(id);
          router.push("/recommendations");
        }}
      >
        Delete Recommendation
      </Button>
    </ComponentCard>
  );
}
