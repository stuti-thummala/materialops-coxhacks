"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { impactCategories } from "@/lib/mockData";

export function ImpactDonutChart() {
  return (
    <div className="flex flex-col items-center gap-6 md:flex-row">
      <div className="relative h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={impactCategories}
              dataKey="tons"
              nameKey="label"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              stroke="none"
            >
              {impactCategories.map((cat) => (
                <Cell key={cat.label} fill={cat.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display text-2xl font-bold text-ops-ink">18.7 t</div>
          <div className="text-xs text-ops-muted">Total Recovered</div>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {impactCategories.map((cat) => (
          <div
            key={cat.label}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-ops-ink/80">{cat.label}</span>
            </div>
            <div className="text-ops-muted">
              {cat.tons} t ·{" "}
              <span className="font-semibold text-ops-ink">{cat.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
