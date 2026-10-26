"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";

export type ChartPoint = { day: string; learned: number };

export function ProgressChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="learnedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#706be4" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#706be4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#edf0f5" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8993a5", fontSize: 12 }} dy={8} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#8993a5", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #e9edf4", boxShadow: "0 8px 24px #17203312" }}
            labelStyle={{ color: "#39445a", fontWeight: 600 }}
            formatter={(value) => [`${value} kata`, "Dipelajari"]}
          />
          <Area type="monotone" dataKey="learned" stroke="#625edb" strokeWidth={2.5} fill="url(#learnedFill)" activeDot={{ r: 5, fill: "#625edb" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
