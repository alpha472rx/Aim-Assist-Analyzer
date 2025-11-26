"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PerformanceData } from "@/lib/types";
import { FileQuestion } from "lucide-react";

interface AnalysisPanelProps {
  performanceData: PerformanceData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-2 border border-border rounded-md shadow-lg text-popover-foreground">
        <p className="label font-bold">{`${label}`}</p>
        {payload.map((pld: any) => (
           <p key={pld.dataKey} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value.toFixed(pld.dataKey === 'accuracy' ? 2 : 0)}${pld.dataKey === 'accuracy' ? '%' : 'ms'}`}
            </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalysisPanel({ performanceData }: AnalysisPanelProps) {
  const chartData = performanceData.map(d => ({
    name: d.mode,
    'Time to Eliminate (ms)': d.timeToEliminate,
    'Accuracy (%)': d.accuracy,
  }));

  if (performanceData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-96">
            <FileQuestion className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">No Analysis Data</p>
            <p className="text-sm">Run a simulation to see performance analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Time to Eliminate</CardTitle>
          <CardDescription>Time taken to defeat the enemy in milliseconds (lower is better).</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--card))' }} />
              <Legend />
              <Bar dataKey="Time to Eliminate (ms)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Accuracy</CardTitle>
          <CardDescription>Percentage of shots that hit the target (higher is better).</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis unit="%" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--card))' }} />
              <Legend />
              <Bar dataKey="Accuracy (%)" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
