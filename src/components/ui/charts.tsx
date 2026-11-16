"use client";

import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/ui/empty-state";

export const CHART_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"];

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
}

interface ChartFrameProps {
  isEmpty: boolean;
  height?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  children: React.ReactElement;
}

function ChartFrame({ isEmpty, height = 256, emptyTitle, emptyDescription, children }: ChartFrameProps) {
  if (isEmpty) {
    return (
      <EmptyState
        icon={BarChart3}
        title={emptyTitle ?? "No data yet"}
        description={emptyDescription ?? "This chart will populate once data is available."}
        className="py-6"
      />
    );
  }
  return (
    <div style={{ height }} role="img">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

const axisStyle = { fontSize: 12 };

interface SeriesChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: ChartSeries[];
  height?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  valueFormatter?: (value: number) => string;
}

export function BarSeriesChart({ data, xKey, series, height, emptyTitle, emptyDescription, valueFormatter }: SeriesChartProps) {
  return (
    <ChartFrame isEmpty={data.length === 0} height={height} emptyTitle={emptyTitle} emptyDescription={emptyDescription}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
        <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={48} tickFormatter={valueFormatter} />
        <Tooltip formatter={valueFormatter ? (v) => valueFormatter(Number(v)) : undefined} />
        {series.length > 1 && <Legend />}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color ?? CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ChartFrame>
  );
}

export function LineSeriesChart({ data, xKey, series, height, emptyTitle, emptyDescription, valueFormatter }: SeriesChartProps) {
  return (
    <ChartFrame isEmpty={data.length === 0} height={height} emptyTitle={emptyTitle} emptyDescription={emptyDescription}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
        <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={48} tickFormatter={valueFormatter} />
        <Tooltip formatter={valueFormatter ? (v) => valueFormatter(Number(v)) : undefined} />
        {series.length > 1 && <Legend />}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ChartFrame>
  );
}

interface DonutChartProps {
  data: { name: string; value: number }[];
  height?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  valueFormatter?: (value: number) => string;
}

export function DonutChart({ data, height = 224, emptyTitle, emptyDescription, valueFormatter }: DonutChartProps) {
  const hasValue = data.some((d) => d.value > 0);
  return (
    <ChartFrame isEmpty={!hasValue} height={height} emptyTitle={emptyTitle} emptyDescription={emptyDescription}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={valueFormatter ? (v) => valueFormatter(Number(v)) : undefined} />
        <Legend />
      </PieChart>
    </ChartFrame>
  );
}
