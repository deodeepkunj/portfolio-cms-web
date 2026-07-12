"use client";

import { useEffect, useState } from "react";

export type AnalyticsError = "not-configured" | "failed";

export function useAnalyticsApi() {
  const getReport = async (report: string, days?: number | "all") => {
    const qs = days ? `&days=${days}` : "";
    const res = await fetch(`/api/analytics?report=${report}${qs}`);
    if (res.status === 503) throw new Error("not-configured");
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return res.json();
  };

  return { getReport };
}

/**
 * Stateful report fetcher shared by the dashboard widgets.
 * Refetches when `report` or `days` change; optional `refreshMs`
 * polls in the background without flashing the loading state.
 */
export function useAnalyticsReport<T>(report: string, days?: number | "all", refreshMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AnalyticsError | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (initial: boolean) => {
      if (initial) {
        setLoading(true);
        setError(null);
      }
      try {
        const qs = days ? `&days=${days}` : "";
        const res = await fetch(`/api/analytics?report=${report}${qs}`);
        if (res.status === 503) throw new Error("not-configured");
        if (!res.ok) throw new Error("failed");
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error && err.message === "not-configured" ? "not-configured" : "failed");
        }
      } finally {
        if (!cancelled && initial) setLoading(false);
      }
    };

    load(true);

    let interval: ReturnType<typeof setInterval> | undefined;
    if (refreshMs) {
      interval = setInterval(() => load(false), refreshMs);
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [report, days, refreshMs]);

  return { data, loading, error };
}
