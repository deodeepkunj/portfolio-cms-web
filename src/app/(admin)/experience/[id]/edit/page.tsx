"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import ExperienceForm from "@/components/experience/ExperienceForm";
import { useExperienceApi } from "@/hooks/useExperienceApi";

export default function EditExperiencePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { getById, update, remove } = useExperienceApi();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    getById(id).then(setData);
  }, [id]);

  if (!data) {
    return (
      <ComponentCard title="Edit Experience">
        <p className="text-sm text-gray-500">Loading...</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Edit Experience">
      <ExperienceForm
        initialData={data}
        onSubmit={async (payload) => {
          await update(id, payload);
          router.push("/experience");
        }}
      />

      <Button
        variant="outline"
        className="mt-6 text-red-600"
        onClick={async () => {
          await remove(id);
          router.push("/experience");
        }}
      >
        Delete Experience
      </Button>
    </ComponentCard>
  );
}
