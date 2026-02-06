"use client";

import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import RecommendationForm from "@/components/recommendations/RecommendationForm";
import { useRecommendationApi } from "@/hooks/useRecommendationApi";

export default function CreateRecommendationPage() {
  const router = useRouter();
  const { create } = useRecommendationApi();

  return (
    <ComponentCard title="Create Recommendation">
      <RecommendationForm
        onSubmit={async (payload) => {
          await create(payload);
          router.push("/recommendations");
        }}
      />
    </ComponentCard>
  );
}
