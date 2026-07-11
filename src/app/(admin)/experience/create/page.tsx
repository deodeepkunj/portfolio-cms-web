"use client";

import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import ExperienceForm from "@/components/experience/ExperienceForm";
import { useExperienceApi } from "@/hooks/useExperienceApi";

export default function CreateExperiencePage() {
  const router = useRouter();
  const { create } = useExperienceApi();

  return (
    <ComponentCard title="Create Experience">
      <ExperienceForm
        onSubmit={async (payload) => {
          await create(payload);
          router.push("/experience");
        }}
      />
    </ComponentCard>
  );
}
