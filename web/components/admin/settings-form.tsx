"use client";

import React, { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Check } from "lucide-react";
import type { SystemSetting } from "@/types/admin";

interface SettingsFormProps {
  initialSettings: SystemSetting[];
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value: !s.value } : s))
    );
  };

  const handleTextChange = (key: string, val: string | number) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value: val } : s))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Card>
      <CardBody className="p-6 space-y-6">
        <div className="space-y-4 divide-y divide-slate-100">
          {settings.map((s) => (
            <div key={s.key} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{s.label}</p>
                <p className="text-[11px] text-slate-500 font-medium max-w-lg">{s.description}</p>
              </div>

              {typeof s.value === "boolean" ? (
                <button
                  type="button"
                  onClick={() => handleToggle(s.key)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    s.value ? "bg-emerald-700" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      s.value ? "translate-x-6" : "translate-x-1"
                    } absolute top-1`}
                  />
                </button>
              ) : (
                <input
                  type="number"
                  value={s.value as number}
                  onChange={(e) => handleTextChange(s.key, Number(e.target.value))}
                  className="w-24 px-2.5 py-1.5 text-xs text-right rounded-lg border border-slate-300 bg-white text-slate-900 font-bold focus:outline-none focus:border-emerald-700 shadow-2xs"
                />
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="sm" onClick={handleSave}>
            {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{saved ? "Saved Configuration" : "Save Changes"}</span>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
