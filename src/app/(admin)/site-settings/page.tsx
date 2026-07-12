"use client";

import React, { useEffect, useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

type MaintenanceSettings = {
  title: string;
  message: string;
  estimatedTime: string;
};

type Settings = {
  maintenanceMode: boolean;
  maintenance: MaintenanceSettings;
};

const DEFAULT_SETTINGS: Settings = {
  maintenanceMode: false,
  maintenance: {
    title: "We'll Be Right Back",
    message:
      "We're performing scheduled maintenance. We'll be back shortly.",
    estimatedTime: "",
  },
};

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/site-settings");
      if (!res.ok) return;
      const data = await res.json();
      setSettings({
        maintenanceMode: data.maintenanceMode ?? false,
        maintenance: {
          title: data.maintenance?.title ?? DEFAULT_SETTINGS.maintenance.title,
          message:
            data.maintenance?.message ?? DEFAULT_SETTINGS.maintenance.message,
          estimatedTime: data.maintenance?.estimatedTime ?? "",
        },
      });
    } catch (err) {
      console.error("Site settings fetch error", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setSaved(false);
      const res = await fetch("/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        console.error("Save failed", await res.json());
        return;
      }
      await fetchSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Site settings save error", err);
    } finally {
      setLoading(false);
    }
  };

  const setMaintenance = (key: keyof MaintenanceSettings, value: string) => {
    setSettings((s) => ({
      ...s,
      maintenance: { ...s.maintenance, [key]: value },
    }));
  };

  return (
    <div className="p-5 md:p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
        Site Settings
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Control maintenance mode and the message shown to visitors.
      </p>

      {/* Active maintenance warning */}
      {settings.maintenanceMode && (
        <div className="flex items-start gap-3 mb-6 rounded-xl border border-orange-400/40 bg-orange-50 dark:bg-orange-900/20 px-4 py-3">
          <span className="text-orange-500 text-lg mt-0.5">⚠</span>
          <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
            Maintenance mode is <strong>ACTIVE</strong> — visitors to your
            public site are currently seeing the downtime page.
          </p>
        </div>
      )}

      {/* Maintenance toggle */}
      <div className="mb-8 p-5 border border-gray-200 dark:border-gray-700 rounded-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-white">
              Maintenance Mode
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              When enabled, all visitors see the downtime page instead of your
              site.
            </p>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={settings.maintenanceMode}
            onClick={() =>
              setSettings((s) => ({
                ...s,
                maintenanceMode: !s.maintenanceMode,
              }))
            }
            className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              settings.maintenanceMode
                ? "bg-orange-500"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-200 ${
                settings.maintenanceMode ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Downtime page content */}
      <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-2xl space-y-5">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
          Downtime Page Content
        </h2>

        <div>
          <Label>Page Title</Label>
          <Input
            value={settings.maintenance.title}
            onChange={(e) => setMaintenance("title", e.target.value)}
            placeholder="We'll Be Right Back"
          />
        </div>

        <div>
          <Label>Message</Label>
          <Input
            value={settings.maintenance.message}
            onChange={(e) => setMaintenance("message", e.target.value)}
            placeholder="We're performing scheduled maintenance..."
          />
        </div>

        <div>
          <Label>Estimated Return Time <span className="text-gray-400 font-normal">(optional)</span></Label>
          <Input
            value={settings.maintenance.estimatedTime}
            onChange={(e) => setMaintenance("estimatedTime", e.target.value)}
            placeholder='e.g. "2 hours" or "Jan 15, 6:00 PM IST"'
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">
            ✓ Saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
