"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Delta } from "@/components/delta";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TipRow = { label: string; value: string; color: string };

function ChartTip({ title, rows }: { title: string; rows: TipRow[] }) {
  return (
    <div className="rounded-[10px] border border-[#E4EDE5] bg-white shadow-[0_8px_24px_-10px_rgba(14,32,22,.25)] px-3 py-2 text-[12px]">
      <div className="font-bold text-dark mb-1">{title}</div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 text-muted">
          <i className="size-2 rounded-full" style={{ background: r.color }} />
          <span>{r.label}</span>
          <b className="ml-auto font-mono text-dark">{r.value}</b>
        </div>
      ))}
    </div>
  );
}

export type VolumePoint = { date: string; count: number };

export function VolumeChart({ data }: { data: VolumePoint[] }) {
  const [days, setDays] = React.useState<7 | 30 | 60>(30);
  const rows = React.useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    return data.filter((d) => new Date(d.date + "T00:00:00") >= start);
  }, [data, days]);

  const growth = React.useMemo(() => {
    const first = rows[0];
    const last = rows[rows.length - 1];
    if (!first || !last || !first.count) return 0;
    return ((last.count - first.count) / first.count) * 100;
  }, [rows]);

  const fmtDay = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const fmtFull = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <Card className="md:col-span-2 lg:col-span-3">
      <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Message volume</CardTitle>
            <Delta value={growth} variant="badge" />
          </div>
          <CardDescription>Customer messages per day for the selected window.</CardDescription>
        </div>
        <select
          aria-label="Message volume time range"
          value={String(days)}
          onChange={(e) => setDays(Number(e.target.value) as 7 | 30 | 60)}
          className="shrink-0 rounded-[9px] border border-[#D2DCD1] bg-white px-3 py-[7px] text-[13px] font-semibold text-dark outline-none focus:border-grn cursor-pointer"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="60">Last 60 days</option>
        </select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={rows} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="cchatVolGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#149A5B" stopOpacity={0.4} />
                <stop offset="55%" stopColor="#149A5B" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#149A5B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#EDF3EE" vertical={false} />
            <XAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              dataKey="date"
              tickFormatter={fmtDay}
              minTickGap={days <= 7 ? 0 : 28}
              tick={{ fill: "#8B9B8F", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={36}
              tick={{ fill: "#8B9B8F", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ stroke: "#BCE5CB", strokeDasharray: "4 4" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as VolumePoint;
                return (
                  <ChartTip
                    title={fmtFull(p.date)}
                    rows={[{ label: "Messages", value: String(p.count), color: "#149A5B" }]}
                  />
                );
              }}
            />
            <Area
              type="natural"
              dataKey="count"
              name="Messages"
              stroke="#149A5B"
              strokeWidth={2}
              fill="url(#cchatVolGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#149A5B", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export type OutcomeSlice = { key: string; label: string; value: number; color: string };

export function OutcomeDonut({
  slices,
  automatedPct,
}: {
  slices: OutcomeSlice[];
  automatedPct: number;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Outcome split</CardTitle>
        <CardDescription>All conversations by result.</CardDescription>
      </CardHeader>
      <CardContent className="my-auto">
        <div className="relative mx-auto h-[190px] w-full max-w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="key"
                innerRadius="62%"
                outerRadius="92%"
                cornerRadius={6}
                paddingAngle={2}
                strokeWidth={0}
              >
                {slices.map((s) => (
                  <Cell key={s.key} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as OutcomeSlice;
                  return (
                    <ChartTip
                      title={p.label}
                      rows={[{ label: "Conversations", value: String(p.value), color: p.color }]}
                    />
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[22px] font-bold text-dark leading-none">{automatedPct}%</span>
            <span className="text-[9px] uppercase tracking-wider text-muted font-bold">auto</span>
          </div>
        </div>
        <ul className="mt-3 flex flex-col gap-1.5 text-[12px]">
          {slices.map((s) => (
            <li key={s.key} className="flex items-center gap-2">
              <i className="size-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-muted">{s.label}</span>
              <b className="ml-auto font-mono text-dark">{total ? Math.round((s.value / total) * 100) : 0}%</b>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export type HandlingBar = { day: string; ai: number; owner: number };

export function HandlingBars({ data }: { data: HandlingBar[] }) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Replies per day</CardTitle>
        <CardDescription>AI vs you, last {data.length} days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }} barCategoryGap="35%">
            <CartesianGrid stroke="#EDF3EE" vertical={false} />
            <XAxis
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              dataKey="day"
              interval={0}
              tick={{ fill: "#8B9B8F", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "#F3F8F4", radius: 8 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <ChartTip
                    title={String(label)}
                    rows={[
                      { label: "AI sent", value: String(payload[0]?.payload.ai ?? 0), color: "#149A5B" },
                      { label: "You sent", value: String(payload[0]?.payload.owner ?? 0), color: "#E8A222" },
                    ]}
                  />
                );
              }}
            />
            <Bar dataKey="owner" stackId="r" fill="#E8A222" radius={[0, 0, 4, 4]} barSize={10} />
            <Bar dataKey="ai" stackId="r" fill="#149A5B" radius={[4, 4, 0, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center gap-4 text-[12px] text-muted">
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-grn" /> AI</span>
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#E8A222]" /> You</span>
        </div>
      </CardContent>
    </Card>
  );
}

export type ReplyPoint = { day: string; minutes: number | null };

export function ReplyLine({ data }: { data: ReplyPoint[] }) {
  const filled = data.map((d) => ({ ...d, minutes: d.minutes ?? 0 }));
  const valid = filled.filter((d) => d.minutes > 0);
  const avg = valid.length ? valid.reduce((s, d) => s + d.minutes, 0) / valid.length : 0;

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Avg first reply</CardTitle>
          <Delta value={0} variant="badge" suffix="m" className={cn(avg > 0 && "hidden")} />
          {avg > 0 && (
            <span className="inline-flex items-center rounded-full bg-grn-bg px-2 py-0.5 text-[11px] font-bold tabular-nums text-grn-d">
              {avg.toFixed(1)}m avg
            </span>
          )}
        </div>
        <CardDescription>Minutes until first reply, last {data.length} days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={filled} margin={{ top: 20, left: 0, right: 12, bottom: 0 }}>
            <CartesianGrid stroke="#EDF3EE" vertical={false} />
            <XAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              dataKey="day"
              interval={0}
              tick={{ fill: "#8B9B8F", fontSize: 11 }}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as ReplyPoint & { minutes: number };
                return (
                  <ChartTip
                    title={p.day}
                    rows={[{ label: "First reply", value: p.minutes > 0 ? p.minutes.toFixed(1) + " min" : "—", color: "#149A5B" }]}
                  />
                );
              }}
            />
            <Line
              type="natural"
              dataKey="minutes"
              stroke="#149A5B"
              strokeWidth={2}
              dot={{ r: 3.5, fill: "#149A5B", stroke: "#fff", strokeWidth: 1.5 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
