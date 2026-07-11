"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import EducationForm from "@/components/education/EducationForm";
import { useEducationApi } from "@/hooks/useEducationApi";

export default function EditEducationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { getById, update, remove } = useEducationApi();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    getById(id).then(setData);
  }, [id]);

  if (!data) {
    return (
      <ComponentCard title="Edit Education">
        <p className="text-sm text-gray-500">Loading...</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Edit Education">
      <EducationForm
        initialData={data}
        onSubmit={async (payload) => {
          await update(id, payload);
          router.push("/education");
        }}
      />

      <Button
        variant="outline"
        className="mt-6 text-red-600"
        onClick={async () => {
          await remove(id);
          router.push("/education");
        }}
      >
        Delete Education
      </Button>
    </ComponentCard>
  );
}
