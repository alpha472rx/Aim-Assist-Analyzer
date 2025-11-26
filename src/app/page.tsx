"use client";

import { useState } from "react";
import Header from "@/components/header";
import { SimulationPanel } from "@/components/simulation-panel";
import { InfoTabs } from "@/components/info-tabs";
import type { PerformanceData, SimulationMode } from "@/lib/types";

export default function Home() {
  const [performanceData, setPerformanceData] = useState<Map<SimulationMode, PerformanceData>>(new Map());

  const handleSimulationComplete = (data: PerformanceData) => {
    setPerformanceData(prev => {
      const newMap = new Map(prev);
      newMap.set(data.mode, data);
      return newMap;
    });
  };

  const handleReset = () => {
    setPerformanceData(new Map());
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <SimulationPanel onSimulationComplete={handleSimulationComplete} onReset={handleReset} />
          </div>
          <div className="lg:col-span-2">
            <InfoTabs performanceData={Array.from(performanceData.values())} />
          </div>
        </div>
      </main>
    </div>
  );
}
