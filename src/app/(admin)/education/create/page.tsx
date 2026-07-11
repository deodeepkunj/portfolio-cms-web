"use client";

import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import EducationForm from "@/components/education/EducationForm";
import { useEducationApi } from "@/hooks/useEducationApi";

export default function CreateEducationPage() {
  const router = useRouter();
  const { create } = useEducationApi();

  return (
    <ComponentCard title="Create Education">
      <EducationForm
        onSubmit={async (payload) => {
          await create(payload);
          router.push("/education");
        }}
      />
    </ComponentCard>
  );
}
