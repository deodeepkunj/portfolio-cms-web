"use client";

export function useRecommendationApi() {
  const getAll = async () => {
    const res = await fetch("/api/recommendations?mode=cms");
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  };

const getById = async (id: string) => {
  const res = await fetch(`/api/recommendations/${id}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch recommendation");
  }

  return res.json();
};

  const create = async (payload: any) => {
    const res = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Create failed");
    return res.json();
  };

  const update = async (id: string, payload: any) => {
    const res = await fetch(`/api/recommendations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Update failed");
    return res.json();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/recommendations/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Delete failed");
    return res.json();
  };

  return { getAll, getById, create, update, remove };
}
