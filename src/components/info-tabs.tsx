"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodePanel } from "@/components/code-panel";
import { TutorialPanel } from "@/components/tutorial-panel";
import { AnalysisPanel } from "@/components/analysis-panel";
import type { PerformanceData } from "@/lib/types";

interface InfoTabsProps {
  performanceData: PerformanceData[];
}

export function InfoTabs({ performanceData }: InfoTabsProps) {
  return (
    <Tabs defaultValue="analysis" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-card border">
        <TabsTrigger value="analysis">Analysis</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
        <TabsTrigger value="tutorial">Tutorials</TabsTrigger>
      </TabsList>
      <TabsContent value="analysis" className="mt-4">
        <AnalysisPanel performanceData={performanceData} />
      </TabsContent>
      <TabsContent value="code" className="mt-4">
        <CodePanel />
      </TabsContent>
      <TabsContent value="tutorial" className="mt-4">
        <TutorialPanel />
      </TabsContent>
    </Tabs>
  );
}
